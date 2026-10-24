import type { Metadata } from "next";
import { Suspense } from "react";
import { getServices } from "@/lib/content";
import { site } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { BookingFlow } from "@/components/booking/BookingFlow";

export const metadata: Metadata = {
  title: "Book a free call",
  description: "Request a free 30-minute introductory call with RoleEdge about admissions, consulting or your next career move.",
  alternates: { canonical: "/book" },
};

export default async function BookPage() {
  const services = (await getServices()).map(({ slug, title, promise }) => ({ slug, title, promise }));
  return (
    <>
      <PageHero
        current="Book a free call"
        title={
          <>
            Let’s talk about <span className="accent">your next step.</span>
          </>
        }
        lead="A free 30-minute conversation about where you are, what you’re aiming for and whether RoleEdge is the right fit."
      />
      <section className="content-section tone-sage" aria-label="Request a call">
        <div className="container split">
          <div className="split-intro">
            <h2>What to expect.</h2>
            <p>We’ll ask about your experience, your goal and your timeline, and you can ask anything about how we work and what it costs.</p>
            <p>
              Prefer email? Write to <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </div>
          <Suspense fallback={<div className="form-card">Loading…</div>}>
            <BookingFlow services={services} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
