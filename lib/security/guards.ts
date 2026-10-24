import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { z } from "zod";
import { getStore } from "@/lib/data";
import { fieldErrors } from "@/lib/validation";
import { log } from "@/lib/log";
import { verifyTurnstile } from "./turnstile";

// One guard chain for every public POST endpoint (docs/API.md §1):
// request ID → Origin check → rate limit → JSON parse → Zod validation → Turnstile.

type GuardOptions<S extends z.ZodType> = {
  route: string;
  schema: S;
  rateLimit: { max: number; windowSeconds: number };
};

type Handler<S extends z.ZodType> = (ctx: { data: z.infer<S>; requestId: string; ip: string }) => Promise<Response>;

export function apiError(status: number, code: string, message: string, extra: Record<string, unknown> = {}, headers?: HeadersInit) {
  return Response.json({ error: { code, message, ...extra } }, { status, headers });
}

function allowedOrigins() {
  const origins = new Set<string>();
  if (process.env.NEXT_PUBLIC_SITE_URL) origins.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
  for (const v of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) if (v) origins.add(`https://${v}`);
  return origins;
}

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

/** Raw IPs are never stored; only a salted, day-scoped hash is used as a rate-limit key. */
function rateKey(ip: string, route: string) {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${ip}|${route}|${day}|${process.env.RATE_LIMIT_SALT ?? "local"}`).digest("hex");
}

export function withPublicGuards<S extends z.ZodType>(options: GuardOptions<S>, handler: Handler<S>) {
  return async (request: Request) => {
    const requestId = randomUUID();
    const headers = { "x-request-id": requestId };
    try {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      const sameHost = origin && host && new URL(origin).host === host;
      if (!origin || (!sameHost && !allowedOrigins().has(origin))) {
        return apiError(403, "origin_rejected", "This request came from an unexpected place.", {}, headers);
      }

      const ip = clientIp(request);
      const allowed = await getStore().hitRateLimit(rateKey(ip, options.route), options.rateLimit.windowSeconds, options.rateLimit.max);
      if (!allowed) {
        return apiError(429, "rate_limited", "Too many attempts. Please wait a few minutes and try again.", {}, {
          ...headers,
          "retry-after": String(options.rateLimit.windowSeconds),
        });
      }

      const body = await request.json().catch(() => null);
      const parsed = options.schema.safeParse(body);
      if (!parsed.success) {
        return apiError(400, "validation_failed", "Some fields need attention.", { fields: fieldErrors(parsed.error) }, headers);
      }

      const token = (parsed.data as { turnstileToken?: string }).turnstileToken;
      if (!(await verifyTurnstile(token, ip))) {
        return apiError(400, "turnstile_failed", "We couldn’t confirm you’re not a bot. Please try again.", {}, headers);
      }

      const response = await handler({ data: parsed.data, requestId, ip });
      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      log.error("api.unhandled", { route: options.route, requestId, error: error instanceof Error ? error.message : String(error) });
      return apiError(500, "internal", "Something went wrong on our side. Please try again, or email info@roleedge.com.", {}, headers);
    }
  };
}

/** sha256(lower(email)|source|topic|minute) so double-clicks and retries create one lead. */
export function dedupeKey(email: string, source: string, topic: string) {
  const minute = Math.floor(Date.now() / 60_000);
  return createHash("sha256").update(`${email.toLowerCase()}|${source}|${topic}|${minute}`).digest("hex");
}
