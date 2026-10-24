import imported from "./posts.generated.json";

// Permanent redirects from the WordPress site, so links and search rankings carry over.
// Post paths are generated from the import; other pages are mapped by hand.
// TODO(content): extend from a full crawl of roleedge.com before launch (docs/IMPLEMENTATION_PLAN.md, Phase 6).
const postRedirects = Object.entries(imported as Record<string, { legacyPath: string }>).map(([slug, p]) => ({
  from: p.legacyPath.replace(/\/$/, ""),
  to: `/blog/${slug}`,
}));

const pageRedirects = [
  { from: "/blogs", to: "/blog" },
  { from: "/about-us", to: "/about" },
  { from: "/edgeai", to: "/edgeai" },
  { from: "/privacy-policy-3", to: "/privacy" },
  { from: "/terms-conditions-2", to: "/terms" },
  { from: "/category/:slug", to: "/blog" },
].filter((r) => r.from !== r.to);

export const legacyRedirects = [...postRedirects, ...pageRedirects];
