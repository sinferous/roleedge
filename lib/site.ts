// Site-wide settings. Becomes the Sanity `settings` singleton once Sanity is connected.

const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const site = {
  name: "RoleEdge",
  url,
  description:
    "Personal guidance for MBA applications, consulting interviews and career changes, from former Bain & Company Manager Mayank Kapoor.",
  // Only the production deployment may be indexed by search engines.
  indexable: process.env.VERCEL_ENV === "production",
  email: "info@roleedge.com",
  linkedin: "https://www.linkedin.com/in/camayankkapoor/",
  youtube: "https://www.youtube.com/@roleedge-mayankkapoor",
  edgeaiUrl: "https://roleedge.com/edgeai/",
  nav: [
    { href: "/", label: "Home" },
    { href: "/study-abroad", label: "Study abroad" },
    { href: "/career", label: "Career" },
    { href: "/institutions", label: "For institutions" },
    { href: "/blog", label: "Blogs" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About us" },
  ],
  footer: {
    explore: [
      { href: "/study-abroad", label: "Study abroad" },
      { href: "/career", label: "Career" },
      { href: "/institutions", label: "For institutions" },
      { href: "/stories", label: "Client stories" },
      { href: "/edgeai", label: "EdgeAI" },
      { href: "/blog", label: "Blogs" },
      { href: "/resources", label: "Free resources" },
      { href: "/about", label: "About us" },
    ],
    start: [
      { href: "/start", label: "Find your starting point" },
      { href: "/book", label: "Book a free call" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "Common questions" },
    ],
    legal: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
  // Shown under every form; bump the version whenever the privacy notice changes.
  consentTextVersion: "2026-10",
} as const;

export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString();
}
