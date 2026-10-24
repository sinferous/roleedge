import type { Service } from "./types";

// Headlines, summaries and inclusions come from the approved v1 homepage.
// TODO(content): Mayank to confirm audience lists and the "how it runs" steps for each service.
export const services: Service[] = [
  {
    slug: "mba-admissions",
    number: "01",
    title: "MBA & master’s admissions",
    shortTitle: "Admissions",
    promise: "Make the application yours.",
    headline: "Build a stronger application.",
    summary:
      "Connect where you’ve been with where you want to go. Build an application with a clear purpose and a voice that sounds like you.",
    audience: [
      "You are planning an MBA or a specialist master’s, in India or abroad.",
      "You want help choosing schools that fit your goals, not just rankings.",
      "Your experience is strong, but your essays don’t yet show why this step, and why now.",
    ],
    inclusions: [
      "School shortlisting & application strategy",
      "Essays, personal statements & admissions resumes",
      "Interview practice with specific feedback",
    ],
    process: [
      {
        title: "Understand your goal.",
        body: "We start with your experience, your reasons for further study, and the constraints that matter: budget, location, timing.",
      },
      {
        title: "Agree on the plan.",
        body: "Choose the schools and the story. Map every deadline, essay, recommendation and test you still need.",
      },
      {
        title: "Draft, review, rehearse.",
        body: "Work through drafts with specific feedback, then practise interviews until your answers sound like you.",
      },
    ],
    storyField: "admissions",
    faqIds: ["first-call", "know-exactly", "cost", "guarantee"],
    topic: "mba_admissions",
  },
  {
    slug: "consulting-career-moves",
    number: "02",
    title: "Consulting & career moves",
    shortTitle: "Consulting & careers",
    promise: "Prepare for the room you want to be in.",
    headline: "Prepare for your next role.",
    summary:
      "Work out where your experience fits, then prepare to explain it. Build your case skills, your career story, and a focused approach to the search.",
    audience: [
      "You are aiming for strategy consulting or a similar role, as a graduate or a lateral hire.",
      "You have interviews coming up and want honest, structured practice.",
      "You want to change direction without starting over.",
    ],
    inclusions: [
      "Career direction & transition planning",
      "Consulting case practice & problem solving",
      "Mock interviews & networking strategy",
    ],
    process: [
      {
        title: "Understand your goal.",
        body: "We compare the roles you are considering with what you have already done, and agree what a good outcome looks like.",
      },
      {
        title: "Agree on the plan.",
        body: "Set priorities: case skills, your career story, target firms and the people worth speaking to.",
      },
      {
        title: "Practise and improve.",
        body: "Run cases and interviews in realistic conditions. Use specific feedback to see what is improving and what still needs work.",
      },
    ],
    storyField: "consulting",
    faqIds: ["work-with-mayank", "know-exactly", "cost", "guarantee"],
    topic: "consulting",
  },
  {
    slug: "resume-linkedin",
    number: "03",
    title: "Resume & LinkedIn",
    shortTitle: "Resume & LinkedIn",
    promise: "Make your experience count.",
    headline: "Show what your experience is worth.",
    summary:
      "Turn a list of responsibilities into a clear account of your contribution. Give recruiters a consistent picture of what you can bring to their team.",
    audience: [
      "Your resume lists duties rather than results.",
      "You are applying for roles but not hearing back.",
      "Your LinkedIn profile and resume tell different stories.",
    ],
    inclusions: [
      "Resume structure, relevance & achievement writing",
      "LinkedIn headline, summary & positioning",
      "A career narrative you can use in interviews",
    ],
    process: [
      {
        title: "Choose the target.",
        body: "Pick the roles you want, then mark what their job descriptions ask for again and again.",
      },
      {
        title: "Rebuild the evidence.",
        body: "Rewrite your experience around the actions you took and what changed, using only details you can support.",
      },
      {
        title: "Make it consistent.",
        body: "Align your resume, LinkedIn and interview story so recruiters see the same strengths everywhere.",
      },
    ],
    storyField: "consulting",
    faqIds: ["first-call", "cost", "guarantee"],
    topic: "resume_linkedin",
  },
];
