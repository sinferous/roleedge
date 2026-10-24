import { z } from "zod";

// Shared by client forms (for instant feedback) and route handlers (authoritative).
// Messages are written for visitors. Limits match docs/DATABASE.md column checks.

const name = z.string().trim().min(1, "Enter your name.").max(120, "Use 120 characters or fewer.");
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "Use 254 characters or fewer.")
  .pipe(z.email("Enter a valid email address, like name@example.com."));
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a phone number with 7 to 20 digits, or leave it blank.")
  .optional()
  .or(z.literal("").transform(() => undefined));
const consent = z.literal(true, { error: "Please confirm you’re happy for us to contact you." });
const consentTextVersion = z.string().min(1).max(20);
const turnstileToken = z.string().max(2048).optional();

export const topics = [
  ["mba_admissions", "MBA or master’s admissions"],
  ["consulting", "Consulting interviews"],
  ["career_change", "A career change"],
  ["resume_linkedin", "Resume & LinkedIn"],
  ["institution", "University or company programme"],
  ["edgeai", "EdgeAI"],
  ["other", "Something else"],
] as const;

const utm = z
  .object({
    utm_source: z.string().max(100).optional(),
    utm_medium: z.string().max(100).optional(),
    utm_campaign: z.string().max(100).optional(),
  })
  .optional();

export const contactSchema = z.object({
  name,
  email,
  phone,
  topic: z.enum(topics.map(([v]) => v) as [string, ...string[]], { error: "Choose a topic." }),
  message: z.string().trim().max(4000, "Use 4,000 characters or fewer.").optional().or(z.literal("")),
  consent,
  consentTextVersion,
  utm,
  turnstileToken,
});
export type ContactInput = z.infer<typeof contactSchema>;

export const bookingRequestSchema = z.object({
  service: z.enum(["mba-admissions", "consulting-career-moves", "resume-linkedin"], { error: "Choose a service." }),
  slotStart: z.iso.datetime({ offset: true, error: "Choose a time." }),
  timezone: z.string().max(64),
  name,
  email,
  phone,
  note: z.string().trim().max(1000, "Use 1,000 characters or fewer.").optional().or(z.literal("")),
  consent,
  consentTextVersion,
  turnstileToken,
});
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export const plannerEmailSchema = z.object({
  email,
  answers: z.object({
    goal: z.enum(["admissions", "consulting", "career", "profile"]),
    stage: z.enum(["exploring", "focused", "preparing"]),
    timing: z.enum(["soon", "quarter", "ahead"]),
  }),
  planVersion: z.string().max(20),
  consent,
  consentTextVersion,
  turnstileToken,
});
export type PlannerEmailInput = z.infer<typeof plannerEmailSchema>;

export const leadStatuses = ["new", "contacted", "qualified", "closed", "spam"] as const;
export const bookingStatuses = ["requested", "confirmed", "declined", "cancelled", "completed"] as const;

/** Flatten Zod issues into { field: message } for the API error shape. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    out[key] ??= issue.message;
  }
  return out;
}
