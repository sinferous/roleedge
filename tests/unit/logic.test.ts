import { describe, expect, it } from "vitest";
import { buildPlan, plannerQuestions } from "@/lib/planner";
import { generateWeek, toIstIso, weekStartIst } from "@/lib/booking/slots";
import { bookingRequestSchema, contactSchema, fieldErrors, plannerEmailSchema } from "@/lib/validation";
import { toCsv } from "@/lib/csv";
import { posts } from "@/lib/content/posts";
import { services } from "@/lib/content/services";
import { stories } from "@/lib/content/stories";
import { legacyRedirects } from "@/lib/content/redirects";

describe("planner", () => {
  it("builds a plan with three steps for every answer combination", () => {
    const [goals, stages, timings] = plannerQuestions.map((q) => q.options.map(([v]) => v));
    for (const goal of goals)
      for (const stage of stages)
        for (const timing of timings) {
          const plan = buildPlan({ goal, stage, timing } as never);
          expect(plan.steps).toHaveLength(3);
          expect(plan.steps.every(Boolean)).toBe(true);
          expect(services.some((s) => s.slug === plan.service)).toBe(true);
        }
  });

  it("swaps the first step for explorers and for people already preparing", () => {
    const focused = buildPlan({ goal: "consulting", stage: "focused", timing: "soon" });
    const exploring = buildPlan({ goal: "consulting", stage: "exploring", timing: "soon" });
    const preparing = buildPlan({ goal: "consulting", stage: "preparing", timing: "soon" });
    expect(exploring.steps[0]).not.toBe(focused.steps[0]);
    expect(preparing.steps[0]).not.toBe(focused.steps[0]);
    expect(exploring.steps.slice(1)).toEqual(focused.steps.slice(1));
  });
});

describe("placeholder booking slots", () => {
  const now = new Date("2026-10-21T09:00:00+05:30"); // a Wednesday morning in IST

  it("finds the IST Monday of the week", () => {
    expect(weekStartIst(now)).toBe("2026-10-19");
    // Sunday late evening in IST still belongs to the week that started on Monday.
    expect(weekStartIst(new Date("2026-10-25T23:30:00+05:30"))).toBe("2026-10-19");
  });

  it("offers Monday to Saturday only, 10:00–19:00 IST, never within 24 hours", () => {
    const days = generateWeek("consulting-career-moves", "2026-10-19", now);
    expect(days.map((d) => d.date)).toEqual(["2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24"]);
    const all = days.flatMap((d) => d.slots);
    expect(all.length).toBeGreaterThan(0);
    for (const s of all) {
      expect(new Date(s.start).getTime()).toBeGreaterThanOrEqual(now.getTime() + 24 * 3_600_000);
      const hour = Number(s.start.slice(11, 13));
      expect(hour).toBeGreaterThanOrEqual(10);
      expect(hour).toBeLessThan(19);
    }
  });

  it("is deterministic for the same input", () => {
    expect(generateWeek("mba-admissions", "2026-10-26", now)).toEqual(generateWeek("mba-admissions", "2026-10-26", now));
  });

  it("normalises any offset to IST", () => {
    expect(toIstIso("2026-10-22T05:00:00Z")).toBe("2026-10-22T10:30:00+05:30");
    expect(toIstIso("not a date")).toBeNull();
  });
});

describe("validation", () => {
  const contact = { name: " Priya ", email: "Priya@Example.com ", topic: "consulting", consent: true, consentTextVersion: "2026-10" };

  it("accepts a valid contact and normalises it", () => {
    const r = contactSchema.parse(contact);
    expect(r.name).toBe("Priya");
    expect(r.email).toBe("priya@example.com");
  });

  it("rejects missing consent, bad email and bad phone with visitor-facing messages", () => {
    const r = contactSchema.safeParse({ ...contact, consent: false, email: "nope", phone: "abc" });
    expect(r.success).toBe(false);
    const fields = fieldErrors(r.error!);
    expect(Object.keys(fields).sort()).toEqual(["consent", "email", "phone"]);
    expect(fields.email).toMatch(/valid email/);
  });

  it("treats an empty phone as not given", () => {
    expect(contactSchema.parse({ ...contact, phone: "" }).phone).toBeUndefined();
  });

  it("requires a real service and an ISO time for bookings", () => {
    const base = { service: "mba-admissions", slotStart: "2026-11-02T10:30:00+05:30", timezone: "Asia/Kolkata", name: "A", email: "a@example.com", consent: true, consentTextVersion: "v" };
    expect(bookingRequestSchema.safeParse(base).success).toBe(true);
    expect(bookingRequestSchema.safeParse({ ...base, service: "other" }).success).toBe(false);
    expect(bookingRequestSchema.safeParse({ ...base, slotStart: "tomorrow" }).success).toBe(false);
  });

  it("only accepts known planner answers", () => {
    const base = { email: "a@example.com", answers: { goal: "career", stage: "focused", timing: "ahead" }, planVersion: "v", consent: true, consentTextVersion: "v" };
    expect(plannerEmailSchema.safeParse(base).success).toBe(true);
    expect(plannerEmailSchema.safeParse({ ...base, answers: { ...base.answers, goal: "<script>" } }).success).toBe(false);
  });
});

describe("CSV export", () => {
  it("neutralises spreadsheet formulas and escapes quotes and newlines", () => {
    const csv = toCsv(["a", "b"], [["=SUM(A1)", 'he said "hi"\nbye']]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain("'=SUM(A1)");
    expect(csv).toContain('"he said ""hi""\nbye"');
  });
});

describe("content rules", () => {
  it("never marks a story approved without consent wiring", () => {
    for (const s of stories) expect(typeof s.consentConfirmed).toBe("boolean");
  });

  it("imports all three blog posts with bodies and redirects their old URLs", () => {
    expect(posts).toHaveLength(3);
    for (const p of posts) {
      expect(p.body.length).toBeGreaterThan(10);
      expect(legacyRedirects).toContainEqual({ from: p.legacyPath!.replace(/\/$/, ""), to: `/blog/${p.slug}` });
    }
  });
});
