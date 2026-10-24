"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkCredentials, endSession, requireAdmin, requireOwner, startSession } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { templates } from "@/lib/email/templates";
import { bookingStatuses, leadStatuses } from "@/lib/validation";
import { log } from "@/lib/log";

// The email is returned on failure because React resets the form after an action.
export type LoginState = { error?: string; email?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = createHash("sha256").update(`${ip}|admin-login|${new Date().toISOString().slice(0, 10)}`).digest("hex");
  const email = String(form.get("email") ?? "").slice(0, 254);
  if (!(await getStore().hitRateLimit(key, 900, 10))) return { error: "Too many attempts. Wait 15 minutes and try again.", email };

  const admin = checkCredentials(email, String(form.get("password") ?? ""));
  if (!admin) {
    log.warn("admin.login_failed", {});
    return { error: "That email and password don’t match an admin account.", email };
  }
  await startSession(admin);
  redirect("/admin/leads");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function updateLeadStatus(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  if (!(leadStatuses as readonly string[]).includes(status)) return;
  await getStore().updateLeadStatus(id, status as (typeof leadStatuses)[number], admin.email);
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
}

export async function addLeadNote(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const body = String(form.get("body") ?? "").trim().slice(0, 4000);
  if (!body) return;
  await getStore().addLeadNote(id, body, admin.email);
  revalidatePath(`/admin/leads/${id}`);
}

export async function deleteLead(form: FormData) {
  const owner = await requireOwner();
  if (form.get("confirm") !== "delete") return;
  await getStore().deleteLead(String(form.get("id")), owner.email);
  revalidatePath("/admin/leads");
  redirect("/admin/leads?deleted=1");
}

export async function updateBookingStatus(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  if (!(bookingStatuses as readonly string[]).includes(status)) return;
  const store = getStore();
  const booking = await store.getBooking(id);
  if (!booking || booking.status === status) return;
  await store.updateBookingStatus(id, status as (typeof bookingStatuses)[number], admin.email);

  // Confirmation and decline emails go out only when the status actually changes to them.
  if (status === "confirmed" || status === "declined") {
    const lead = (await store.getLead(booking.leadId))?.lead;
    if (lead) {
      const email = status === "confirmed" ? templates.bookingConfirmed : templates.bookingDeclined;
      await sendEmail(email(lead.email, lead.name, booking.slotStart));
    }
  }
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/leads/${booking.leadId}`);
}
