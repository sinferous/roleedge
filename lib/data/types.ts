import type { bookingStatuses, leadStatuses } from "@/lib/validation";

// Row shapes mirror the Supabase tables in docs/DATABASE.md, in camelCase.

export type LeadStatus = (typeof leadStatuses)[number];
export type BookingStatus = (typeof bookingStatuses)[number];
export type LeadSource = "contact_form" | "booking" | "planner" | "resource";
export type NotifyStatus = "pending" | "sent" | "failed";

export type Lead = {
  id: string;
  source: LeadSource;
  topic: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: LeadStatus;
  consentAt: string;
  consentTextVersion: string;
  utm: Record<string, string>;
  notificationStatus: NotifyStatus;
  dedupeKey: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadNote = { id: string; leadId: string; authorEmail: string; body: string; createdAt: string };

export type BookingRequest = {
  id: string;
  leadId: string;
  serviceSlug: string;
  slotStart: string;
  slotMinutes: number;
  timezone: string;
  provider: string;
  providerRef: string | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export type PlannerResult = {
  id: string;
  leadId: string | null;
  email: string;
  answers: Record<string, string>;
  planVersion: string;
  consentAt: string;
  createdAt: string;
};

export type AuditEntry = {
  id: number;
  actorEmail: string;
  action: string;
  entity: "lead" | "booking_request";
  entityId: string | null;
  diff: Record<string, unknown>;
  createdAt: string;
};

export type NewLead = Omit<Lead, "id" | "status" | "notificationStatus" | "createdAt" | "updatedAt">;

export interface DataStore {
  readonly name: "file" | "supabase";
  createLead(input: NewLead): Promise<{ lead: Lead; duplicate: boolean }>;
  findLatestLeadByEmail(email: string): Promise<Lead | null>;
  setNotificationStatus(leadId: string, status: NotifyStatus): Promise<void>;
  createBookingRequest(input: Omit<BookingRequest, "id" | "status" | "createdAt" | "updatedAt">): Promise<BookingRequest>;
  createPlannerResult(input: Omit<PlannerResult, "id" | "createdAt">): Promise<PlannerResult>;

  listLeads(filter: { status?: LeadStatus; source?: LeadSource; q?: string }): Promise<Lead[]>;
  getLead(id: string): Promise<{ lead: Lead; notes: LeadNote[]; bookings: BookingRequest[]; audit: AuditEntry[] } | null>;
  updateLeadStatus(id: string, status: LeadStatus, actorEmail: string): Promise<void>;
  addLeadNote(leadId: string, body: string, authorEmail: string): Promise<void>;
  deleteLead(id: string, actorEmail: string): Promise<void>;
  listBookings(filter: { status?: BookingStatus }): Promise<(BookingRequest & { lead: Pick<Lead, "name" | "email"> })[]>;
  getBooking(id: string): Promise<BookingRequest | null>;
  updateBookingStatus(id: string, status: BookingStatus, actorEmail: string): Promise<void>;

  /** Returns true when the request is allowed. */
  hitRateLimit(key: string, windowSeconds: number, max: number): Promise<boolean>;
}
