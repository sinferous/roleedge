import { getBookingProvider } from "@/lib/booking/provider";
import { toIstIso } from "@/lib/booking/slots";
import { getService } from "@/lib/content";
import { getStore } from "@/lib/data";
import { sendEmail, teamInbox } from "@/lib/email";
import { templates } from "@/lib/email/templates";
import { apiError, dedupeKey, withPublicGuards } from "@/lib/security/guards";
import { bookingRequestSchema } from "@/lib/validation";

export const POST = withPublicGuards(
  { route: "booking-requests", schema: bookingRequestSchema, rateLimit: { max: 5, windowSeconds: 600 } },
  async ({ data }) => {
    const provider = getBookingProvider();
    const slotStart = toIstIso(data.slotStart);
    if (!slotStart || !(await provider.isSlotAvailable({ service: data.service, slotStart }))) {
      return apiError(400, "validation_failed", "Some fields need attention.", {
        fields: { slotStart: "That time is no longer available. Please choose another." },
      });
    }

    const store = getStore();
    const service = await getService(data.service);
    const { lead } = await store.createLead({
      source: "booking",
      topic: service?.topic ?? "other",
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      message: data.note || null,
      consentAt: new Date().toISOString(),
      consentTextVersion: data.consentTextVersion,
      utm: {},
      dedupeKey: dedupeKey(data.email, "booking", `${data.service}|${slotStart}`),
    });

    const { providerRef } = await provider.createRequest({ service: data.service, slotStart });
    const booking = await store.createBookingRequest({
      leadId: lead.id,
      serviceSlug: data.service,
      slotStart,
      slotMinutes: 30,
      timezone: data.timezone,
      provider: provider.name,
      providerRef,
    });

    const results = await Promise.all([
      sendEmail(templates.bookingRequestAck(lead.email, lead.name, slotStart, service?.title ?? "your goals")),
      sendEmail({ ...templates.leadTeamNotify(lead.id, service?.title ?? data.service, "booking"), to: teamInbox() }),
    ]);
    await store.setNotificationStatus(lead.id, results.every((r) => r.ok) ? "sent" : "failed");

    return Response.json({ id: booking.id, status: booking.status, slotStart }, { status: 201 });
  },
);
