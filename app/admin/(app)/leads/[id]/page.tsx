import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getStore } from "@/lib/data";
import { bookingStatuses, leadStatuses } from "@/lib/validation";
import { addLeadNote, deleteLead, updateBookingStatus, updateLeadStatus } from "../../../actions";
import { formatDateTime, serviceLabel, sourceLabel, StatusBadge, topicLabel } from "../../admin-format";

export default async function LeadPage({ params }: PageProps<"/admin/leads/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const record = await getStore().getLead(id);
  if (!record) notFound();
  const { lead, notes, bookings, audit } = record;

  return (
    <>
      <p style={{ marginBottom: 14 }}>
        <Link className="text-link" href="/admin/leads">
          ← All leads
        </Link>
      </p>
      <div className="admin-head">
        <div>
          <h1>{lead.name}</h1>
          <p>
            {sourceLabel[lead.source]} · {formatDateTime(lead.createdAt)}
          </p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="admin-detail">
        <div className="admin-stack">
          <section className="admin-card" aria-labelledby="details-title">
            <h2 id="details-title">Details</h2>
            <dl>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
              </dd>
              <dt>Phone</dt>
              <dd>{lead.phone ?? "—"}</dd>
              <dt>Topic</dt>
              <dd>{topicLabel(lead.topic)}</dd>
              <dt>Consent</dt>
              <dd>
                {formatDateTime(lead.consentAt)} (notice {lead.consentTextVersion})
              </dd>
              <dt>Emails</dt>
              <dd>{lead.notificationStatus === "failed" ? "Failed to send. Follow up manually." : lead.notificationStatus}</dd>
              {Object.keys(lead.utm).length > 0 && (
                <>
                  <dt>Campaign</dt>
                  <dd>{Object.values(lead.utm).join(" · ")}</dd>
                </>
              )}
            </dl>
          </section>

          <section className="admin-card" aria-labelledby="message-title">
            <h2 id="message-title">Message</h2>
            {/* Visitor text is shown as plain text only. */}
            <p className="admin-message">{lead.message ?? "No message."}</p>
          </section>

          {bookings.length > 0 && (
            <section className="admin-card" aria-labelledby="calls-title">
              <h2 id="calls-title">Call requests</h2>
              {bookings.map((b) => (
                <form key={b.id} action={updateBookingStatus} className="inline-form" style={{ marginBottom: 12 }}>
                  <input type="hidden" name="id" value={b.id} />
                  <span style={{ flex: "1 1 220px" }}>
                    <strong>{formatDateTime(b.slotStart)} IST</strong>
                    <span className="sub" style={{ display: "block", color: "var(--muted)", fontSize: 13 }}>
                      {serviceLabel[b.serviceSlug] ?? b.serviceSlug}
                    </span>
                  </span>
                  <select className="field-control field-select" name="status" defaultValue={b.status} aria-label="Call status">
                    {bookingStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="button button-small button-dark">
                    Update
                  </button>
                </form>
              ))}
              <p className="field-hint">Changing to “confirmed” or “declined” emails the visitor.</p>
            </section>
          )}

          <section className="admin-card" aria-labelledby="notes-title">
            <h2 id="notes-title">Notes</h2>
            {notes.length > 0 && (
              <ul className="timeline" style={{ marginBottom: 18 }}>
                {notes.map((n) => (
                  <li key={n.id}>
                    <time dateTime={n.createdAt}>
                      {formatDateTime(n.createdAt)} · {n.authorEmail}
                    </time>
                    <span className="admin-message">{n.body}</span>
                  </li>
                ))}
              </ul>
            )}
            <form action={addLeadNote} className="form-stack">
              <input type="hidden" name="id" value={lead.id} />
              <label className="field-label" htmlFor="note-body">
                Add a note
              </label>
              <textarea id="note-body" name="body" rows={3} maxLength={4000} className="field-control" required />
              <div>
                <button type="submit" className="button button-small button-dark">
                  Save note
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="admin-stack">
          <section className="admin-card" aria-labelledby="status-title">
            <h2 id="status-title">Status</h2>
            <form action={updateLeadStatus} className="inline-form">
              <input type="hidden" name="id" value={lead.id} />
              <select className="field-control field-select" name="status" defaultValue={lead.status} aria-label="Lead status">
                {leadStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="submit" className="button button-small button-dark">
                Update
              </button>
            </form>
          </section>

          <section className="admin-card" aria-labelledby="history-title">
            <h2 id="history-title">History</h2>
            {audit.length === 0 ? (
              <p className="field-hint">No changes yet.</p>
            ) : (
              <ul className="timeline">
                {audit.map((a) => (
                  <li key={a.id}>
                    <time dateTime={a.createdAt}>{formatDateTime(a.createdAt)}</time>
                    {a.actorEmail}: {a.action.replace(/[._]/g, " ")} {"from" in a.diff ? `(${String(a.diff.from)} → ${String(a.diff.to)})` : ""}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {admin.role === "owner" && (
            <section className="admin-card" aria-labelledby="erase-title">
              <h2 id="erase-title">Delete all data</h2>
              <p className="field-hint" style={{ marginBottom: 12 }}>
                For erasure requests. Removes this lead, its notes and call requests permanently. Type “delete” to confirm.
              </p>
              <form action={deleteLead} className="inline-form">
                <input type="hidden" name="id" value={lead.id} />
                <input className="field-control" name="confirm" aria-label="Type delete to confirm" autoComplete="off" required pattern="delete" />
                <button type="submit" className="button button-small button-danger">
                  Delete
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
