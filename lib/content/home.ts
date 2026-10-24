// Home-page-only content: the journey and the international panel.

// The journey, from first call to application or interview. Each stage opens a detail card.
// TODO(content): Mayank to confirm each stage, in particular the "written plan" and "final reviews" promises.
export const journey = [
  {
    title: "Free first call",
    body: "Talk through where you are and what you’re aiming for. No cost, no commitment.",
    happens: "A 30-minute conversation about your background, your goal and your timeline. Ask anything about how RoleEdge works and what it costs.",
    bring: ["Your CV or LinkedIn", "The schools, firms or roles you’re considering", "Any deadlines you already know"],
    leave: "An honest view of your options, and whether RoleEdge is the right fit.",
  },
  {
    title: "Understand your goal",
    body: "Your experience, ambitions and constraints, and what’s getting in the way.",
    happens: "A close look at your profile: experience, results, academics and constraints such as budget, location or timing.",
    bring: ["Your full CV", "Academic records and test scores, if relevant", "What you want more of, and less of, in your next role"],
    leave: "A clear picture of your strengths, your gaps and the story your experience can tell.",
  },
  {
    title: "Agree on the plan",
    body: "The right priorities, connected to the opportunity you actually want.",
    happens: "Together you set priorities: the shortlist of schools or firms, what to work on first, and a timeline built around real deadlines.",
    bring: ["Your preferences and constraints", "Questions about scope and fees"],
    leave: "A written plan with milestones, and the scope and fees agreed before any paid work begins.",
  },
  {
    title: "Prepare and improve",
    body: "Drafts and real interview scenarios, with specific feedback each time.",
    happens: "Work through essays, resumes and LinkedIn drafts with line-by-line feedback, and practise cases and interviews in realistic conditions. EdgeAI adds quick feedback between sessions.",
    bring: ["Drafts to review", "Time to practise between sessions"],
    leave: "Materials and answers that sound like you, and a sense of what still needs work.",
  },
  {
    title: "Apply with confidence",
    body: "Submit and interview knowing your story and your preparation.",
    happens: "Final reviews before you submit, focused preparation for the actual interview rounds, and a debrief afterwards.",
    bring: ["Final drafts", "Your interview invitations and dates"],
    leave: "Applications you’re proud of, and the confidence to walk into the room prepared.",
  },
];

// Pins on the equirectangular world map, shown cropped at 60°S (Antarctica hidden):
// left = (lon + 180) / 360, top = (90 − lat) / 150.
// Each pin carries a country summary for its pop-up card.
// TODO(content): every `mentees`, `destinations` and `focus` value below is SAMPLE text for the design.
// Mayank to supply the real figures, then set confirmed: true. Unconfirmed cards show a "Sample" tag
// locally and on previews, and only the country name and a booking link in production.
export const mapPins = [
  { country: "Canada", lat: 56, lon: -106, mentees: "40+", destinations: ["Rotman", "Ivey", "Deloitte Canada"], focus: "MBA applications and consulting moves", confirmed: false },
  { country: "United States", lat: 39, lon: -98, mentees: "60+", destinations: ["Wharton", "Columbia", "McKinsey"], focus: "MBA applications and US consulting", confirmed: false },
  { country: "United Kingdom", lat: 54, lon: -2, mentees: "120+", destinations: ["LBS", "Oxford Saïd", "Warwick"], focus: "Master’s and MBA admissions", confirmed: false },
  { country: "Germany", lat: 51, lon: 10, mentees: "30+", destinations: ["Mannheim", "WHU", "Roland Berger"], focus: "Consulting interviews in Europe", confirmed: false },
  { country: "United Arab Emirates", lat: 24, lon: 54, mentees: "80+", destinations: ["INSEAD", "Kearney", "Big 4 strategy"], focus: "Career moves in the Gulf", confirmed: false },
  { country: "India", lat: 21, lon: 78, mentees: "600+", destinations: ["ISB", "Bain", "BCG"], focus: "MBA, consulting and career changes", confirmed: false },
  { country: "Australia", lat: -25, lon: 134, mentees: "25+", destinations: ["AGSM", "Melbourne Business School"], focus: "Master’s admissions and career moves", confirmed: false },
].map((p) => ({ ...p, left: ((p.lon + 180) / 360) * 100, top: ((90 - p.lat) / 150) * 100 }));

