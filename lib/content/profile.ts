import type { Credential, Destination } from "./types";

export const mayank = {
  name: "Mayank Kapoor",
  role: "Founder, RoleEdge",
  portrait: "/assets/mayank_kapoor.jpg",
  portraitAlt: "Mayank Kapoor, founder of RoleEdge",
  events: "/assets/mayank-events.jpg",
  eventsAlt:
    "Mayank Kapoor speaking at Warwick Business School and Bain & Company events, and mentoring students",
  bio: [
    "Mayank is a Chartered Accountant who moved from finance into strategy consulting. He has worked with Deloitte, KPMG and EY Strategy & Transactions, became a Manager in Bain & Company’s Private Equity Group, and holds an MBA from Warwick Business School.",
    "He founded RoleEdge to help students and professionals choose their next direction, present their experience clearly, and prepare for competitive applications and interviews. His advice draws on years spent making and evaluating those decisions.",
  ],
} as const;

// From Mayank's positioning brief (Client details/RoleEdge_positioning.md, 2026-10-24).
export const credentials: Credential[] = [
  { title: "Former Manager", detail: "Bain & Company · Private Equity Group" },
  { title: "MBA", detail: "Warwick Business School · Poets & Quants 100 MBAs to Watch, 2018" },
  { title: "Chartered Accountant", detail: "ICAI · All India Rank 4, Masters in Business Finance" },
];

// Sizes are the display sizes used in the logo strip.
// "Where mentees have gone": destinations, never partners. TODO(content): confirm logo usage (PRD C5).
export const destinations: Destination[] = [
  { name: "McKinsey & Company", logo: "/assets/placement-logos/mckinsey.png", width: 180, height: 36 },
  { name: "Boston Consulting Group", logo: "/assets/placement-logos/bcg.png", width: 104, height: 44 },
  { name: "Kearney", logo: "/assets/placement-logos/kearney.png", width: 162, height: 36 },
  { name: "Goldman Sachs", logo: "/assets/placement-logos/goldman-sachs.png", width: 86, height: 50 },
  { name: "Capgemini", logo: "/assets/placement-logos/capgemini.png", width: 154, height: 39 },
  { name: "Microsoft", logo: "/assets/placement-logos/microsoft.png", width: 155, height: 36 },
];

// Trust numbers on the home page. Every figure must have a published source.
// "More than 15 years" is confirmed in Mayank's positioning brief (2026-10-24).
export const trustStats = [
  { value: 1000, prefix: "", suffix: "+", label: "Students and professionals mentored", source: "https://roleedge.com/about-us/" },
  { value: 15, prefix: "", suffix: "+", label: "Years across Bain, Deloitte, EY & KPMG", source: "https://roleedge.com/" },
  { value: 7, prefix: "", suffix: "+", label: "Countries where clients are based", source: "https://roleedge.com/" },
  { value: 4, prefix: "AIR ", suffix: "", label: "ICAI rank, Masters in Business Finance", source: "ICAI" },
];

export const countries = [
  "Australia",
  "Canada",
  "Germany",
  "India",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
];

// "How he works" on /about, from the working-style section of his positioning brief.
export const approach = [
  {
    title: "Diagnose before prescribing.",
    body: "After 200 applications and no interviews, the answer is rarely 200 more. He looks first at the targeting, the CV, the channels you’re using and the market.",
  },
  {
    title: "Challenge the assumptions.",
    body: "An MBA isn’t always needed for consulting, and a new country doesn’t automatically mean better prospects. He tests those beliefs so you decide on evidence.",
  },
  {
    title: "Have the difficult conversation.",
    body: "Some moves need more experience, preparation or time. He would rather say so plainly than encourage a plan you aren’t ready for.",
  },
];

export const edgeaiTools = [
  {
    title: "Resume building and review",
    body: "Check structure, relevance and achievement writing against the role you want.",
  },
  {
    title: "Job matching and skill gaps",
    body: "See where your profile fits a role and which experience you still need to show.",
  },
  {
    title: "LinkedIn feedback",
    body: "Get notes on your headline, summary and positioning.",
  },
  {
    title: "Interview practice",
    body: "Rehearse answers between sessions and arrive at mentoring with sharper questions.",
  },
];
