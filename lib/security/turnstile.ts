import "server-only";
import { log } from "@/lib/log";

/**
 * Verify a Cloudflare Turnstile token. Without a secret configured, verification is skipped
 * outside production so the site runs locally; production refuses to run without one.
 */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.VERCEL_ENV === "production") throw new Error("TURNSTILE_SECRET_KEY is required in production");
    return true;
  }
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip !== "local") body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const json = (await res.json()) as { success: boolean; hostname?: string };
    return json.success === true;
  } catch (error) {
    log.warn("turnstile.verify_failed", { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}
