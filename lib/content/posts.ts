import type { Block, Category, Post } from "./types";
import imported from "./posts.generated.json";

type ImportedPost = { title: string; published: string | null; blocks: Block[]; legacyPath: string; sourceUrl: string };
const wp = imported as Record<string, ImportedPost>;

export const categories: Category[] = [
  { slug: "careers", title: "Career moves", description: "Changing direction without starting over." },
  { slug: "consulting", title: "Consulting prep", description: "Cases, interviews and how consultants think." },
  { slug: "growth", title: "Career growth", description: "Doing the work that gets you to the next level." },
];

// Editorial fields for each imported post. Bodies come from roleedge.com via scripts/import-wordpress.mjs.
const meta: Record<string, Pick<Post, "excerpt" | "cover" | "coverAlt" | "category">> = {
  "career-pivot-playbook-switch-roles-without-starting-over": {
    excerpt: "Make your existing experience relevant to the work you want to do next.",
    cover: "/assets/blog-career-pivot.jpg",
    coverAlt: "",
    category: "careers",
  },
  "profitability-case-interview-complete-guide-with-examples": {
    excerpt: "Work through the structure behind one of the most common consulting cases.",
    cover: "/assets/blog-profitability-case.jpg",
    coverAlt: "",
    category: "consulting",
  },
  "the-90-day-promotion-plan-how-to-fast-track-your-career": {
    excerpt: "Focus the next three months on the work and visibility that support a bigger role.",
    cover: "/assets/blog-promotion-plan.jpg",
    coverAlt: "",
    category: "growth",
  },
};

export const posts: Post[] = Object.entries(wp)
  .filter(([slug]) => slug in meta)
  .map(([slug, p]) => ({
    slug,
    title: p.title,
    publishedAt: p.published ?? "2025-01-01T00:00:00Z",
    author: "RoleEdge",
    body: p.blocks,
    legacyPath: p.legacyPath,
    sourceUrl: p.sourceUrl,
    ...meta[slug],
  }))
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
