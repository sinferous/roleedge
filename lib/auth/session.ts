import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

// AUTH_PROVIDER=local (default): email + password from env, HMAC-signed session cookie.
// A stand-in so the admin area works before Supabase exists; production refuses it.
// AUTH_PROVIDER=supabase will use magic links and the admin_users allowlist (docs/SECURITY.md §2).

const COOKIE = "re_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

export type Admin = { email: string; role: "owner" | "admin" };

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters) to use the admin area");
  return value;
}

function assertLocalAllowed() {
  if ((process.env.AUTH_PROVIDER ?? "local") !== "local") throw new Error("Only AUTH_PROVIDER=local is implemented");
  if (process.env.VERCEL_ENV === "production") throw new Error("AUTH_PROVIDER=local cannot be used in production");
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Admin emails from ADMIN_EMAILS (comma-separated). The first one is the owner. */
function allowlist() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function checkCredentials(email: string, password: string): Admin | null {
  assertLocalAllowed();
  const expected = process.env.ADMIN_LOCAL_PASSWORD ?? "";
  const list = allowlist();
  const normalised = email.trim().toLowerCase();
  // Compare the password even for unknown emails so timing doesn't reveal which emails exist.
  const passwordOk = expected.length >= 12 && safeEqual(sign(password), sign(expected));
  if (!passwordOk || !list.includes(normalised)) return null;
  return { email: normalised, role: list[0] === normalised ? "owner" : "admin" };
}

export async function startSession(admin: Admin) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = Buffer.from(JSON.stringify({ e: admin.email, r: admin.role, x: expires })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function getAdmin(): Promise<Admin | null> {
  assertLocalAllowed();
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { e: string; r: Admin["role"]; x: number };
    if (data.x < Date.now() / 1000) return null;
    // Re-check the allowlist so removing an email revokes access immediately.
    if (!allowlist().includes(data.e)) return null;
    return { email: data.e, role: data.r };
  } catch {
    return null;
  }
}

/** Signed-out visitors go to the login page; anything else that fails is a 404. */
export async function requireAdmin(): Promise<Admin> {
  // Admin views are always rendered per request, never prerendered.
  await connection();
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireOwner(): Promise<Admin> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") notFound();
  return admin;
}
