import Link from "next/link";
import type { ReactNode } from "react";

export function PageHero({
  title,
  lead,
  crumb,
  current,
  children,
  media,
  backdrop,
}: {
  title: ReactNode;
  lead?: ReactNode;
  crumb?: { href: string; label: string };
  current: string;
  children?: ReactNode;
  /** A photo filling the right half of the header and fading into the navy. The text stacks on the left. */
  media?: ReactNode;
  /** A wide photo behind the whole header, faded into the navy. The layout and height stay as they are. */
  backdrop?: string;
}) {
  return (
    <section className={`page-hero${media ? " page-hero-media" : ""}${backdrop ? " page-hero-backdrop" : ""}`}>
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element -- web-sized photograph
        <img className="page-hero-backdrop-img" src={backdrop} alt="" fetchPriority="high" />
      )}
      <div className="container page-hero-inner">
        <div>
          <nav className="page-crumb" aria-label="Breadcrumb">
            {crumb ? (
              <>
                <Link href={crumb.href}>{crumb.label}</Link>
                <span aria-hidden="true">/</span>
              </>
            ) : (
              <>
                <Link href="/">Home</Link>
                <span aria-hidden="true">/</span>
              </>
            )}
            <span aria-current="page">{current}</span>
          </nav>
          <h1>{title}</h1>
          {media && lead && <p className="page-hero-lead">{lead}</p>}
          {media && children}
        </div>
        {!media && (lead || children) && (
          <div>
            {lead && <p className="page-hero-lead">{lead}</p>}
            {children}
          </div>
        )}
      </div>
      {media && <div className="page-hero-figure">{media}</div>}
    </section>
  );
}
