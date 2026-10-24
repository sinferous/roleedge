import Link from "next/link";
import type { ReactNode } from "react";

export function PageHero({
  title,
  lead,
  crumb,
  current,
  children,
  media,
}: {
  title: ReactNode;
  lead?: ReactNode;
  crumb?: { href: string; label: string };
  current: string;
  children?: ReactNode;
  /** A photo filling the right half of the header and fading into the navy. The text stacks on the left. */
  media?: ReactNode;
}) {
  return (
    <section className={`page-hero${media ? " page-hero-media" : ""}`}>
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
