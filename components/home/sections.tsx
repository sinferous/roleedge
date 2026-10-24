import Link from "next/link";
import type { Post } from "@/lib/content/types";
import { categories } from "@/lib/content/posts";
import { mayank } from "@/lib/content/profile";
import { globalStats, journey, mapPins } from "@/lib/content/home";
import { Icon, LearnChevron } from "@/components/site/Icons";
import { showPendingContent } from "@/lib/content";
import { WorldMap } from "./WorldMap";
import { JourneyStepper } from "./JourneyStepper";
import { CountUp } from "./CountUp";

const heroFolders = [
  { href: "/study-abroad", label: "Study abroad", note: "MBA & master’s applications" },
  { href: "/career", label: "Career", note: "Consulting & career moves" },
  { href: "/institutions", label: "For institutions", note: "Universities & companies" },
];

/** Folder tabs sitting on the bottom edge of the hero photo, one per part of RoleEdge by default. */
export function HeroFolders({ folders = heroFolders, label = "Explore RoleEdge" }: { folders?: { href: string; label: string; note: string }[]; label?: string }) {
  return (
    <nav className="hero-folders" aria-label={label}>
      <div className="container hero-folders-row">
        {folders.map((f) => (
          <Link key={f.href} href={f.href} className="hero-folder">
            <span className="hero-folder-label">{f.label}</span>
            <span className="hero-folder-note">{f.note}</span>
            <Icon name="arrow-right" />
          </Link>
        ))}
      </div>
    </nav>
  );
}

const strengths = [
  { title: "Consulting from the inside", body: "Former Manager at Bain & Company, who has run case teams and evaluated candidates." },
  { title: "Finance depth", body: "Chartered Accountant with All India Rank 4 in ICAI’s Masters in Business Finance." },
  { title: "Admissions experience", body: "Warwick Business School MBA, who has been through the application himself." },
];

/** What sets the mentoring apart: a dark card with Mayank and one statement, then his three strengths. */
export function SetsApart() {
  return (
    <section className="apart-section" id="mentor" aria-labelledby="apart-title">
      <div className="container">
        <div className="apart-head reveal">
          <h2 id="apart-title">
            What sets our <span className="apart-accent">mentoring</span> apart?
          </h2>
          <p>Most mentors draw on one kind of experience. Mayank brings three, so your plan holds up from every side.</p>
        </div>
        <div className="apart-card reveal">
          <div className="apart-portrait">
            {/* eslint-disable-next-line @next/next/no-img-element -- supplied portrait */}
            <img src={mayank.portrait} alt={mayank.portraitAlt} width={1024} height={1024} loading="lazy" />
          </div>
          <div className="apart-statement">
            <p>
              Unlike typical mentors, Mayank Kapoor brings consulting, finance and admissions experience together,{" "}
              <mark>because you deserve more than general advice.</mark>
            </p>
            <div className="apart-actions">
              <Link className="button button-outline-light" href="/about">
                Get to know Mayank
              </Link>
            </div>
          </div>
        </div>
        <ul className="apart-strengths">
          {strengths.map((s) => (
            <li className="reveal" key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The journey, simplified: five stages along one line. */
export function Journey() {
  return (
    <section className="journey-section" id="approach" aria-labelledby="journey-title">
      <div className="container">
        <div className="section-heading reveal">
          <div>
            <h2 id="journey-title">
              Your journey with <span className="services-title-accent">RoleEdge.</span>
            </h2>
          </div>
        </div>
        <div className="reveal">
          <JourneyStepper stages={journey} />
        </div>
      </div>
    </section>
  );
}

/** International reach: the world map with a summary card per client country, numbers beneath. */
export function GlobalReach() {
  return (
    <section className="global-section" id="reach" aria-labelledby="global-title">
      <div className="container">
        <div className="global-head reveal">
          <h2 id="global-title">
            Clients across <span className="apart-accent">seven countries.</span>
          </h2>
          <p>Point at a country to see who RoleEdge works with there.</p>
        </div>
        <div className="reveal">
          <WorldMap pins={mapPins} showSamples={showPendingContent} />
        </div>
        <ul className="global-stats">
          {globalStats.map((s) => (
            <li className="reveal" key={s.label}>
              <strong>
                <span className="sr-only">{`${s.value.toLocaleString("en-IN")}${s.suffix}`}</span>
                <span aria-hidden="true">
                  <CountUp value={s.value} />
                  <span className="global-stat-plus">{s.suffix}</span>
                </span>
              </strong>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Three articles in one view, each filed as a small folder with its category on the tab. */
export function BlogFolders({ posts }: { posts: Post[] }) {
  return (
    <section className="articles-section" id="articles" aria-labelledby="articles-title">
      <div className="container">
        <div className="articles-heading">
          <h2 id="articles-title">
            Guides for your <span className="services-title-accent">next move.</span>
          </h2>
          <Link href="/blog">Browse all articles</Link>
        </div>
        <div className="blog-folders">
          {posts.slice(0, 3).map((p) => (
            <Link className="blog-folder reveal" href={`/blog/${p.slug}`} key={p.slug}>
              <span className="blog-folder-tab">{categories.find((c) => c.slug === p.category)?.title}</span>
              <span className="blog-folder-body">
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized cover */}
                <img src={p.cover} alt="" width={1672} height={941} loading="lazy" />
                <span className="blog-folder-title">{p.title.split(":")[0]}</span>
                <span className="blog-folder-excerpt">{p.excerpt}</span>
                <span className="t-learn">
                  Read article
                  <LearnChevron />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
