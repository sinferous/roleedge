// "Find your starting point": three questions mapped to suggested next steps.
// Shared by the client planner and the server, which rebuilds the plan from answers
// instead of trusting any text sent by the browser.

export const PLAN_VERSION = "2026-10-a";

export const plannerQuestions = [
  {
    key: "goal",
    title: "What’s on your mind?",
    description: "Choose the one that feels closest.",
    options: [
      ["admissions", "An MBA or master’s application"],
      ["consulting", "A move into consulting"],
      ["career", "A new career direction"],
      ["profile", "A stronger resume & LinkedIn"],
    ],
  },
  {
    key: "stage",
    title: "Where are you right now?",
    description: "There’s no right or wrong place to start.",
    options: [
      ["exploring", "Exploring my options"],
      ["focused", "I have a goal, but need a plan"],
      ["preparing", "Already applying or preparing"],
    ],
  },
  {
    key: "timing",
    title: "What’s your timeframe?",
    description: "This helps put the next steps in perspective.",
    options: [
      ["soon", "Within the next month"],
      ["quarter", "Over the next 1–3 months"],
      ["ahead", "I’m thinking further ahead"],
    ],
  },
] as const;

export type PlannerAnswers = {
  goal: "admissions" | "consulting" | "career" | "profile";
  stage: "exploring" | "focused" | "preparing";
  timing: "soon" | "quarter" | "ahead";
};

const paths = {
  admissions: {
    title: "Start with the story, then the shortlist.",
    description:
      "A good application connects your experience, your reasons for studying, and what you want to do afterwards.",
    steps: [
      "Write down the role or direction you want after graduation, and why further study would help.",
      "Compare a few programmes on curriculum, cost, location, and entry requirements. Check each school’s own deadlines.",
      "Collect three specific experiences that show your contribution, your learning, and your reasons for taking this step.",
    ],
    explore:
      "Compare further study with a direct career move. List what each route would help you achieve and what it would cost in time and money.",
    prepare:
      "Review your closest application deadline and list the essays, recommendations, tests, and documents still outstanding.",
    service: "mba-admissions",
  },
  consulting: {
    title: "Make your preparation more deliberate.",
    description:
      "Work on both sides of a consulting interview: how you solve a problem and how you explain your own experience.",
    steps: [
      "Choose a target type of consulting role and compare its requirements with your current experience.",
      "Practise one case aloud. Notice how you structure the problem, use numbers, and explain your conclusion.",
      "Prepare two stories that show your individual contribution, including the decisions you made and what changed.",
    ],
    explore:
      "Compare the day-to-day work of strategy, operations, and specialist consulting. Write down which problems you would actually like to work on.",
    prepare:
      "Review the format of your next interview. Run a timed case and identify one specific skill to work on before practising again.",
    service: "consulting-career-moves",
  },
  career: {
    title: "Get specific about your next move.",
    description:
      "A job title is a starting point. The work, environment, and trade-offs behind it matter just as much.",
    steps: [
      "Choose two possible directions and write down the work you want more of, and less of, in each.",
      "Compare a few real job descriptions. Separate strengths you already have from experience you still need to demonstrate.",
      "Prepare questions for someone doing the role, covering the daily work, expected skills, and realistic entry routes.",
    ],
    explore:
      "Write down what you want to change: the work itself, your industry, the environment, or your scope of responsibility. Pick the most important one.",
    prepare:
      "Review the roles you have already applied for. Look for a pattern in the requirements and where your profile may not explain the fit.",
    service: "consulting-career-moves",
  },
  profile: {
    title: "Help your experience speak for itself.",
    description:
      "A useful profile makes your contribution easy to understand and relevant to the opportunities you want.",
    steps: [
      "Choose one target role. Mark the skills and experience that appear repeatedly in its job descriptions.",
      "Rewrite three resume bullets around the action you took and its result. Use only details and numbers you can support.",
      "Check that your LinkedIn headline, summary, and resume tell a consistent story about what you can contribute.",
    ],
    explore:
      "Choose a target audience before rewriting. Compare two possible roles and decide which experience each one needs to see first.",
    prepare:
      "Compare your current resume with a target job description. Check whether the top half clearly shows your most relevant contribution.",
    service: "resume-linkedin",
  },
} as const;

const timingNotes = {
  soon: "With a near-term deadline, choose the most time-sensitive step first. Bring that date to your introductory conversation.",
  quarter:
    "Use the next few weeks to create a first draft or practice baseline, then leave time to get feedback and revise.",
  ahead:
    "You have room to explore. Start with a small piece of research or a conversation before committing to a larger plan.",
} as const;

export type Plan = {
  title: string;
  description: string;
  steps: string[];
  timing: string;
  service: string;
};

export function buildPlan(answers: PlannerAnswers): Plan {
  const path = paths[answers.goal];
  const steps: string[] = [...path.steps];
  if (answers.stage === "exploring") steps[0] = path.explore;
  if (answers.stage === "preparing") steps[0] = path.prepare;
  return {
    title: path.title,
    description: path.description,
    steps,
    timing: timingNotes[answers.timing],
    service: path.service,
  };
}

export function planToText(plan: Plan) {
  return [plan.title, "", plan.description, "", ...plan.steps.map((s, i) => `${i + 1}. ${s}`), "", plan.timing].join("\n");
}
