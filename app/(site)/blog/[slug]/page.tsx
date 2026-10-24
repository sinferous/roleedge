import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getPost, getPosts, readingMinutes } from "@/lib/content";
import type { Block } from "@/lib/content/types";
import { absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { ArticleCard } from "@/components/site/blocks";
import { JsonLd } from "@/components/content/JsonLd";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, images: [post.cover], publishedTime: post.publishedAt },
  };
}

function Body({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return <h2 key={i}>{b.text}</h2>;
          case "h3":
            return <h3 key={i}>{b.text}</h3>;
          case "quote":
            return <blockquote key={i}>{b.text}</blockquote>;
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {b.items.map((t, j) => (
                  <li key={j}>{t}</li>
                ))}
              </ol>
            );
          default:
            return <p key={i}>{b.text}</p>;
        }
      })}
    </div>
  );
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const [all, categories] = await Promise.all([getPosts(), getCategories()]);
  const category = categories.find((c) => c.slug === post.category);
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 3);
  const date = new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          image: absoluteUrl(post.cover),
          author: { "@type": "Organization", name: "RoleEdge" },
          publisher: { "@type": "Organization", name: "RoleEdge" },
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
        }}
      />
      <PageHero current={category?.title ?? "Article"} crumb={{ href: "/blog", label: "Blog" }} title={post.title}>
        <p className="page-hero-lead">{post.excerpt}</p>
        <p className="post-meta">
          <span>By {post.author}</span>
          <time dateTime={post.publishedAt}>{date}</time>
          <span>{readingMinutes(post)} min read</span>
        </p>
      </PageHero>
      <div className="container">
        <figure className="post-cover" style={{ margin: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- cover is pre-sized */}
          <img src={post.cover} alt={post.coverAlt} width={1672} height={941} />
        </figure>
        <div className="post-layout">
          <article>
            <Body blocks={post.body} />
          </article>
          <aside className="post-aside" aria-label="Talk it through">
            <div className="info-card">
              <span className="card-number">FREE CALL</span>
              <h3>Want to apply this to your situation?</h3>
              <p>Talk it through with RoleEdge in a free 30-minute call.</p>
              <Link className="button button-dark button-small" href="/book" style={{ marginTop: 18 }}>
                Book a free call
              </Link>
            </div>
          </aside>
        </div>
      </div>
      {related.length > 0 && (
        <section className="articles-section" aria-labelledby="related-title">
          <div className="container">
            <div className="articles-heading">
              <h2 id="related-title">Keep reading.</h2>
              <Link href="/blog">Browse all articles</Link>
            </div>
            <div className="articles-grid">
              {related.map((p) => (
                <ArticleCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
