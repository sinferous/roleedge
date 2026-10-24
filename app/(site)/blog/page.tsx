import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getPosts } from "@/lib/content";
import { PageHero } from "@/components/site/PageHero";
import { ArticleCard, ClosingSection } from "@/components/site/blocks";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles on consulting case interviews, career pivots and growing into a bigger role, from RoleEdge.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  return (
    <>
      <PageHero
        current="Blog"
        title={
          <>
            From the <span className="accent">blog.</span>
          </>
        }
        backdrop="/assets/blog-hero.jpg"
        lead="Notes on case interviews, career moves and doing the work that gets you to the next level."
      />
      <section className="articles-section" aria-label="Articles">
        <div className="container">
          <nav className="category-filter" aria-label="Categories">
            <Link href="/blog" aria-current="page">
              All articles
            </Link>
            {categories.map((c) => (
              <Link key={c.slug} href={`/blog/category/${c.slug}`}>
                {c.title}
              </Link>
            ))}
          </nav>
          <div className="articles-grid">
            {posts.map((p) => (
              <ArticleCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>
      <ClosingSection />
    </>
  );
}
