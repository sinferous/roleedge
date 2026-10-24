import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuditEntry, BookingRequest, DataStore, Lead, LeadNote, PlannerResult } from "./types";

// Local stand-in for Supabase: one JSON file, written atomically, one writer at a time.
// It exists so the site runs end to end before the Supabase project is created.
// It must never serve production traffic (see getStore in ./index.ts).

type Db = {
  leads: Lead[];
  notes: LeadNote[];
  bookings: BookingRequest[];
  planner: PlannerResult[];
  audit: AuditEntry[];
  rateLimits: Record<string, number>;
};

const empty = (): Db => ({ leads: [], notes: [], bookings: [], planner: [], audit: [], rateLimits: {} });
// Dev-only path; the ignore comment stops the bundler from tracing the whole project into the server build.
const file = path.join(/*turbopackIgnore: true*/ process.cwd(), process.env.DATA_FILE ?? ".data/store.json");

let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Db> {
  try {
    return { ...empty(), ...JSON.parse(await readFile(file, "utf8")) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return empty();
    throw error;
  }
}

async function save(db: Db) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(db, null, 2));
  await rename(tmp, file);
}

/** Serialise read-modify-write cycles so concurrent requests can't overwrite each other. */
function tx<T>(fn: (db: Db) => T | Promise<T>, write = true): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    if (write) await save(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

function audit(db: Db, entry: Omit<AuditEntry, "id" | "createdAt">) {
  db.audit.push({ ...entry, id: (db.audit.at(-1)?.id ?? 0) + 1, createdAt: now() });
}

export const fileStore: DataStore = {
  name: "file",

  createLead(input) {
    return tx((db) => {
      const existing = db.leads.find((l) => l.dedupeKey === input.dedupeKey);
      if (existing) return { lead: existing, duplicate: true };
      const lead: Lead = { ...input, id: id(), status: "new", notificationStatus: "pending", createdAt: now(), updatedAt: now() };
      db.leads.push(lead);
      return { lead, duplicate: false };
    });
  },

  findLatestLeadByEmail(email) {
    return tx((db) => db.leads.filter((l) => l.email === email).at(-1) ?? null, false);
  },

  setNotificationStatus(leadId, status) {
    return tx((db) => {
      const lead = db.leads.find((l) => l.id === leadId);
      if (lead) lead.notificationStatus = status;
    });
  },

  createBookingRequest(input) {
    return tx((db) => {
      const booking: BookingRequest = { ...input, id: id(), status: "requested", createdAt: now(), updatedAt: now() };
      db.bookings.push(booking);
      return booking;
    });
  },

  createPlannerResult(input) {
    return tx((db) => {
      const row: PlannerResult = { ...input, id: id(), createdAt: now() };
      db.planner.push(row);
      return row;
    });
  },

  listLeads({ status, source, q }) {
    return tx((db) => {
      const term = q?.trim().toLowerCase();
      return db.leads
        .filter((l) => (!status || l.status === status) && (!source || l.source === source))
        .filter((l) => !term || `${l.name} ${l.email} ${l.message ?? ""}`.toLowerCase().includes(term))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, false);
  },

  getLead(leadId) {
    return tx((db) => {
      const lead = db.leads.find((l) => l.id === leadId);
      if (!lead) return null;
      return {
        lead,
        notes: db.notes.filter((n) => n.leadId === leadId),
        bookings: db.bookings.filter((b) => b.leadId === leadId),
        audit: db.audit.filter((a) => a.entityId === leadId || db.bookings.some((b) => b.leadId === leadId && b.id === a.entityId)),
      };
    }, false);
  },

  updateLeadStatus(leadId, status, actorEmail) {
    return tx((db) => {
      const lead = db.leads.find((l) => l.id === leadId);
      if (!lead || lead.status === status) return;
      audit(db, { actorEmail, action: "lead.status_changed", entity: "lead", entityId: leadId, diff: { from: lead.status, to: status } });
      lead.status = status;
      lead.updatedAt = now();
    });
  },

  addLeadNote(leadId, body, authorEmail) {
    return tx((db) => {
      if (!db.leads.some((l) => l.id === leadId)) return;
      db.notes.push({ id: id(), leadId, body, authorEmail, createdAt: now() });
    });
  },

  deleteLead(leadId, actorEmail) {
    return tx((db) => {
      const bookingIds = new Set(db.bookings.filter((b) => b.leadId === leadId).map((b) => b.id));
      db.leads = db.leads.filter((l) => l.id !== leadId);
      db.notes = db.notes.filter((n) => n.leadId !== leadId);
      db.bookings = db.bookings.filter((b) => b.leadId !== leadId);
      db.planner = db.planner.map((p) => (p.leadId === leadId ? { ...p, leadId: null } : p));
      db.audit = db.audit.filter((a) => a.entityId !== leadId && !bookingIds.has(a.entityId ?? ""));
      // The erasure itself is recorded without any personal data.
      audit(db, { actorEmail, action: "lead.erased", entity: "lead", entityId: null, diff: {} });
    });
  },

  listBookings({ status }) {
    return tx(
      (db) =>
        db.bookings
          .filter((b) => !status || b.status === status)
          .sort((a, b) => a.slotStart.localeCompare(b.slotStart))
          .map((b) => {
            const lead = db.leads.find((l) => l.id === b.leadId);
            return { ...b, lead: { name: lead?.name ?? "Unknown", email: lead?.email ?? "" } };
          }),
      false,
    );
  },

  getBooking(bookingId) {
    return tx((db) => db.bookings.find((b) => b.id === bookingId) ?? null, false);
  },

  updateBookingStatus(bookingId, status, actorEmail) {
    return tx((db) => {
      const booking = db.bookings.find((b) => b.id === bookingId);
      if (!booking || booking.status === status) return;
      audit(db, {
        actorEmail,
        action: "booking.status_changed",
        entity: "booking_request",
        entityId: bookingId,
        diff: { from: booking.status, to: status },
      });
      booking.status = status;
      booking.updatedAt = now();
    });
  },

  hitRateLimit(key, windowSeconds, max) {
    return tx((db) => {
      const windowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
      const bucket = `${key}|${windowStart}`;
      const count = (db.rateLimits[bucket] ?? 0) + 1;
      db.rateLimits[bucket] = count;
      // Drop buckets older than a day so the file stays small.
      const cutoff = Date.now() / 1000 - 86_400;
      for (const k of Object.keys(db.rateLimits)) if (Number(k.split("|").at(-1)) < cutoff) delete db.rateLimits[k];
      return count <= max;
    });
  },
};
