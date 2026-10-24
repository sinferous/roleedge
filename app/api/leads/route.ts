import { getStore } from "@/lib/data";
import { sendEmail, teamInbox } from "@/lib/email";
import { templates } from "@/lib/email/templates";
import { dedupeKey, withPublicGuards } from "@/lib/security/guards";
import { contactSchema } from "@/lib/validation";

export const POST = withPublicGuards(
  { route: "leads", schema: contactSchema, rateLimit: { max: 5, windowSeconds: 600 } },
  async ({ data }) => {
    const store = getStore();
    const { lead, duplicate } = await store.createLead({
      source: "contact_form",
      topic: data.topic,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      message: data.message || null,
      consentAt: new Date().toISOString(),
      consentTextVersion: data.consentTextVersion,
      utm: Object.fromEntries(Object.entries(data.utm ?? {}).filter(([, v]) => v)) as Record<string, string>,
      dedupeKey: dedupeKey(data.email, "contact_form", data.topic),
    });
    if (duplicate) return Response.json({ id: lead.id, status: "received" }, { status: 409 });

    // The lead is already saved; a failed email is flagged for manual follow-up, not reported to the visitor.
    const results = await Promise.all([
      sendEmail(templates.leadAck(lead.email, lead.name)),
      sendEmail({ ...templates.leadTeamNotify(lead.id, lead.topic, lead.source), to: teamInbox() }),
    ]);
    await store.setNotificationStatus(lead.id, results.every((r) => r.ok) ? "sent" : "failed");

    return Response.json({ id: lead.id, status: "received" }, { status: 201 });
  },
);
