import "server-only";
import type { BookingProvider } from "./provider";
import { generateWeek, toIstIso, weekStartIst } from "./slots";

export const mockBookingProvider: BookingProvider = {
  name: "mock",
  async getSlots({ service, weekStart, now = new Date() }) {
    return generateWeek(service, weekStart, now);
  },
  async isSlotAvailable({ service, slotStart, now = new Date() }) {
    const canonical = toIstIso(slotStart);
    if (!canonical) return false;
    const week = generateWeek(service, weekStartIst(new Date(canonical)), now);
    return week.some((d) => d.slots.some((s) => s.start === canonical));
  },
  async createRequest() {
    // The mock keeps no external record; the request lives only in our own store.
    return { providerRef: null };
  },
};
