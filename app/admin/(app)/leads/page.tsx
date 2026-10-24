import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getStore, type LeadSource, type LeadStatus } from "@/lib/data";
import { leadStatuses } from "@/lib/validation";
import { formatDateTime, sourceLabel, StatusBadge, topicLabel } from "../admin-format";

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = leadStatuses.includes(sp.status as LeadStatus) ? (sp.status as LeadStatus) : undefined;
  const source = typeof sp.source === "string" && sp.source in sourceLabel ? (sp.source as LeadSource) : undefined;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : undefined;
  const leads = await getStore().listLeads({ status, source, q });
  const exportQs = new URLSearchParams({ ...(status && { status }), ...(source && { source }) }).toString();

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Leads</h1>
          <p>Enquiries from the contact form, call requests and planner emails.</p>
        </div>
        <a className="button button-small button-dark" href={`/api/admin/leads/export${exportQs ? `?${exportQs}` : ""}`}>
          Export CSV
        </a>
      </div>
      {sp.deleted && (
        <p className="form-success" role="status" style={{ marginBottom: 18 }}>
          All data for that person has been deleted.
        </p>
      )}
      <form className="admin-filters" role="search">
        <label>
          Search
          <input className="field-control" name="q" defaultValue={q} placeholder="Name, email or message" />
        </label>
        <label>
          Status
          <select className="field-control field-select" name="status" defaultValue={status ?? ""}>
            <option value="">All</option>
            {leadStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Source
          <select className="field-control field-select" name="source" defaultValue={source ?? ""}>
            <option value="">All</option>
            {Object.entries(sourceLabel).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="button button-small button-dark">
          Filter
        </button>
      </form>
      <div className="admin-table-wrap">
        {leads.length === 0 ? (
          <p className="empty-state">No leads match these filters yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Received</th>
                <th scope="col">Name</th>
                <th scope="col">Topic</th>
                <th scope="col">Source</th>
                <th scope="col">Status</th>
                <th scope="col">Emails</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>{formatDateTime(l.createdAt)}</td>
                  <td>
                    <Link href={`/admin/leads/${l.id}`}>{l.name}</Link>
                    <span className="sub">{l.email}</span>
                  </td>
                  <td>{topicLabel(l.topic)}</td>
                  <td>{sourceLabel[l.source]}</td>
                  <td>
                    <StatusBadge status={l.status} />
                  </td>
                  <td>{l.notificationStatus === "failed" ? <StatusBadge status="failed" /> : l.notificationStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
