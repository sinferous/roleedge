// Content shapes. They mirror the planned Sanity schemas (docs/INTEGRATIONS.md §1.1),
// so swapping the local source for Sanity only changes lib/content/index.ts.

export type ServiceSlug = "mba-admissions" | "consulting-career-moves" | "resume-linkedin";

export type Service = {
  slug: ServiceSlug;
  number: string;
  title: string;
  shortTitle: string;
  promise: string;
  headline: string;
  summary: string;
  audience: string[];
  inclusions: string[];
  process: { title: string; body: string }[];
  storyField: Story["field"];
  faqIds: string[];
  topic: "mba_admissions" | "consulting" | "resume_linkedin";
};

export type Story = {
  slug: string;
  name: string;
  outcome: string;
  field: "consulting" | "admissions";
  fieldLabel: string;
  summary: string;
  // Stories render publicly only when the client has approved them (docs/PRD.md F3).
  consentConfirmed: boolean;
  source: string;
};

export type Faq = {
  id: string;
  group: "Getting started" | "Working together" | "Fees and outcomes";
  question: string;
  answer: string[];
};

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "quote"; text: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  coverAlt: string;
  category: Category["slug"];
  publishedAt: string;
  author: string;
  body: Block[];
  // Old WordPress path, redirected permanently to /blog/[slug].
  legacyPath?: string;
  // Set while the full article still lives on the old site and hasn't been migrated.
  sourceUrl?: string;
};

export type Category = {
  slug: "careers" | "consulting" | "growth";
  title: string;
  description: string;
};

export type Destination = { name: string; logo: string; width: number; height: number };

export type Credential = { title: string; detail: string };