// TODO(content): "7+" and "4+" say there are more than the seven countries on the map; confirm with Mayank.
export const globalStats = [
  { value: 1000, suffix: "+", label: "Students and professionals mentored" },
  { value: 7, suffix: "+", label: "Countries where clients are based" },
  { value: 4, suffix: "+", label: "Continents" },
];

// "How we can help": the three areas match the main navigation.
// Proof lines name the employers and schools listed in Mayank's positioning brief (2026-10-24).
// They name organisations only, never individual clients.
export type HelpArea = {
  slug: string;
  title: string;
  line: string;
  headline: string;
  intro: string;
  forWho: string[];
  includes: string[];
  proof?: { label: string; items: string[]; confirmed: boolean };
  // Shown in the proof slot when there is no proof line.
  note?: string;
  href: string;
  book: string;
};

export const helpAreas: HelpArea[] = [
  {
    slug: "study-abroad",
    title: "Study abroad",
    line: "MBA & master’s applications, from shortlist to interview",
    headline: "Build a stronger application.",
    intro: "Connect where you’ve been with where you want to go, with a clear purpose and a voice that sounds like you.",
    forWho: [
      "You’re planning an MBA or a specialist master’s, in India or abroad",
      "You want schools that fit your goals, not just the rankings",
      "Your experience is strong, but your essays don’t yet show why now",
    ],
    includes: [
      "School shortlisting & application strategy",
      "Essays, SOPs & personal statements",
      "Admissions resume that shows your contribution",
      "Interview practice with specific feedback",
    ],
    proof: { label: "Admits include", items: ["Stanford", "INSEAD", "IE", "Kelley School of Business"], confirmed: true },
    href: "/study-abroad",
    book: "/book?service=mba-admissions",
  },
  {
    slug: "career",
    title: "Career",
    line: "Consulting interviews, career changes, resume & LinkedIn",
    headline: "Prepare for your next role.",
    intro: "Work out where your experience fits, then learn to explain it: case skills, a clear career story and a focused search.",
    forWho: [
      "You’re aiming for strategy consulting, as a graduate or a lateral hire",
      "You want to change direction without starting over",
      "Your resume and LinkedIn aren’t getting the responses they should",
    ],
    includes: [
      "Career direction & transition planning",
      "Consulting case practice & mock interviews",
      "Networking strategy for your target firms",
      "Resume rewritten around measurable impact",
      "LinkedIn headline, summary & positioning",
    ],
    proof: { label: "Clients have joined", items: ["Bain & Company", "Accenture", "Deloitte", "PwC", "KPMG"], confirmed: true },
    href: "/career",
    book: "/book?service=consulting-career-moves",
  },
  {
    slug: "institutions",
    title: "For institutions",
    line: "Workshops and placement prep for universities and companies",
    headline: "Guidance for your students and teams.",
    intro: "Sessions and programmes shaped around your group, led by a former Bain & Company Manager and Warwick MBA.",
    // TODO(content): draft offering for Mayank to confirm (see lib/content/institutions.ts).
    forWho: [
      "University and college career services",
      "Student clubs, societies and alumni teams",
      "Business school admissions and outreach teams",
      "Companies supporting early-career talent",
    ],
    includes: [
      "Guest sessions and workshops",
      "Placement and interview preparation for cohorts",
      "CV and LinkedIn reviews for graduating students",
      "Higher-study guidance for MBA and master’s applicants",
    ],
    note: "Delivered on campus or online, as a single session or a full programme.",
    href: "/institutions",
    book: "/institutions#enquire",
  },
];
