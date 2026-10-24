import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFaqs, getService, getStories, showPendingContent } from "@/lib/content";
import { destinations } from "@/lib/content/profile";
import { resources } from "@/lib/content/resources";
import { cvRewrites, mockCase, practiceSteps, situations } from "@/lib/content/career";
import { PageHero } from "@/components/site/PageHero";
import { ResourceFolder } from "@/components/site/ResourceFolder";
import { Testimonials } from "@/components/home/Testimonials";
import { Icon, LearnChevron } from "@/components/site/Icons";
import { ClosingSection, FaqDetails } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "Career",
  description: "Consulting interview preparation, career transitions, and resume and LinkedIn support with RoleEdge.",
  alternates: { canonical: "/career" },
};

// Same colours, type and folder cards as the rest of the site, with its own structure: firm logos,
// three starting situations, a sample practice round, CV rewrites, offer stories and free tools.
export default async function CareerPage() {
  const service = await getService("consulting-career-moves");
  if (!service) notFound();
  const [stories, faqs] = await Promise.all([getStories("consulting"), getFaqs(service.faqIds)]);
  // Three picks across interviews, offers and career changes; the rest are on /resources.
  const featured = ["case-interview-guide", "salary-negotiation-script-pack", "career-pivot-toolkit"];
  const tools = resources.filter((r) => featured.includes(r.slug) && (r.confirmed || showPendingContent));

  return (
    <>
      <PageHero
        current="Career"
        title={
          <>
            Prepare for the room <span className="accent">you want to be in.</span>
          </>
        }
        lead="Consulting interviews, career changes, and a CV and LinkedIn profile that show what your experience is worth."
        media={
          // eslint-disable-next-line @next/next/no-img-element -- web-sized photograph
          <img src="/assets/career-hero.jpg" alt="" width={1672} height={941} fetchPriority="high" />
        }
      >
        <div className="page-hero-actions">
          <Link className="button button-light" href="/book?service=consulting-career-moves">
            Get my roadmap
          </Link>
          <a className="text-link" href="#mock-case">
            See a practice round
          </a>
        </div>
      </PageHero>

      <section className="placements career-logos" aria-labelledby="logos-title">
        <div className="container placements-inner">
          <h2 id="logos-title">Firms our clients have joined</h2>
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

      <section className="section career-situations" aria-labelledby="situations-title">
        <div className="container">
          <div className="study-heading reveal">
            <h2 id="situations-title">
              Where are you <span className="services-title-accent">right now?</span>
            </h2>
            <p>Pick the one that sounds most like you. Most people start with a free call either way.</p>
          </div>
          <div className="situation-grid">
            {situations.map((s, i) => (
              <article className="situation-card reveal" key={s.title}>
                <span className="situation-number">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                <p>{s.who}</p>
                <ul>
                  {s.help.map((h) => (
                    <li key={h}>
                      <Icon name="check" />
                      {h}
                    </li>
                  ))}
                </ul>
                <a className="t-learn" href={s.href}>
                  {s.cta}
                  <LearnChevron />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section career-case" id="mock-case" aria-labelledby="case-title">
        <div className="container case-layout">
          <div className="case-copy reveal">
            <h2 id="case-title">
              Inside a practice <span className="services-title-accent">case.</span>
            </h2>
            <ol className="case-steps">
              {practiceSteps.map((s, i) => (
                <li key={s.title}>
                  <span aria-hidden="true">{i + 1}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <figure className="case-sheet reveal" aria-label="Example of a practice round">
            <span className="case-tag">Example</span>
            <div className="case-block">
              <span className="case-label">Interviewer</span>
              <p className="case-prompt">“{mockCase.prompt}”</p>
            </div>
            <div className="case-block">
              <span className="case-label">Your structure</span>
              <ol className="case-tree">
                {mockCase.structure.map((b) => (
                  <li key={b.title}>
                    <strong>{b.title}</strong>
                    <span>{b.body}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="case-block">
              <span className="case-label">Feedback</span>
              <ul className="case-feedback">
                {mockCase.feedback.map((f) => (
                  <li key={f.text} className={f.good ? "is-good" : "is-work"}>
                    <span className="sr-only">{f.good ? "Strength: " : "To work on: "}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
          </figure>
        </div>
      </section>

      <section className="section career-cv" id="cv" aria-labelledby="cv-title">
        <div className="container">
          <div className="study-heading reveal">
            <h2 id="cv-title">
              Your CV, <span className="services-title-accent">before and after.</span>
            </h2>
            <p>The same experience, rewritten around what changed because of you. Examples only.</p>
          </div>
          <div className="cv-compare">
            <div className="cv-col-head" aria-hidden="true">
              <span>Before</span>
              <span>After</span>
            </div>
            {cvRewrites.map((r) => (
              <div className="cv-row reveal" key={r.before}>
                <p className="cv-before">
                  <span className="sr-only">Before: </span>
                  {r.before}
                </p>
                <span className="cv-arrow" aria-hidden="true">
                  <Icon name="arrow-right" />
                </span>
                <p className="cv-after">
                  <span className="sr-only">After: </span>
                  {r.after}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials stories={stories} title="Offers our clients got." />

      {tools.length > 0 && (
        <section className="section resources-section career-tools" id="resources" aria-labelledby="tools-title">
          <div className="container">
            <div className="articles-heading">
              <h2 id="tools-title">
                Free tools for your <span className="services-title-accent">next move.</span>
              </h2>
              <Link href="/resources">All free resources</Link>
            </div>
            <div className="resource-folders">
              {tools.map((r) => (
                <ResourceFolder key={r.slug} resource={r} currentPath="/career" />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section faq-section" id="faq" aria-labelledby="faq-title">
        <div className="container faq-layout">
          <div className="faq-intro">
            <h2 id="faq-title">Questions about career support?</h2>
            <p>Something else on your mind?</p>
            <Link className="text-link" href="/faq">
              See all questions
            </Link>
          </div>
          <FaqDetails faqs={faqs} />
        </div>
      </section>

      <ClosingSection title="Let’s talk about your next role." />
    </>
  );
}
