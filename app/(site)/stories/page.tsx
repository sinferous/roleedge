import type { Metadata } from "next";
import { getStories } from "@/lib/content";
import { destinations } from "@/lib/content/profile";
import { GlobalReach } from "@/components/home/sections";
import { PageHero } from "@/components/site/PageHero";
import { ClosingSection } from "@/components/site/blocks";
import { StoryGrid } from "@/components/site/StoryGrid";

export const metadata: Metadata = {
  title: "Client stories",
  description: "How RoleEdge clients prepared for consulting interviews and business school applications, and where they went next.",
  alternates: { canonical: "/stories" },
};

export default async function StoriesPage() {
  const [consulting, admissions] = await Promise.all([getStories("consulting"), getStories("admissions")]);
  return (
    <>
      <PageHero
        current="Client stories"
        title={
          <>
            What changed <span className="accent">for them.</span>
          </>
        }
        lead="Clients bring different starting points. These are a few of the decisions they made and where they went next."
      />

      {[
        { id: "consulting", title: "Consulting and career moves.", items: consulting },
        { id: "admissions", title: "MBA admissions.", items: admissions },
      ]
        .filter((g) => g.items.length)
        .map((group) => (
          <section className="content-section" key={group.id} aria-labelledby={`${group.id}-title`}>
            <div className="container">
              <div className="section-heading">
                <div>
                  <h2 id={`${group.id}-title`}>{group.title}</h2>
                </div>
              </div>
              <StoryGrid stories={group.items} />
            </div>
          </section>
        ))}

      <section className="placements" aria-labelledby="placements-title">
        <div className="container placements-inner">
          <h2 id="placements-title">Where mentees have gone</h2>
          <div className="placements-window">
            <div className="placements-track">
              {[0, 1].map((copy) => (
                <div className="placements-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                  {destinations.map((d) => (
                    // eslint-disable-next-line @next/next/no-img-element -- small logos in a CSS marquee
                    <img key={d.name} src={d.logo} alt={copy === 0 ? d.name : ""} width={d.width} height={d.height} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <GlobalReach />

      <ClosingSection />
    </>
  );
}
