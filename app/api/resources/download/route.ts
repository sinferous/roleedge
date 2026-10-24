import { getStore } from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { templates } from "@/lib/email/templates";
import { resources } from "@/lib/content/resources";
import { apiError, dedupeKey, withPublicGuards } from "@/lib/security/guards";
import { resourceDownloadSchema } from "@/lib/validation";

// Saves the visitor's name and email as a lead before a free PDF download, and emails them the link.
// The browser starts the download once this returns.
export const POST = withPublicGuards(
  { route: "resource-download", schema: resourceDownloadSchema, rateLimit: { max: 20, windowSeconds: 600 } },
  async ({ data }) => {
    const resource = resources.find((r) => r.slug === data.resource);
    if (!resource) return apiError(404, "not_found", "We couldn’t find that resource.");
    const path = `/downloads/${resource.slug}.pdf`;

    const store = getStore();
    const { lead, duplicate } = await store.createLead({
      source: "resource",
      topic: resource.slug,
      name: data.name,
      email: data.email,
      phone: null,
      message: null,
      consentAt: new Date().toISOString(),
      consentTextVersion: data.consentTextVersion,
      utm: {},
      dedupeKey: dedupeKey(data.email, "resource", resource.slug),
    });
    if (duplicate) return Response.json({ href: path }, { status: 200 });

    const sent = await sendEmail(templates.resourceLink(lead.email, lead.name, resource.title, path));
    await store.setNotificationStatus(lead.id, sent.ok ? "sent" : "failed");
    return Response.json({ href: path }, { status: 201 });
  },
);
