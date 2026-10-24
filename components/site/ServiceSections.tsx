import Link from "next/link";
import type { Service } from "@/lib/content/types";
import { Icon } from "./Icons";

// Who it's for, what's included and how it runs, for one service. Used by the service,
// study abroad and career pages so the copy only lives in lib/content/services.ts.
export function ServiceSections({ service, headingPrefix }: { service: Service; headingPrefix?: string }) {
  const id = service.slug;
  return (
    <>
      <section className="content-section" aria-labelledby={`${id}-fit`}>
        <div className="container split">
          <div className="split-intro reveal">
            {headingPrefix && <span className="card-number">{headingPrefix}</span>}
            <h2 id={`${id}-fit`}>{service.headline}</h2>
            <p>{service.summary}</p>
            <div className="service-row-actions">
              <Link className="button button-dark" href={`/book?service=${service.slug}`}>
                Book a free call
              </Link>
            </div>
          </div>
          <div className="reveal">
            <h3 className="list-title">This is likely a good fit if…</h3>
            <ul className="check-list">
              {service.audience.map((a) => (
                <li key={a}>
                  <Icon name="check" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="content-section tone-sage" aria-labelledby={`${id}-inc`}>
        <div className="container">
          <div className="section-heading">
            <div>
              <h2 id={`${id}-inc`}>What we work on together.</h2>
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

      <section className="section approach-section" aria-labelledby={`${id}-how`}>
        <div className="container">
          <div className="section-heading">
            <div>
              <h2 id={`${id}-how`}>How it runs.</h2>
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
    </>
  );
}
