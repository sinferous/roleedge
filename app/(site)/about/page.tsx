import type { Metadata } from "next";
import Link from "next/link";
import { approach, mayank, trustStats } from "@/lib/content/profile";
import { bothSides, careerPath, founderNote } from "@/lib/content/about";
import { showPendingContent } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";
import { Icon } from "@/components/site/Icons";
import { ClosingSection } from "@/components/site/blocks";
import { TrustStats } from "@/components/home/TrustStats";
import { PathStory } from "@/components/site/PathStory";
import { JsonLd } from "@/components/content/JsonLd";

export const metadata: Metadata = {
  title: "About Mayank Kapoor",
  description: "Mayank Kapoor is a former Bain & Company Manager, Warwick Business School MBA and Chartered Accountant who founded RoleEdge.",
  alternates: { canonical: "/about" },
};

// Same colours, type and cards as the rest of the site, with its own structure: his path as a
// timeline, both sides of the hiring table, a founder's note, the events photos, how he works,
// and the numbers once.
export default function AboutPage() {
  const draft = showPendingContent && <span className="pending-tag">Draft</span>;
  // The banner shows the first three numbers.
  const bannerStats = trustStats.slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: mayank.name,
          jobTitle: "Founder, RoleEdge",
          image: absoluteUrl(mayank.portrait),
          alumniOf: { "@type": "CollegeOrUniversity", name: "Warwick Business School" },
          sameAs: [site.linkedin],
          worksFor: { "@type": "Organization", name: "RoleEdge", url: absoluteUrl("/") },
        }}
      />
      {/* The one page about a real person gets a full-screen banner: Mayank on the left, the words on the right.
          The photo is generated from his real headshot. TODO(content): Mayank to approve it before launch. */}
      <section className="page-hero about-banner" aria-labelledby="about-title">
        {/* eslint-disable-next-line @next/next/no-img-element -- web-sized photograph */}
        <img className="about-banner-photo" src="/assets/about-hero.jpg" alt="" width={1672} height={941} fetchPriority="high" />
        <div className="container about-banner-inner">
          <div className="about-banner-copy">
            <nav className="page-crumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">About us</span>
            </nav>
            <h1 id="about-title">
              Meet <span className="accent">Mayank Kapoor.</span>
            </h1>
            <p className="page-hero-lead">
              Former Manager at Bain & Company, Warwick Business School MBA and Chartered Accountant. Founder of RoleEdge.
            </p>
            <div className="page-hero-actions">
              <Link className="button button-light" href="/book">
                Book a free call
              </Link>
              <a className="text-link" href={site.linkedin} target="_blank" rel="noopener noreferrer">
                View LinkedIn<span className="sr-only"> (new tab)</span>
              </a>
            </div>
          </div>
        </div>
        <TrustStats className="about-banner-stats" stats={bannerStats} />
      </section>

      <section className="section about-path" aria-labelledby="path-title">
        <PathStory
          steps={careerPath}
          heading={
            <h2 id="path-title">
              The path <span className="services-title-accent">so far.</span>
            </h2>
          }
          note={<p className="path-story-note">From finance to consulting to founder.{draft}</p>}
        />
      </section>

      <section className="section about-sides" aria-labelledby="sides-title">
        <div className="container">
          <div className="study-heading reveal">
            <h2 id="sides-title">
              Both sides of <span className="services-title-accent">the table.</span>
            </h2>
            <p>Why his advice is practical, not theoretical.</p>
          </div>
          <div className="sides-grid">
            {bothSides.map((side) => (
              <article className="side-panel reveal" key={side.label}>
                <span className="side-label">{side.label}</span>
                <h3>{side.title}</h3>
                <ul>
                  {side.points.map((p) => (
                    <li key={p}>
                      <Icon name="check" />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-note" aria-labelledby="note-title">
        <div className="container">
          {/* In his own words, from his positioning brief. */}
          <figure className="founder-note reveal">
            <h2 id="note-title" className="founder-note-label">
              Why RoleEdge exists
            </h2>
            <blockquote>
              {founderNote.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </blockquote>
            <figcaption className="founder-note-by">Mayank Kapoor, founder</figcaption>
          </figure>
        </div>
      </section>

      <section className="section about-room" aria-labelledby="room-title">
        <div className="container">
          <div className="study-heading reveal">
            <h2 id="room-title">
              In the <span className="services-title-accent">room.</span>
            </h2>
            <p>Speaking with students and professionals at Warwick Business School and Bain & Company events.</p>
          </div>
          <figure className="room-photo reveal">
            {/* eslint-disable-next-line @next/next/no-img-element -- collage keeps its own aspect ratio */}
            <img src={mayank.events} width={2048} height={1821} loading="lazy" alt={mayank.eventsAlt} />
          </figure>
        </div>
      </section>

      <section className="section about-approach" aria-labelledby="approach-title">
        <div className="container">
          <div className="study-heading reveal">
            <h2 id="approach-title">
              How he <span className="services-title-accent">works.</span>
            </h2>
            <p>Honest about the odds, specific about the work.</p>
          </div>
          <ol className="principle-list">
            {approach.map((step, i) => (
              <li className="reveal" key={step.title}>
                <span className="principle-number" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ClosingSection title="Let’s talk about your next step." />
    </>
  );
}
