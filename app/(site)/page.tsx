import Link from "next/link";
import { getFaqs, getPosts, getStories, showPendingContent } from "@/lib/content";
import { helpAreas } from "@/lib/content/home";
import { destinations, edgeaiTools, trustStats } from "@/lib/content/profile";
import { site } from "@/lib/site";
import { ServiceTabs } from "@/components/home/ServiceTabs";
import { Testimonials } from "@/components/home/Testimonials";
import { Planner } from "@/components/home/Planner";
import { TrustStats } from "@/components/home/TrustStats";
import { RotatingWords } from "@/components/home/RotatingWords";
import { BlogFolders, GlobalReach, HeroFolders, Journey, SetsApart } from "@/components/home/sections";
import { ClosingSection, FaqDetails } from "@/components/site/blocks";

export default async function HomePage() {
  const [stories, posts, faqs] = await Promise.all([getStories(), getPosts(), getFaqs()]);

  return (
    <>
      <section className="hero hero-banner" id="home" aria-labelledby="hero-title">
        {/* eslint-disable-next-line @next/next/no-img-element -- full-bleed hero photograph, already web-sized */}
        <img className="hero-banner-photo" src="/assets/home-hero.jpg" alt="" aria-hidden="true" width={1942} height={809} fetchPriority="high" />
        <div className="hero-tint" aria-hidden="true"></div>
        <div className="container hero-content">
          <div className="hero-copy">
            <h1 id="hero-title">
              <span className="hero-line">Your next move,</span>
              <br />
              <span className="hero-line">
                with a{" "}
                <span className="hero-highlight">
                  <RotatingWords words={["clear plan.", "sharper story.", "stronger CV.", "real edge."]} />
                </span>
              </span>
            </h1>
            <p className="hero-description">Personal guidance for MBA applications, consulting interviews, and career changes.</p>
            <div className="hero-actions">
              <Link className="button button-dark" href="/book">
                Get my roadmap
              </Link>
              <a className="text-link" href="#services">
                Explore services
              </a>
            </div>
          </div>
        </div>
        <HeroFolders />
      </section>

      <TrustStats stats={trustStats} />

      <section className="placements" aria-labelledby="placements-title">
        <div className="container placements-inner">
          <h2 id="placements-title">Where mentees have gone</h2>
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

      <section className="section services-section" id="services" aria-labelledby="services-title">
        <div className="container">
          <ServiceTabs
            areas={helpAreas}
            showPending={showPendingContent}
            heading={
              <h2 id="services-title" className="help-title">
                How <span className="services-title-accent">we can help.</span>
              </h2>
            }
          />
        </div>
      </section>

      <SetsApart />

      <Journey />

      <section className="edgeai-section" id="edgeai" aria-labelledby="edgeai-title">
        <div className="container edgeai-layout">
          <div className="edgeai-intro">
            <h2 id="edgeai-title">EdgeAI tools for the work between sessions.</h2>
            <p>RoleEdge’s toolkit covers resumes, job matching, LinkedIn, and interview practice. Use it for quick feedback alongside personal guidance.</p>
            <Link className="edgeai-link" href="/edgeai">
              Explore EdgeAI
            </Link>
          </div>
          <ul className="edgeai-tool-list" aria-label="EdgeAI capabilities">
            {edgeaiTools.map((t, i) => (
              <li key={t.title}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {t.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Testimonials stories={stories} />

      <GlobalReach />

      <section className="starting-section" id="starting-point" aria-labelledby="starting-title">
        <div className="container starting-layout">
          <div className="starting-copy">
            <h2 id="starting-title">Not sure where to start?</h2>
            <p>Answer three questions for suggested next steps. No email needed.</p>
          </div>
          <Planner />
        </div>
      </section>

      <section className="section faq-section" id="faq" aria-labelledby="faq-title">
        <div className="container faq-layout">
          <div className="faq-intro">
            <h2 id="faq-title">Questions before you start?</h2>
            <p>Something else on your mind?</p>
            <a className="text-link" href={`mailto:${site.email}`}>
              Ask us directly
            </a>
          </div>
          <FaqDetails faqs={faqs.filter((f) => f.id !== "edgeai")} />
        </div>
      </section>

      <BlogFolders posts={posts} />

      <ClosingSection />
    </>
  );
}
