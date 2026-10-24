import Link from "next/link";
import type { Faq, Post } from "@/lib/content/types";
import { credentials } from "@/lib/content/profile";
import { site } from "@/lib/site";
import { CopyEmail } from "@/components/home/CopyEmail";
import { LearnChevron } from "./Icons";

// Shared v1 building blocks used on the home page and the inner pages.

export function MentorFacts() {
  return (
    <dl className="mentor-facts">
      {credentials.map((c) => {
        const [org, extra] = c.detail.split(" · ");
        return (
          <div key={c.title}>
            <dt>{org}</dt>
            <dd>{extra ? `${c.title} · ${extra}` : c.title}</dd>
          </div>
        );
      })}
    </dl>
  );
}

export function FaqDetails({ faqs, name = "roleedge-faq" }: { faqs: Faq[]; name?: string }) {
  return (
    <div className="faq-list">
      {faqs.map((faq, i) => (
        <details key={faq.id} name={name} open={i === 0}>
          <summary>
            {faq.question}
            <span className="faq-symbol" aria-hidden="true"></span>
          </summary>
          <div className="faq-answer">
            {faq.answer.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

export function ArticleCard({ post }: { post: Post }) {
  return (
    <Link className="article-card" href={`/blog/${post.slug}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- covers are pre-sized */}
      <img className="article-image" src={post.cover} alt={post.coverAlt} width={1672} height={941} loading="lazy" decoding="async" />
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <span className="t-learn">
        Read article
        <LearnChevron />
      </span>
    </Link>
  );
}

export function ClosingSection({ title = "Let’s talk about your next step." }: { title?: string }) {
  return (
    <section className="closing-section" aria-labelledby="closing-title">
      <div className="container closing-card">
        <div className="closing-copy">
          <h2 id="closing-title">{title}</h2>
          <div className="closing-actions">
            <Link className="button button-dark" href="/book">
              Book a free call
            </Link>
          </div>
        </div>
        <CopyEmail email={site.email} />
      </div>
    </section>
  );
}
