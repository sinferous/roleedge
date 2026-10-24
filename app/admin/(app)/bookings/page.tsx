import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getStore, type BookingStatus } from "@/lib/data";
import { bookingStatuses } from "@/lib/validation";
import { updateBookingStatus } from "../../actions";
import { formatDateTime, serviceLabel, StatusBadge } from "../admin-format";

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = bookingStatuses.includes(sp.status as BookingStatus) ? (sp.status as BookingStatus) : undefined;
  const bookings = await getStore().listBookings({ status });

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Call requests</h1>
          <p>Requested times are not confirmed until you change them to “confirmed”, which emails the visitor.</p>
        </div>
      </div>
      <form className="admin-filters">
        <label>
          Status
          <select className="field-control field-select" name="status" defaultValue={status ?? ""}>
            <option value="">All</option>
            {bookingStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="button button-small button-dark">
          Filter
        </button>
      </form>
      <div className="admin-table-wrap">
        {bookings.length === 0 ? (
          <p className="empty-state">No call requests yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Requested time (IST)</th>
                <th scope="col">Person</th>
                <th scope="col">Service</th>
                <th scope="col">Status</th>
                <th scope="col">Change</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{formatDateTime(b.slotStart)}</td>
                  <td>
                    <Link href={`/admin/leads/${b.leadId}`}>{b.lead.name}</Link>
                    <span className="sub">{b.lead.email}</span>
                  </td>
                  <td>{serviceLabel[b.serviceSlug] ?? b.serviceSlug}</td>
                  <td>
                    <StatusBadge status={b.status} />
                  </td>
                  <td>
                    <form action={updateBookingStatus} className="inline-form">
                      <input type="hidden" name="id" value={b.id} />
                      <select className="field-control field-select" name="status" defaultValue={b.status} aria-label={`Status for ${b.lead.name}`}>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
