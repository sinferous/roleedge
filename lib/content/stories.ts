import type { Story } from "./types";

// Condensed, third-person summaries of stories published on roleedge.com/about-us.
// TODO(content): confirm consent and name format with each client, then set consentConfirmed.
// Until then these render only in local and preview builds, marked "Pending approval".
export const stories: Story[] = [
  {
    slug: "tanya-bcg",
    name: "Tanya",
    outcome: "BCG offer",
    field: "consulting",
    fieldLabel: "Consulting",
    summary:
      "RoleEdge’s focused case practice and mock partner rounds helped Tanya feel ready for BCG’s final interview. She received the offer.",
    consentConfirmed: false,
    source: "https://roleedge.com/about-us/",
  },
  {
    slug: "arjun-bain",
    name: "Arjun",
    outcome: "Bain offer",
    field: "consulting",
    fieldLabel: "Consulting",
    summary:
      "After repeated rejections, Arjun rebuilt his CV around measurable impact and sharpened his case skills. Interview calls followed, then a Bain offer.",
    consentConfirmed: false,
    source: "https://roleedge.com/about-us/",
  },
  {
    slug: "priya-lbs",
    name: "Priya",
    outcome: "London Business School admit",
    field: "admissions",
    fieldLabel: "MBA admissions",
    summary:
      "RoleEdge helped Priya connect her CV, essays and mock interviews into one clear application story. She went on to receive an LBS admit.",
    consentConfirmed: false,
    source: "https://roleedge.com/about-us/",
  },
  {
    slug: "michael-stanford",
    name: "Michael",
    outcome: "Stanford GSB admit",
    field: "admissions",
    fieldLabel: "MBA admissions",
    summary:
      "Michael stopped trying to look like a perfect candidate and made his purpose clear. Interview preparation helped him secure a Stanford GSB admit.",
    consentConfirmed: false,
    source: "https://roleedge.com/about-us/",
  },
  {
    slug: "oliver-ey",
    name: "Oliver",
    outcome: "EY Strategy offer",
    field: "consulting",
    fieldLabel: "Consulting",
    summary:
      "Direct feedback from RoleEdge helped Oliver bring more structure and energy to interviews that had been falling flat. He secured an EY Strategy offer.",
    consentConfirmed: false,
    source: "https://roleedge.com/about-us/",
  },
];
