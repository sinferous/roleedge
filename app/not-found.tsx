import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="not-found">
        <div className="container">
          <h1>This page has moved on.</h1>
          <p>The link may be old, or the page may have been renamed when the site was rebuilt.</p>
          <div className="page-hero-actions">
            <Link className="button button-dark" href="/">
              Go to the home page
            </Link>
            <Link className="text-link" href="/blog">
              Browse the blog
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
