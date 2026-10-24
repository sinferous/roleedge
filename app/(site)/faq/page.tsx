import type { Metadata } from "next";
import { getFaqs } from "@/lib/content";
import { site } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { ClosingSection, FaqDetails } from "@/components/site/blocks";
import { JsonLd } from "@/components/content/JsonLd";

export const metadata: Metadata = {
  title: "Common questions",
  description: "Who RoleEdge is for, what happens in the first call, how fees work, and why no one can guarantee an admit or offer.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  const groups = [...new Set(faqs.map((f) => f.group))];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer.join(" ") },
          })),
        }}
      />
      <PageHero
        current="Common questions"
        title={
          <>
            Questions <span className="accent">before you start?</span>
          </>
        }
        lead={
          <>
            Something else on your mind? Email <a href={`mailto:${site.email}`}>{site.email}</a> and we’ll reply within one working day.
          </>
        }
      />
      {groups.map((group, i) => (
        <section className={`section faq-section${i ? " content-section" : ""}`} key={group} aria-labelledby={`faq-${i}`}>
          <div className="container faq-layout">
            <div className="faq-intro">
              <h2 id={`faq-${i}`}>{group}.</h2>
            </div>
            <FaqDetails faqs={faqs.filter((f) => f.group === group)} name={`faq-${i}`} />
          </div>
        </section>
      ))}
      <ClosingSection />
    </>
  );
}
