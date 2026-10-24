import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getPosts } from "@/lib/content";
import { PageHero } from "@/components/site/PageHero";
import { ArticleCard, ClosingSection } from "@/components/site/blocks";

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  return category ? { title: `${category.title} articles`, description: category.description, alternates: { canonical: `/blog/category/${category.slug}` } } : {};
}

export default async function CategoryPage({ params }: PageProps<"/blog/category/[slug]">) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const posts = await getPosts(category.slug);
  return (
    <>
      <PageHero current={category.title} crumb={{ href: "/blog", label: "Blog" }} title={`${category.title}.`} lead={category.description} />
      <section className="articles-section" aria-label="Articles">
        <div className="container">
          <nav className="category-filter" aria-label="Categories">
            <Link href="/blog">All articles</Link>
            {categories.map((c) => (
              <Link key={c.slug} href={`/blog/category/${c.slug}`} aria-current={c.slug === slug ? "page" : undefined}>
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
