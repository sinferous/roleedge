import { cacheLife, cacheTag } from "next/cache";
import { faqs } from "./faqs";
import { categories, posts } from "./posts";
import { services } from "./services";
import { stories } from "./stories";
import type { Category, Faq, Post, Service, Story } from "./types";

// The content access layer. Pages only call these functions, so replacing the local files
// with Sanity queries (docs/INTEGRATIONS.md §1.2) changes this file and nothing else.
// Cache tags match the Sanity document types that /api/revalidate will invalidate.

/** Unapproved stories are visible locally and on previews only, never on the production site. */
export const showPendingContent = process.env.VERCEL_ENV !== "production" && process.env.SHOW_PENDING_CONTENT !== "false";

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheTag("service");
  cacheLife("days");
  return services;
}

export async function getService(slug: string): Promise<Service | undefined> {
  "use cache";
  cacheTag("service", `service:${slug}`);
  cacheLife("days");
  return services.find((s) => s.slug === slug);
}

export async function getStories(field?: Story["field"]): Promise<Story[]> {
  "use cache";
  cacheTag("story");
  cacheLife("days");
  return stories.filter((s) => (s.consentConfirmed || showPendingContent) && (!field || s.field === field));
}

export async function getFaqs(ids?: string[]): Promise<Faq[]> {
  "use cache";
  cacheTag("faq");
  cacheLife("days");
  return ids ? ids.map((id) => faqs.find((f) => f.id === id)).filter((f): f is Faq => Boolean(f)) : faqs;
}

export async function getPosts(category?: Category["slug"]): Promise<Post[]> {
  "use cache";
  cacheTag("post");
  cacheLife("hours");
  return category ? posts.filter((p) => p.category === category) : posts;
}

export async function getPost(slug: string): Promise<Post | undefined> {
  "use cache";
  cacheTag("post", `post:${slug}`);
  cacheLife("hours");
  return posts.find((p) => p.slug === slug);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag("category");
  cacheLife("days");
  return categories;
}

export function readingMinutes(post: Post) {
  const words = post.body
    .map((b) => ("text" in b ? b.text : b.items.join(" ")))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
