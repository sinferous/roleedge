import type { MetadataRoute } from "next";
import { getCategories, getPosts, getServices } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, posts, categories] = await Promise.all([getServices(), getPosts(), getCategories()]);
  const pages = [
    "/", "/study-abroad", "/career", "/institutions", "/about", "/stories", "/edgeai",
    "/services", "/start", "/book", "/contact", "/faq", "/blog", "/resources", "/privacy", "/terms",
  ];
  return [
    ...pages.map((p) => ({ url: absoluteUrl(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: absoluteUrl(`/services/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...categories.map((c) => ({ url: absoluteUrl(`/blog/category/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.4 })),
    ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.publishedAt, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
