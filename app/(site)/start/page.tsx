import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { Planner } from "@/components/home/Planner";

export const metadata: Metadata = {
  title: "Find your starting point",
  description: "Answer three questions and get suggested next steps for an MBA application, a move into consulting, a career change or a stronger profile.",
  alternates: { canonical: "/start" },
};

export default function StartPage() {
  return (
    <>
      <PageHero
        current="Find your starting point"
        title={
          <>
            Not sure <span className="accent">where to start?</span>
          </>
        }
        lead="Answer three questions for suggested next steps. It runs in your browser, and nothing is saved unless you ask us to email the result."
      />
      <section className="starting-section" aria-label="Starting point planner">
        <div className="container starting-layout">
          <div className="starting-copy">
            <h2>Three questions, three next steps.</h2>
            <p>These are general preparation prompts based on your choices, not a profile assessment. Bring them to a free call if you’d like to talk them through.</p>
          </div>
          <Planner />
        </div>
      </section>
    </>
  );
}
