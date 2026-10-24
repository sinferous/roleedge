import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using the RoleEdge website.",
  alternates: { canonical: "/terms" },
};

// TODO(content): legal review before launch (docs/PRD.md C7). Engagement terms are agreed separately per client.
export default function TermsPage() {
  return (
    <>
      <PageHero current="Terms" title="Website terms." lead="Draft pending legal review." />
      <section className="content-section">
        <div className="container">
          <div className="prose">
            <h2>Using this website</h2>
            <p>The articles, planner and other material on this site are general guidance. They aren’t an assessment of your profile or a promise of any result.</p>
            <h2>No guarantees</h2>
            <p>Admissions committees and employers make their own decisions. RoleEdge can’t guarantee an admit, an interview or a job offer.</p>
            <h2>Paid engagements</h2>
            <p>Fees, deliverables, number of sessions and timelines are agreed with you in writing before any paid work begins. Those agreed terms apply to the engagement.</p>
            <h2>Call requests</h2>
            <p>Requesting a time on this site doesn’t confirm a booking. We confirm, or suggest another time, by email.</p>
            <h2>Content and trademarks</h2>
            <p>Firm and school names and logos belong to their owners. Showing where mentees have gone doesn’t imply any partnership or endorsement.</p>
            <h2>Contact</h2>
            <p>
              Questions about these terms: <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
