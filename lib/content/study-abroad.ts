// Copy for /study-abroad that is specific to applications.
// TODO(content): Mayank to confirm which programmes he supports, and to review the timeline and
// the four work areas. Programmes stay marked "Pending approval" until `confirmed` is true.

export const programmes = [
  {
    title: "MBA",
    suits: "Professionals with a few years of work experience who want to step up or change direction.",
    focus: ["A post-MBA goal that holds up", "Leadership stories from your work", "Schools that fit your goal and budget"],
    confirmed: false,
  },
  {
    title: "Specialist master’s",
    suits: "Graduates and early-career professionals going deeper in one field, such as management, finance or analytics.",
    focus: ["The right programme for your field", "An SOP with a clear academic purpose", "Showing potential with little work experience"],
    confirmed: false,
  },
  {
    title: "Executive MBA",
    suits: "Experienced managers who want to keep working while they study.",
    focus: ["Formats that fit around your job", "Your case for employer support", "Leadership at senior level"],
    confirmed: false,
  },
];

// The application year, counted back from the deadline. Shown as a snake path, two steps per row.
export const applicationYear = [
  { when: "12 months out", title: "Pick your test", body: "Take a GMAT or GRE diagnostic and book a date." },
  { when: "9 months out", title: "Build your list", body: "Shortlist schools and speak to students and alumni." },
  { when: "6 months out", title: "Find your story", body: "Settle your goal and brief your recommenders." },
  { when: "3 months out", title: "Draft and refine", body: "Write, edit and check every essay and form." },
  { when: "Deadline", title: "Submit", body: "Send it a few days early, not on the last night." },
  { when: "After you submit", title: "Interview", body: "Practise until your answers sound like you." },
];

export const workAreas = [
  {
    title: "Shortlist & strategy",
    body: "Start from your goal, your profile and your limits, then build a balanced list.",
    items: ["Profile review against target programmes", "A shortlist with a reason for each school", "Round, test and deadline plan"],
  },
  {
    title: "Essays & SOPs",
    body: "Find the moments that explain your goal and shape them into essays a reader remembers.",
    items: ["A session to find your story", "Structure for each school’s questions", "Line-by-line feedback on drafts"],
  },
  {
    title: "Admissions resume",
    body: "Rewrite your resume for an admissions committee, not a recruiter.",
    items: ["One-page admissions resume", "Bullets rewritten around results", "One story across resume, essays and forms"],
  },
  {
    title: "Interview practice",
    body: "Practise the questions schools ask most, with feedback on what you say and how you say it.",
    items: ["Mock interviews for each school", "Specific feedback after every round", "A story bank for behavioural questions"],
  },
];

// Numbers under the header: only figures with a published source (see trustStats in profile.ts).
// TODO(content): add an admits figure once Mayank confirms one.
export const studyStats = [
  { value: 1000, prefix: "", suffix: "+", label: "Students and professionals mentored" },
  { value: 7, prefix: "", suffix: "+", label: "Countries our clients are based in" },
  { value: 15, prefix: "", suffix: "+", label: "Years across Bain, Deloitte, EY & KPMG" },
];
