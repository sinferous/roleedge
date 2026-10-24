import type { Metadata } from "next";
import Link from "next/link";
import { edgeaiTools } from "@/lib/content/profile";
import { site } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { ClosingSection } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "EdgeAI",
  description: "EdgeAI gives RoleEdge clients quick feedback on resumes, job fit, LinkedIn and interview practice between mentoring sessions.",
  alternates: { canonical: "/edgeai" },
};

const edgeaiHref = `${site.edgeaiUrl}?utm_source=roleedge.com&utm_medium=referral&utm_campaign=edgeai_page`;

export default function EdgeAiPage() {
  return (
    <>
      <PageHero
        current="EdgeAI"
        title={
          <>
            EdgeAI tools for the work <span className="accent">between sessions.</span>
          </>
        }
        lead="RoleEdge’s toolkit covers resumes, job matching, LinkedIn and interview practice. Use it for quick feedback alongside personal guidance."
      >
        <div className="page-hero-actions">
          <a className="button button-light" href={edgeaiHref} target="_blank" rel="noopener noreferrer">
            Open EdgeAI<span className="sr-only"> (new tab)</span>
          </a>
        </div>
      </PageHero>

      <section className="edgeai-section" aria-labelledby="tools-title">
        <div className="container edgeai-layout">
          <div className="edgeai-intro">
            <h2 id="tools-title">Four tools, one purpose: arrive at each session better prepared.</h2>
            <p>EdgeAI supports the personal guidance; it doesn’t replace it. Use it to test a resume against a role, check your LinkedIn positioning, or rehearse answers before a mock interview.</p>
          </div>
          <ul className="edgeai-tool-list" aria-label="EdgeAI capabilities">
            {edgeaiTools.map((t, i) => (
              <li key={t.title}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {t.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="content-section" aria-labelledby="detail-title">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2 id="detail-title">What each tool does.</h2>
            </div>
            <p>Feedback is a starting point for a conversation with your mentor, not a verdict on your profile.</p>
          </div>
          <div className="card-grid two">
            {edgeaiTools.map((t, i) => (
              <article className="info-card reveal" key={t.title}>
                <span className="card-number">{String(i + 1).padStart(2, "0")}</span>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </article>
            ))}
          </div>
          <p className="muted-note">
            Prefer to start with a person? <Link href="/book">Book a free call</Link> and we’ll suggest where EdgeAI fits in your preparation.
          </p>
        </div>
      </section>

      <ClosingSection />
    </>
  );
}
