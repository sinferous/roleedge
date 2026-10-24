import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { log } from "@/lib/log";

export type Email = { to: string; subject: string; text: string; replyTo?: string; template: string };

// EMAIL_PROVIDER=console (default) writes each email to .data/outbox/ so it can be read locally.
// EMAIL_PROVIDER=resend will send through Resend once the domain is verified (docs/INTEGRATIONS.md §3).
export async function sendEmail(email: Email): Promise<{ ok: boolean }> {
  const provider = process.env.EMAIL_PROVIDER ?? "console";
  try {
    if (provider === "console") {
      if (process.env.VERCEL_ENV === "production") throw new Error("EMAIL_PROVIDER=console cannot be used in production");
      const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), ".data", "outbox");
      await mkdir(dir, { recursive: true });
      const file = path.join(dir, `${new Date().toISOString().replace(/[:.]/g, "-")}-${email.template}.txt`);
      await writeFile(file, `To: ${email.to}\nSubject: ${email.subject}\n${email.replyTo ? `Reply-To: ${email.replyTo}\n` : ""}\n${email.text}\n`);
      log.info("email.written_to_outbox", { template: email.template });
      return { ok: true };
    }
    throw new Error(`Email provider "${provider}" is not implemented yet`);
  } catch (error) {
    log.error("email.send_failed", { template: email.template, error: error instanceof Error ? error.message : String(error) });
    return { ok: false };
  }
}

export const teamInbox = () => process.env.EMAIL_TEAM_INBOX ?? "info@roleedge.com";
