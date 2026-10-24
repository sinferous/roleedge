import "server-only";
import { mockBookingProvider } from "./mock";

export type Slot = { start: string; minutes: number };
export type SlotDay = { date: string; slots: Slot[] };

export interface BookingProvider {
  readonly name: "mock" | "calcom" | "zoho" | "google";
  getSlots(input: { service: string; weekStart: string; tz: string; now?: Date }): Promise<SlotDay[]>;
  isSlotAvailable(input: { service: string; slotStart: string; now?: Date }): Promise<boolean>;
  createRequest(input: { service: string; slotStart: string }): Promise<{ providerRef: string | null }>;
}

// Real providers implement the same interface (docs/INTEGRATIONS.md §6) and are selected here.
export function getBookingProvider(): BookingProvider {
  const name = process.env.BOOKING_PROVIDER ?? "mock";
  if (name === "mock") return mockBookingProvider;
  throw new Error(`Booking provider "${name}" is not implemented yet`);
}
