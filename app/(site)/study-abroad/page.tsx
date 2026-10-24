import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getFaqs,
  getService,
  getStories,
  showPendingContent,
} from "@/lib/content";
import { resources } from "@/lib/content/resources";
import {
  applicationYear,
  programmes,
  studyStats,
  workAreas,
} from "@/lib/content/study-abroad";
import { TrustStats } from "@/components/home/TrustStats";
import { PageHero } from "@/components/site/PageHero";
import { ResourceFolder } from "@/components/site/ResourceFolder";
import { QuoteRotator } from "@/components/site/QuoteRotator";
import { Icon } from "@/components/site/Icons";
import { ClosingSection, FaqDetails } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "Study abroad",
  description:
    "MBA and master’s application support: school shortlisting, essays, admissions resumes and interview practice with RoleEdge.",
  alternates: { canonical: "/study-abroad" },
};

// Uses the home page's colours, type and folder cards, with its own structure: programmes,
// the application year as a timeline, four work areas, one featured story and the free planners.
export default async function StudyAbroadPage() {
  const service = await getService("mba-admissions");
  if (!service) notFound();
  const [stories, faqs] = await Promise.all([
    getStories("admissions"),
    getFaqs(service.faqIds),
  ]);
  const planners = resources.filter(
    (r) => r.track === "study-abroad" && (r.confirmed || showPendingContent),
  );
  const shownProgrammes = programmes.filter(
    (p) => p.confirmed || showPendingContent,
  );

  return (
    <>
      <PageHero
        current="Study abroad"
        title={
          <>
            Study abroad, <span className="accent">with a clear story.</span>
          </>
        }
        lead="MBA and master’s applications that connect where you’ve been with where you want to go, from shortlist to interview."
        media={
          // eslint-disable-next-line @next/next/no-img-element -- web-sized photograph
          <img
            src="/assets/study-abroad-hero.jpg"
            alt=""
            width={1672}
            height={941}
            fetchPriority="high"
          />
        }
      >
        <div className="page-hero-actions">
          <Link
            className="button button-light"
            href="/book?service=mba-admissions"
          >
            Get my roadmap
          </Link>
          <a className="text-link" href="#year">
            See the application year
          </a>
        </div>
      </PageHero>

      <TrustStats stats={studyStats} />

      {shownProgrammes.length > 0 && (
        <section
          className="section study-programmes"
          aria-labelledby="programmes-title"
        >
          <div className="container">
            <div className="study-heading reveal">
              <h2 id="programmes-title">
                Which programme{" "}
                <span className="services-title-accent">fits you?</span>
              </h2>
              <p>Not sure yet? That’s what the first call is for.</p>
            </div>
            <div className="programme-grid">
              {shownProgrammes.map((p) => (
                <article className="programme-card reveal" key={p.title}>
                  <h3>
                    {p.title}
                    {!p.confirmed && (
                      <span className="pending-tag">Pending approval</span>
                    )}
                  </h3>
                  <p>{p.suits}</p>
                  <h4>What we focus on</h4>
                  <ul>
                    {p.focus.map((f) => (
                      <li key={f}>
                        <Icon name="check" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="section study-year"
        id="year"
        aria-labelledby="year-title"
      >
        <div className="container">
          <div className="study-heading reveal">
            <h2 id="year-title">
              Your application{" "}
              <span className="services-title-accent">year.</span>
            </h2>
          </div>
          <div className="year-snake">
            <span className="year-path" aria-hidden="true">
              <i className="row-1" />
              <i className="turn-right" />
              <i className="row-2" />
              <i className="turn-left" />
              <i className="row-3" />
            </span>
            <ol>
              {applicationYear.map((m, i) => (
                <li className="year-step" key={m.when}>
                  <span className="year-dot" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="year-when">{m.when}</span>
                  <h3>{m.title}</h3>
                  <p>{m.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section study-work" aria-labelledby="work-title">
        <div className="container">
          <div className="study-heading reveal">
            <h2 id="work-title">
              What we work on{" "}
              <span className="services-title-accent">together.</span>
            </h2>
            <p>
              We agree the price, sessions and timeline with you before any paid
              work begins.
            </p>
          </div>
          <div className="work-folders">
            {workAreas.map((w, i) => (
              <article className="work-folder reveal" key={w.title}>
                <span className="work-folder-tab">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="work-folder-body">
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                  <ul>
                    {w.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {stories.length > 0 && (
        <section className="section study-story" aria-labelledby="story-title">
          <div className="container">
            <h2 id="story-title" className="sr-only">
              Client stories
            </h2>
            <QuoteRotator stories={stories} />
          </div>
        </section>
      )}

      {planners.length > 0 && (
        <section
          className="section resources-section study-planners"
          aria-labelledby="planners-title"
        >
          <div className="container">
            <div className="articles-heading">
              <h2 id="planners-title">
                Free planners for your{" "}
                <span className="services-title-accent">application.</span>
              </h2>
              <Link href="/resources">All free resources</Link>
            </div>
            <div className="resource-folders">
              {planners.map((r) => (
                <ResourceFolder
                  key={r.slug}
                  resource={r}
                  currentPath="/study-abroad"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        className="section faq-section"
        id="faq"
        aria-labelledby="faq-title"
      >
        <div className="container faq-layout">
          <div className="faq-intro">
            <h2 id="faq-title">Questions about applications?</h2>
            <p>Something else on your mind?</p>
            <Link className="text-link" href="/faq">
              See all questions
            </Link>
          </div>
          <FaqDetails faqs={faqs} />
        </div>
      </section>

      <ClosingSection title="Let’s talk about your application." />
    </>
  );
}
