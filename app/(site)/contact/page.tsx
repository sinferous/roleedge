import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send RoleEdge a message about MBA admissions, consulting interviews, a career change or your resume and LinkedIn.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        current="Contact"
        title={
          <>
            Tell us where <span className="accent">you’re headed.</span>
          </>
        }
        lead="Send a message and we’ll reply within one working day. If you already know you’d like to talk, book a free call instead."
      />
      <section className="content-section tone-sage" aria-label="Contact RoleEdge">
        <div className="container split">
          <div className="contact-aside">
            <h2>Other ways to reach us.</h2>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </dd>
              </div>
              <div>
                <dt>Free introductory call</dt>
                <dd>
                  <Link href="/book">Request a time</Link>
                </dd>
              </div>
              <div>
                <dt>LinkedIn</dt>
                <dd>
                  <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                    Mayank Kapoor<span className="sr-only"> (new tab)</span>
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div className="form-card">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
