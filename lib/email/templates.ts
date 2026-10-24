import "server-only";
import { site } from "@/lib/site";
import type { Email } from "./index";

// Plain-text templates. When Resend is connected these become React Email components
// with the same wording (docs/API.md §6).

const signOff = `\n\nRoleEdge\n${site.email}\n${site.url}`;

const formatSlot = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }) + " IST";

export const templates = {
  leadAck: (to: string, name: string): Email => ({
    template: "lead-ack",
    to,
    replyTo: site.email,
    subject: "We’ve received your message",
    text: `Hi ${name},\n\nThanks for getting in touch with RoleEdge. We’ll read your message and reply within one working day.\n\nIf it’s urgent, reply to this email.${signOff}`,
  }),
  leadTeamNotify: (leadId: string, topic: string, source: string): Email => ({
    template: "lead-team-notify",
    to: "",
    subject: `New ${source.replace("_", " ")} enquiry: ${topic}`,
    // Personal details stay in the admin area rather than in email bodies.
    text: `A new enquiry has arrived.\n\nTopic: ${topic}\nSource: ${source}\n\nOpen it in the admin area:\n${site.url}/admin/leads/${leadId}`,
  }),
  bookingRequestAck: (to: string, name: string, slotStart: string, serviceTitle: string): Email => ({
    template: "booking-request-ack",
    to,
    replyTo: site.email,
    subject: "Your call request has been received",
    text: `Hi ${name},\n\nThanks for requesting a free call about ${serviceTitle}.\n\nRequested time: ${formatSlot(slotStart)}\n\nThis is a request, not a confirmed booking yet. We’ll confirm the time, or suggest another, by email within one working day.${signOff}`,
  }),
  bookingConfirmed: (to: string, name: string, slotStart: string): Email => ({
    template: "booking-confirmed",
    to,
    replyTo: site.email,
    subject: "Your call with RoleEdge is confirmed",
    text: `Hi ${name},\n\nYour free call is confirmed for ${formatSlot(slotStart)}. We’ll send the meeting link before the call.\n\nIf you need to change the time, reply to this email.${signOff}`,
  }),
  bookingDeclined: (to: string, name: string, slotStart: string): Email => ({
    template: "booking-declined",
    to,
    replyTo: site.email,
    subject: "About your requested call time",
    text: `Hi ${name},\n\nUnfortunately ${formatSlot(slotStart)} no longer works on our side. Reply to this email with a few times that suit you, or request another slot at ${site.url}/book.${signOff}`,
  }),
  resourceLink: (to: string, name: string, title: string, path: string): Email => ({
    template: "resource-link",
    to,
    replyTo: site.email,
    subject: `Your ${title}, from RoleEdge`,
    text: `Hi ${name},

Here is the ${title} you downloaded, in case you need it again:
${site.url}${path}

Print it and fill it in. When you want someone to check your work, book a free call: ${site.url}/book${signOff}`,
  }),
  plannerPlan: (to: string, planText: string): Email => ({
    template: "planner-plan",
    to,
    replyTo: site.email,
    subject: "Your starting point, from RoleEdge",
    text: `Here are the next steps you asked us to send.\n\n${planText}\n\nWhen you’re ready to talk them through, book a free call: ${site.url}/book${signOff}`,
  }),
};
