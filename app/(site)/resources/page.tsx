import type { Metadata } from "next";
import { showPendingContent } from "@/lib/content";
import { resources, resourceTracks } from "@/lib/content/resources";
import { PageHero } from "@/components/site/PageHero";
import { ClosingSection } from "@/components/site/blocks";
import { ResourceFolder } from "@/components/site/ResourceFolder";

export const metadata: Metadata = {
  title: "Free resources",
  description: "Free planners, checklists and worksheets for MBA applications, consulting interviews and career moves, from RoleEdge.",
  alternates: { canonical: "/resources" },
};

export default function ResourcesPage() {
  const visible = resources.filter((r) => r.confirmed || showPendingContent);

  return (
    <>
      <PageHero
        current="Resources"
        title={
          <>
            Free tools for your <span className="accent">next step.</span>
          </>
        }
        lead="Planners, checklists and worksheets to print and fill in. Use them on your own, or bring them to your first call."
      >
        <ul className="resource-promises">
          <li>Free, no sign-up</li>
          <li>Made for printing</li>
          <li>Free to share</li>
        </ul>
      </PageHero>

      {visible.length === 0 ? (
        <section className="section resources-section">
          <div className="container">
            <p className="muted-note">New resources are on the way. In the meantime, the blog has guides on case interviews, career pivots and promotions.</p>
          </div>
        </section>
      ) : (
        resourceTracks.map((track) => {
          const items = visible.filter((r) => r.track === track.slug);
          if (!items.length) return null;
          return (
            <section className="section resources-section" id={track.slug} aria-labelledby={`${track.slug}-title`} key={track.slug}>
              <div className="container">
                <div className="resources-heading">
                  <h2 id={`${track.slug}-title`}>{track.title}</h2>
                  <p>{track.lead}</p>
                </div>
                <div className="resource-folders">
                  {items.map((r) => (
                    <ResourceFolder key={r.slug} resource={r} />
                  ))}
                </div>
              </div>
            </section>
          );
        })
      )}

      <ClosingSection title="Want someone to check your work?" />
    </>
  );
}
