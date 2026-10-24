import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "What personal data RoleEdge collects through this website, why, how long it is kept, and how to ask for it to be deleted.",
  alternates: { canonical: "/privacy" },
};

// TODO(content): legal review before launch (docs/PRD.md C7). This draft reflects how the site actually handles data.
export default function PrivacyPage() {
  return (
    <>
      <PageHero current="Privacy" title="Privacy notice." lead={`Version ${site.consentTextVersion}. Draft pending legal review.`} />
      <section className="content-section">
        <div className="container">
          <div className="prose">
            <p>
              This notice explains what RoleEdge collects through this website and how it is used. If you have a question, email{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
            <h2>What we collect</h2>
            <ul>
              <li>
                <strong>Contact form:</strong> your name, email, optional phone number, the topic you choose and your message.
              </li>
              <li>
                <strong>Call requests:</strong> the same details, plus the service and the time you request.
              </li>
              <li>
                <strong>Starting-point planner:</strong> nothing, unless you ask us to email your plan. Then we keep your email address and your three answers.
              </li>
              <li>
                <strong>Free resources:</strong> your name, email and which guide you download. We email you the link and may follow up about it.
              </li>
              <li>
                <strong>Analytics:</strong> anonymous, cookie-free page statistics. We don’t use advertising pixels or tracking cookies.
              </li>
            </ul>
            <h2>Why we use it</h2>
            <p>Only to reply to you, arrange the call you asked for, send the plan or resource you requested, and follow up about it. We don’t sell your data or send marketing emails without separate permission.</p>
            <h2>How long we keep it</h2>
            <ul>
              <li>Enquiries and call requests: up to 24 months after our last contact.</li>
              <li>Planner emails: up to 12 months.</li>
              <li>Free resource downloads: up to 12 months.</li>
              <li>Messages marked as spam: 30 days.</li>
            </ul>
            <h2>Who processes it</h2>
            <p>Our website host, our database provider (data stored in India), our email delivery service and a spam-protection service. Each processes data only to provide its service to us.</p>
            <h2>Your rights</h2>
            <p>
              You can ask to see, correct or delete your data at any time by emailing <a href={`mailto:${site.email}`}>{site.email}</a>. We’ll complete deletion requests within 30 days.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
