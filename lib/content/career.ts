// Copy for /career that is specific to consulting interviews, career changes and CVs.
// TODO(content): Mayank to review. The mock case and CV rewrites are illustrative examples, not
// client work, and are labelled "Example" on the page.

export const situations = [
  {
    title: "Aiming for consulting",
    who: "Graduates and lateral hires targeting strategy firms.",
    help: ["Case practice at interview pace", "Fit and leadership stories", "A target-firm and networking plan"],
    href: "#mock-case",
    cta: "See a practice round",
  },
  {
    title: "Changing direction",
    who: "You want a new field or function without starting over.",
    help: ["Map what carries over", "Pick roles you can realistically win", "A career story for interviews"],
    href: "#resources",
    cta: "Get the career pivot map",
  },
  {
    title: "My CV isn’t getting replies",
    who: "You’re applying, but not hearing back.",
    help: ["A CV rewritten around results", "LinkedIn headline and summary", "One story across CV, LinkedIn and interviews"],
    href: "#cv",
    cta: "See a CV rewrite",
  },
];

export const mockCase = {
  prompt:
    "Our client, a coffee chain with 60 stores, has seen profits fall 15% in two years while revenue stayed flat. What would you look at?",
  structure: [
    { title: "Cost per cup", body: "Beans, milk and packaging prices." },
    { title: "Fixed costs", body: "Rent, staff and the new stores opened." },
    { title: "Product mix", body: "Are we selling more low-margin items?" },
  ],
  feedback: [
    { good: true, text: "Used the flat-revenue clue to narrow the problem quickly." },
    { good: false, text: "Say why each branch matters before you dive in." },
    { good: false, text: "Close with a hypothesis, such as rising rent from new stores." },
  ],
};

export const practiceSteps = [
  { title: "Real cases, real pace", body: "Cases run the way interviews do: timed, with data handed over as you ask for it." },
  { title: "Specific feedback", body: "Notes on your structure, your maths and how clearly you explain, after every round." },
  { title: "Your weak spot, next time", body: "Each session starts where the last one struggled, so practice compounds." },
  { title: "Fit questions too", body: "Leadership, teamwork and “why consulting”, practised until they sound like you." },
];

export const cvRewrites = [
  { before: "Responsible for managing vendor relationships.", after: "Renegotiated 8 vendor contracts, cutting annual costs by 12%." },
  { before: "Worked on the company’s new app launch.", after: "Led research with 40 customers that shaped the app’s launch features." },
  { before: "Handled month-end reporting.", after: "Automated month-end reporting, saving the finance team 3 days a month." },
];
