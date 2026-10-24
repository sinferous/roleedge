import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, GraduationCap, Landmark, UsersRound } from "lucide-react";
import { institutionAudiences, institutionOffers, institutionSteps, institutionsWorkedWith } from "@/lib/content/institutions";
import { mayank } from "@/lib/content/profile";
import { showPendingContent } from "@/lib/content";
import { site } from "@/lib/site";
import { Icon } from "@/components/site/Icons";
import { PageHero } from "@/components/site/PageHero";
import { MentorFacts } from "@/components/site/blocks";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "For institutions",
  description: "Workshops, placement preparation and higher-study guidance from RoleEdge for universities, colleges and companies.",
  alternates: { canonical: "/institutions" },
};

const audienceIcons = { career: GraduationCap, clubs: UsersRound, school: Landmark, company: Briefcase };

// Same colours, type and cards as the rest of the site, with its own structure: who we work with,
// the formats as numbered rows, the mentor, three steps, and the enquiry form as the closing section.
export default function InstitutionsPage() {
  return (
    <>
      <PageHero
        current="For institutions"
        title={
          <>
            Career and admissions sessions <span className="accent">for your students.</span>
          </>
        }
        lead="Sessions and programmes for universities, colleges and companies, led by a former Bain & Company Manager and Warwick MBA."
        media={
          // eslint-disable-next-line @next/next/no-img-element -- web-sized photograph
          <img src="/assets/institutions-hero.jpg" alt="" width={1672} height={941} fetchPriority="high" />
        }
      >
        <div className="page-hero-actions">
          <a className="button button-light" href="#enquire">
            Enquire for your group
          </a>
          <a className="text-link" href="#formats">
            See what we run
          </a>
        </div>
      </PageHero>

      <section className="inst-audience" aria-labelledby="who-title">
        <div className="container">
          <h2 id="who-title" className="inst-audience-title">
            Who we work with
          </h2>
          <ul className="inst-audience-row">
            {institutionAudiences.map((a) => {
              const Glyph = audienceIcons[a.icon];
              return (
                <li key={a.title}>
                  <span className="inst-audience-icon" aria-hidden="true">
                    <Glyph size={22} strokeWidth={1.75} />
                  </span>
                  <span>
                    <strong>{a.title}</strong>
                    <span>{a.body}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section inst-formats" id="formats" aria-labelledby="formats-title">
        <div className="container">
          <div className="study-heading reveal">
            <h2 id="formats-title">
              What we can <span className="services-title-accent">run.</span>
            </h2>
            <p>
              Each programme is shaped around your group, its goals and its calendar.
              {showPendingContent && <span className="pending-tag">Draft</span>}
            </p>
          </div>
          <ol className="format-rows">
            {institutionOffers.map((o, i) => (
              <li className="format-row reveal" key={o.title}>
                <span className="format-number" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="format-main">
                  <h3>{o.title}</h3>
                  <p>{o.body}</p>
                  <p className="format-suits">
                    <span>Suits</span> {o.suits}
                  </p>
                </div>
                <ul className="format-covers" aria-label={`${o.title} covers`}>
                  {o.covers.map((c) => (
                    <li key={c}>
                      <Icon name="check" />
                      {c}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mentor-section" aria-labelledby="lead-title">
        <div className="container mentor-layout">
          <figure className="mentor-photo">
            {/* eslint-disable-next-line @next/next/no-img-element -- collage keeps its own aspect ratio */}
            <img src={mayank.events} width={2048} height={1821} loading="lazy" alt={mayank.eventsAlt} />
          </figure>
          <div className="mentor-profile">
            <h2 id="lead-title">
              Led by <span className="mentor-name">Mayank Kapoor.</span>
            </h2>
            <p className="mentor-lead">{mayank.bio[0]}</p>
            <p className="mentor-bio">
              He has run sessions and mentoring at {institutionsWorkedWith.slice(0, -1).join(", ")} and{" "}
              {institutionsWorkedWith.at(-1)}.
            </p>
            <MentorFacts />
            <Link className="button button-outline-light mentor-about" href="/about">
              Get to know Mayank
            </Link>
          </div>
        </div>
      </section>

      <section className="section inst-steps" aria-labelledby="steps-title">
        <div className="container">
          <div className="study-heading reveal">
            <h2 id="steps-title">
              How it <span className="services-title-accent">works.</span>
            </h2>
            <p>From a first conversation to sessions your group can use.</p>
          </div>
          <ol className="inst-step-row">
            {institutionSteps.map((step, i) => (
              <li className="reveal" key={step.title}>
                <span className="inst-step-dot" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section inst-enquire" id="enquire" aria-labelledby="enquire-title">
        <div className="container">
          <div className="enquire-card">
            <div className="enquire-copy">
              <h2 id="enquire-title">
                Tell us about <span className="accent">your group.</span>
              </h2>
              <p>Share who the sessions are for and roughly when. We’ll reply within one working day with suggested formats.</p>
              <p className="enquire-mail">
                Prefer email? <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
            </div>
            <div className="form-card">
              <ContactForm
                defaultTopic="institution"
                messageLabel="About your group"
                messageHint="Institution, number of participants, what they’re preparing for, and preferred dates."
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
