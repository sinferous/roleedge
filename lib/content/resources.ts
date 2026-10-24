// Free downloads on /resources. One source for both the page and the PDFs:
// `npm run build:downloads` renders each entry to public/downloads/<slug>.pdf plus a cover image.
// This file has no imports so the Node build script can load it directly.
// TODO(content): every resource is a draft until Mayank reviews it; set `confirmed: true` per item.

export type ResourceTrack = "study-abroad" | "career";

export type ResourceBlock =
  | { kind: "steps"; heading: string; items: { title: string; body: string }[] }
  | { kind: "checklist"; heading: string; items: string[] }
  | { kind: "prompts"; heading: string; items: string[]; lines?: number }
  | { kind: "table"; heading: string; columns: string[]; rows?: string[][]; blankRows?: number }
  | { kind: "note"; heading: string; body: string };

export type Resource = {
  slug: string;
  title: string;
  track: ResourceTrack;
  summary: string;
  inside: string[];
  related?: { href: string; label: string };
  confirmed: boolean;
  blocks: ResourceBlock[];
};

export const resourceTracks: { slug: ResourceTrack; title: string; lead: string }[] = [
  { slug: "study-abroad", title: "For study abroad", lead: "Plan the year, then find the story your application tells." },
  { slug: "career", title: "For your career", lead: "Get ready for interviews, a new role, or a change of direction." },
];

