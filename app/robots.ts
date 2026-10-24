import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/lib/site";

// Only production is indexable; previews and local builds ask crawlers to stay out.
export default function robots(): MetadataRoute.Robots {
  if (!site.indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
