// "For institutions": universities, colleges and companies.
// TODO(content): draft structure only. Mayank to confirm the formats RoleEdge offers,
// typical group sizes, delivery (on campus / online) and any institutions that may be named.
export const institutionOffers = [
  {
    title: "Guest sessions and workshops",
    body: "Talks and hands-on workshops on consulting careers, case interviews, and applying to business school, for student societies, career services and alumni groups.",
    covers: ["How consulting careers work", "A live case interview demo", "Open Q&A with a former Bain Manager"],
    suits: "Student societies, career services and alumni groups",
  },
  {
    title: "Placement and interview preparation",
    body: "Structured preparation for cohorts heading into recruitment: case practice, CV and LinkedIn reviews, and mock interviews with specific feedback.",
    covers: ["Case practice in small groups", "CV and LinkedIn reviews", "Mock interviews with feedback"],
    suits: "Cohorts heading into placements or lateral hiring",
  },
  {
    title: "Higher-study guidance",
    body: "Sessions for students weighing an MBA or master’s abroad: choosing programmes, building an application story and preparing for interviews.",
    covers: ["Choosing the right programmes", "Building an application story", "Preparing for admissions interviews"],
    suits: "Students considering an MBA or master’s abroad",
  },
];

// Institutions Mayank has worked with, as listed in his positioning brief (2026-10-24).
export const institutionsWorkedWith = [
  "Warwick Business School",
  "IIM Udaipur",
  "IIM Sambalpur",
  "IIM Visakhapatnam",
  "Masters’ Union",
  "Shri Ram College of Commerce",
  "Hansraj College",
  "Miranda House",
  "Great Lakes Institute of Management",
  "Delhi Technological University",
];

export const institutionAudiences = [
  { icon: "career", title: "Career services", body: "At universities and colleges" },
  { icon: "clubs", title: "Student clubs", body: "Consulting, finance and MBA societies" },
  { icon: "school", title: "Business schools", body: "Admissions and alumni teams" },
  { icon: "company", title: "Companies", body: "Supporting early-career talent" },
] as const;

export const institutionSteps = [
  { title: "Tell us about your group.", body: "Who the participants are, what they’re preparing for, and when." },
  { title: "Agree the format.", body: "We suggest a session or programme, its length and how it’s delivered, with a clear scope and fee." },
  { title: "Run and review.", body: "Deliver the sessions, then share what participants worked on and where they could go next." },
];
