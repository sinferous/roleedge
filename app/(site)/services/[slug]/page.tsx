import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFaqs, getService, getServices, getStories } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";
import { Icon } from "@/components/site/Icons";
import { PageHero } from "@/components/site/PageHero";
import { ClosingSection, FaqDetails } from "@/components/site/blocks";
import { StoryGrid } from "@/components/site/StoryGrid";
import { JsonLd } from "@/components/content/JsonLd";

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = await getService((await params).slug);
  if (!service) return {};
  return { title: service.title, description: service.summary, alternates: { canonical: `/services/${service.slug}` } };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = await getService((await params).slug);
  if (!service) notFound();
  const [stories, faqs] = await Promise.all([getStories(service.storyField), getFaqs(service.faqIds)]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.summary,
          provider: { "@type": "Organization", name: "RoleEdge", url: absoluteUrl("/") },
          url: absoluteUrl(`/services/${service.slug}`),
        }}
      />
      <PageHero current={service.shortTitle} crumb={{ href: "/services", label: "Services" }} title={service.headline} lead={service.summary}>
        <div className="page-hero-actions">
          <Link className="button button-light" href={`/book?service=${service.slug}`}>
            Book a free call
          </Link>
          <Link className="text-link" href="/start">
            Not sure yet? Find your starting point
          </Link>
        </div>
      </PageHero>

      <section className="content-section" aria-labelledby="fit-title">
        <div className="container split">
          <div className="split-intro reveal">
            <h2 id="fit-title">Who this is for.</h2>
            <p>If any of these sound familiar, this service is likely a good fit. The first call will confirm it.</p>
          </div>
          <ul className="check-list reveal">
            {service.audience.map((a) => (
              <li key={a}>
                <Icon name="check" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="content-section tone-sage" aria-labelledby="inc-title">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2 id="inc-title">What we work on together.</h2>
            </div>
            <p>We agree the price, deliverables, number of sessions and timeline with you before any paid work begins.</p>
          </div>
          <div className="card-grid">
            {service.inclusions.map((item, i) => (
              <article className="info-card reveal" key={item}>
                <span className="card-number">{String(i + 1).padStart(2, "0")}</span>
                <h3>{item}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section approach-section" aria-labelledby="how-title">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2 id="how-title">How it runs.</h2>
            </div>
            <p>Three stages, at a pace that fits your deadlines.</p>
          </div>
          <div className="process-grid">
            {service.process.map((step, i) => (
              <article className="process-step" key={step.title}>
                <div className="step-top">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <span className="step-line" aria-hidden="true"></span>
                  {i === service.process.length - 1 && <Icon name="check" />}
                </div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {stories.length > 0 && (
        <section className="content-section" aria-labelledby="stories-title">
          <div className="container">
            <div className="section-heading">
              <div>
                <h2 id="stories-title">Where clients went next.</h2>
              </div>
              <Link className="text-link" href="/stories">
                All client stories
              </Link>
            </div>
            <StoryGrid stories={stories.slice(0, 3)} />
          </div>
        </section>
      )}

      <section className="section faq-section" aria-labelledby="faq-title">
        <div className="container faq-layout">
          <div className="faq-intro">
            <h2 id="faq-title">Questions about this service.</h2>
            <Link className="text-link" href="/faq">
              See all questions
            </Link>
          </div>
          <FaqDetails faqs={faqs} />
        </div>
      </section>

      <ClosingSection />
    </>
  );
}