export const resources: Resource[] = [
  {
    slug: "mba-application-planner",
    title: "MBA application planner",
    track: "study-abroad",
    summary: "A twelve-month plan from test prep to interviews, with a tracker for every school on your list.",
    inside: ["Month-by-month plan", "School and deadline tracker", "Recommender checklist"],
    confirmed: false,
    blocks: [
      {
        kind: "steps",
        heading: "Your twelve months",
        items: [
          { title: "12 to 9 months out", body: "Pick GMAT or GRE, take a diagnostic test and book a test date. Start a list of moments from work that changed how you think." },
          { title: "9 to 6 months out", body: "Shortlist schools. Speak to current students and alumni. Draft your resume for an admissions reader, not a recruiter." },
          { title: "6 to 3 months out", body: "Settle your career goal and your story. Brief your recommenders. Write first drafts of every essay." },
          { title: "3 months to deadline", body: "Edit for clarity and length. Check every form field. Submit a few days early, not on the last night." },
          { title: "After you submit", body: "Prepare for interviews: your story in two minutes, why this school, and three examples of leadership." },
        ],
      },
      {
        kind: "table",
        heading: "School tracker",
        columns: ["School", "Round", "Deadline", "Essays", "Status"],
        blankRows: 8,
      },
      {
        kind: "checklist",
        heading: "Recommenders",
        items: [
          "Chosen people who have seen your work closely, not the most senior names",
          "Asked at least two months before the deadline",
          "Shared your resume, your goal and three stories they could mention",
          "Sent each school’s link and deadline in one message",
          "Followed up two weeks before the deadline",
          "Thanked them, and told them where you got in",
        ],
      },
      { kind: "note", heading: "Before you rely on dates", body: "Deadlines and essay questions change every year. Check each school’s admissions page and copy the dates into the tracker yourself." },
    ],
  },
  {
    slug: "why-mba-story-worksheet",
    title: "Why-MBA story worksheet",
    track: "study-abroad",
    summary: "Questions that turn your past, your goal and your reason for this school into one clear story.",
    inside: ["Prompts for past, present and future", "A one-line goal test", "Checks before you write"],
    related: { href: "/study-abroad", label: "Study abroad guidance" },
    confirmed: false,
    blocks: [
      {
        kind: "prompts",
        heading: "Where you have been",
        items: [
          "Which two or three moments at work changed what you want to do?",
          "What did you do in those moments that someone else in your seat might not have done?",
        ],
      },
      {
        kind: "prompts",
        heading: "Where you want to go",
        items: [
          "Your goal right after the MBA, in one line: role, type of company, and region.",
          "Your longer-term goal. Why does it matter to you, not just to your CV?",
        ],
      },
      {
        kind: "prompts",
        heading: "Why now and why this school",
        items: [
          "What gap stands between you and that goal? Be specific: skills, network, or credibility.",
          "Name two things at this school, such as a course, a club or a person, that close that gap.",
        ],
      },
      {
        kind: "checklist",
        heading: "Before you start writing",
        items: [
          "Your goal fits in one sentence that a stranger understands",
          "Your past makes the goal believable",
          "The gap is something an MBA can actually close",
          "Every school reason would not work word for word at another school",
          "Someone who knows you has read your answers and recognised you",
        ],
      },
    ],
  },
  {
    slug: "mba-interview-prep-sheet",
    title: "MBA interview prep sheet",
    track: "study-abroad",
    summary: "The questions most MBA interviews come back to, with space to match each one to a story.",
    inside: ["Common questions and story bank", "Questions to ask them", "Day-before checklist"],
    confirmed: false,
    blocks: [
      {
        kind: "table",
        heading: "Match each question to a story",
        columns: ["Question", "My story", "The point it proves"],
        rows: [
          ["Walk me through your resume.", "", ""],
          ["Why an MBA, and why now?", "", ""],
          ["Why this school?", "", ""],
          ["Tell me about a time you led a team.", "", ""],
          ["Tell me about a time you failed.", "", ""],
          ["What will you add to the class?", "", ""],
        ],
      },
      {
        kind: "prompts",
        heading: "Questions to ask them",
        items: ["Something you could not have found on the school’s website.", "Something about their own experience of the programme."],
        lines: 2,
      },
      {
        kind: "checklist",
        heading: "The day before",
        items: [
          "Re-read your application, every essay and your resume",
          "Say your two-minute introduction out loud, once, without notes",
          "Check the time zone, the link or the address, and the interviewer’s name",
          "Test your camera, microphone, light and background for an online interview",
          "Keep a glass of water and a short list of your stories nearby",
        ],
      },
    ],
  },
  {
    slug: "study-abroad-budget-planner",
    title: "Study abroad budget planner",
    track: "study-abroad",
    summary: "Add up what a year abroad really costs and how you will pay for it, before you accept an offer.",
    inside: ["Cost of a year abroad", "How you will fund it", "Questions for the school"],
    confirmed: false,
    blocks: [
      {
        kind: "table",
        heading: "What a year will cost",
        columns: ["Cost", "Estimate", "Where the figure came from"],
        rows: [
          ["Tuition and fees", "", ""],
          ["Housing", "", ""],
          ["Food and daily living", "", ""],
          ["Health insurance", "", ""],
          ["Visa, flights and moving", "", ""],
          ["Books, laptop and supplies", "", ""],
          ["Buffer for surprises", "", ""],
          ["Total", "", ""],
        ],
      },
      {
        kind: "table",
        heading: "How you will pay for it",
        columns: ["Source", "Amount", "Confirmed?"],
        rows: [["Savings", "", ""], ["Scholarships", "", ""], ["Education loan", "", ""], ["Family support", "", ""], ["Part-time work, where the visa allows it", "", ""]],
      },
      {
        kind: "checklist",
        heading: "Ask the school",
        items: [
          "What is the official cost of attendance for this year?",
          "Which scholarships can I still apply for, and by when?",
          "Do you work with lenders who do not need a co-signer?",
          "When is the deposit due, and can it be refunded?",
        ],
      },
      { kind: "note", heading: "Use current figures", body: "Costs and exchange rates change. Start from each school’s published cost of attendance and today’s exchange rate, and note the date you checked." },
    ],
  },
  {
    slug: "consulting-cv-checklist",
    title: "Consulting CV checklist",
    track: "career",
    summary: "Twenty checks to run before your CV goes to a consulting firm, from layout to the last full stop.",
    inside: ["Structure and layout", "Bullets that show impact", "Final proofreading pass"],
    related: { href: "/career", label: "Career guidance" },
    confirmed: false,
    blocks: [
      {
        kind: "checklist",
        heading: "Structure",
        items: [
          "One page, unless you have more than ten years of experience",
          "Education and experience in reverse date order",
          "Each role shows company, title, location and dates on one line",
          "Clean, consistent font, with margins of at least 1.5 cm",
          "No photo, objective statement or list of soft skills",
        ],
      },
      {
        kind: "checklist",
        heading: "Bullets",
        items: [
          "Each bullet starts with a strong verb: led, built, cut, grew",
          "Each bullet shows a result, not only a task",
          "Results have a number: money, time, percentage or scale",
          "No bullet runs over two lines",
          "Three to five bullets for each recent role",
        ],
      },
      {
        kind: "checklist",
        heading: "What a reader looks for",
        items: [
          "Leadership: a time you ran something or brought people with you",
          "Problem solving: a messy problem you structured and solved",
          "Impact: a change that lasted after you left",
          "Ranks, scholarships and selective programmes are easy to spot",
          "Interests are specific enough to start a conversation",
        ],
      },
      {
        kind: "checklist",
        heading: "Final pass",
        items: [
          "Spelling and grammar checked by a person, not only by software",
          "Dates, tenses and number formats are consistent",
          "File saved as a PDF and named Firstname-Lastname-CV",
          "Every claim is something you can talk about for two minutes",
          "A friend can say what you are best at after a 30-second read",
        ],
      },
    ],
  },
  {
    slug: "case-interview-starter-sheet",
    title: "Case interview starter sheet",
    track: "career",
    summary: "The shape of a case interview on one sheet, with the profitability tree and a closing template.",
    inside: ["The four parts of a case", "Profitability and market-entry questions", "A summary template"],
    related: { href: "/blog/profitability-case-interview-complete-guide-with-examples", label: "Read the profitability case guide" },
    confirmed: false,
    blocks: [
      {
        kind: "steps",
        heading: "The four parts of a case",
        items: [
          { title: "Clarify", body: "Play the question back. Ask about the goal, the timeline and anything you do not understand." },
          { title: "Structure", body: "Take a minute. Lay out three or four areas to explore that do not overlap and together cover the problem." },
          { title: "Analyse", body: "Go where the data points. Say each calculation out loud and say what each number means." },
          { title: "Recommend", body: "Lead with the answer, give two or three reasons, then the risks and next steps." },
        ],
      },
      {
        kind: "table",
        heading: "Profitability: where to look",
        columns: ["Area", "Questions to ask"],
        rows: [
          ["Revenue = price × volume", "Did prices fall? Did we sell fewer units? Did the mix of products or customers change?"],
          ["Costs = fixed + variable", "Which cost line grew fastest? Is it one-off or lasting? How do we compare with competitors?"],
          ["Outside the company", "Is the whole market shrinking? Did a competitor, regulation or customer need change?"],
        ],
      },
      {
        kind: "table",
        heading: "Market entry: where to look",
        columns: ["Area", "Questions to ask"],
        rows: [
          ["The market", "How big is it, how fast is it growing, and how profitable are the players in it?"],
          ["Competition", "Who leads, and why? What would make customers switch?"],
          ["Our company", "Which strengths carry over? What would it cost to enter, and how long until we break even?"],
          ["How to enter", "Build, buy or partner? What could go wrong?"],
        ],
      },
      {
        kind: "note",
        heading: "Closing template",
        body: "“My recommendation is to ___ because ___ and ___. The main risk is ___, so as next steps I would ___.”",
      },
    ],
  },
  {
    slug: "90-day-plan-template",
    title: "90-day plan template",
    track: "career",
    summary: "A simple plan for a new role or a push for promotion: learn, contribute, then lead.",
    inside: ["Three 30-day phases", "Goals, people and evidence table", "A weekly check-in"],
    related: { href: "/blog/the-90-day-promotion-plan-how-to-fast-track-your-career", label: "Read the 90-day promotion plan" },
    confirmed: false,
    blocks: [
      {
        kind: "steps",
        heading: "Three phases",
        items: [
          { title: "Days 1 to 30: learn", body: "Understand how the team is measured, who decides what, and what your manager needs most from you." },
          { title: "Days 31 to 60: contribute", body: "Deliver one visible piece of work end to end. Fix a small problem nobody owns." },
          { title: "Days 61 to 90: lead", body: "Take on a responsibility one level up. Ask for feedback against the next role, not the current one." },
        ],
      },
      {
        kind: "table",
        heading: "Your plan",
        columns: ["Phase", "Goal", "People to meet", "Evidence it worked"],
        rows: [["Days 1 to 30", "", "", ""], ["Days 31 to 60", "", "", ""], ["Days 61 to 90", "", "", ""]],
      },
      {
        kind: "prompts",
        heading: "Weekly check-in",
        items: ["What did I finish this week that my manager noticed?", "What is blocking me, and who can help?", "What is the one thing that matters most next week?"],
        lines: 2,
      },
    ],
  },
  {
    slug: "career-pivot-map",
    title: "Career pivot map",
    track: "career",
    summary: "Work out what carries over to the role you want, what is missing, and who to talk to next.",
    inside: ["Transferable skills table", "Gap list", "Conversation tracker"],
    related: { href: "/blog/career-pivot-playbook-switch-roles-without-starting-over", label: "Read the career pivot playbook" },
    confirmed: false,
    blocks: [
      {
        kind: "prompts",
        heading: "The role you want",
        items: ["Name the role, the kind of company, and the city.", "Pick three job ads for it. What do all three ask for?"],
      },
      {
        kind: "table",
        heading: "What carries over",
        columns: ["What you did", "The skill behind it", "How it shows up in the new role"],
        blankRows: 5,
      },
      {
        kind: "table",
        heading: "What is missing",
        columns: ["Gap", "How to close it", "By when"],
        blankRows: 3,
      },
      {
        kind: "table",
        heading: "Conversations",
        columns: ["Name", "Role and company", "What I learned", "Next step"],
        blankRows: 6,
      },
    ],
  },
];
