import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/content";
import { Icon } from "@/components/site/Icons";
import { PageHero } from "@/components/site/PageHero";
import { ClosingSection } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "Services",
  description: "MBA and master’s admissions, consulting and career moves, and resume & LinkedIn support from RoleEdge.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        current="Services"
        title={
          <>
            How <span className="accent">we can help.</span>
          </>
        }
        lead="Choose the support you need, from a focused profile review to full application and interview preparation. Every engagement starts with a free conversation."
      />
      <section className="content-section" aria-label="All services">
        <div className="container">
          {services.map((s) => (
            <article className="service-row reveal" key={s.slug}>
              <span className="card-number">{s.number}</span>
              <div>
                <h2>
                  <Link href={`/services/${s.slug}`}>{s.title}</Link>
                </h2>
                <p>{s.summary}</p>
                <div className="service-row-actions">
                  <Link className="button button-dark" href={`/book?service=${s.slug}`}>
                    Book a free call
                  </Link>
                  <Link className="text-link" href={`/services/${s.slug}`}>
                    About this service
                  </Link>
                </div>
              </div>
              <ul className="check-list">
                {s.inclusions.map((item) => (
                  <li key={item}>
                    <Icon name="check" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <ClosingSection />
    </>
  );
}
