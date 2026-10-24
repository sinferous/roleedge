import Link from "next/link";
import { site } from "@/lib/site";
import { Brand } from "./Brand";

export async function SiteFooter() {
  // Cached so the copyright year doesn't make every page render per request.
  "use cache";
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Brand size={26} />
            <p>Career and admissions guidance.</p>
          </div>
          <div className="footer-links">
            <div>
              <strong>EXPLORE</strong>
              {site.footer.explore.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
            <div>
              <strong>TAKE A STEP</strong>
              {site.footer.start.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
            <div>
              <strong>KEEP IN TOUCH</strong>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn<span className="sr-only"> (new tab)</span>
              </a>
              <a href={site.youtube} target="_blank" rel="noopener noreferrer">
                YouTube<span className="sr-only"> (new tab)</span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} RoleEdge. All rights reserved.</span>
          <span>
            Personal guidance. Considered decisions.{" "}
            {site.footer.legal.map((l) => (
              <Link key={l.href} href={l.href} className="footer-legal">
                {l.label}
              </Link>
            ))}
          </span>
          <a href="#main-content">Back to top</a>
        </div>
      </div>
    </footer>
  );
}
