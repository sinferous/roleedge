import { getAdmin } from "@/lib/auth/session";
import { toCsv } from "@/lib/csv";
import { getStore, type LeadSource, type LeadStatus } from "@/lib/data";
import { apiError } from "@/lib/security/guards";
import { leadStatuses } from "@/lib/validation";

export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin || admin.role !== "owner") return apiError(404, "not_found", "Not found.");

  const url = new URL(request.url);
  const status = url.searchParams.get("status") as LeadStatus | null;
  const source = url.searchParams.get("source") as LeadSource | null;
  const leads = await getStore().listLeads({
    status: status && leadStatuses.includes(status) ? status : undefined,
    source: source ?? undefined,
  });

  const csv = toCsv(
    ["Received (UTC)", "Name", "Email", "Phone", "Topic", "Source", "Status", "Message"],
    leads.map((l) => [l.createdAt, l.name, l.email, l.phone ?? "", l.topic, l.source, l.status, l.message ?? ""]),
  );
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="roleedge-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
