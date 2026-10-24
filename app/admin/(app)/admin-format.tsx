import { topics } from "@/lib/validation";

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const topicLabel = (topic: string) => topics.find(([v]) => v === topic)?.[1] ?? topic;

export const sourceLabel: Record<string, string> = {
  contact_form: "Contact form",
  booking: "Call request",
  planner: "Planner",
};

export const serviceLabel: Record<string, string> = {
  "mba-admissions": "MBA & master’s admissions",
  "consulting-career-moves": "Consulting & career moves",
  "resume-linkedin": "Resume & LinkedIn",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}
