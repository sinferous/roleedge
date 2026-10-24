// Imports published posts from the current WordPress site into lib/content/posts.generated.json.
// Usage: node scripts/import-wordpress.mjs <post-url> [<post-url> ...]
// Text, headings and lists are kept; images, scripts and inline styling are dropped.
// Once Sanity is connected, the same block output maps onto Portable Text.
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const out = path.resolve(import.meta.dirname, "../lib/content/posts.generated.json");

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…" };
const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => entities[n.toLowerCase()] ?? m);
const text = (html) => decode(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

function extract(html) {
  const title = text(html.match(/<h1 class="title">([\s\S]*?)<\/h1>/)?.[1] ?? "");
  const published = html.match(/"datePublished":"([^"]+)"/)?.[1] ?? null;
  const start = html.indexOf('<div class="border dark"></div></div>');
  if (start < 0 || !title) throw new Error("Post markup not recognised");
  let body = html.slice(start);
  const end = body.search(/<h2[^>]*>\s*Post navigation|<nav[^>]+post-navigation|<div[^>]+(id="comments"|class="[^"]*comment)|<form[^>]+comment/);
  body = body.slice(0, end > 0 ? end : undefined);

  const blocks = [];
  const re = /<(p|h2|h3|h4|ul|ol|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const [, tag, inner] of body.matchAll(re)) {
    const t = tag.toLowerCase();
    if (t === "ul" || t === "ol") {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => text(m[1])).filter(Boolean);
      if (items.length) blocks.push({ type: t, items });
    } else {
      const value = text(inner);
      if (!value) continue;
      blocks.push({ type: t === "h4" ? "h3" : t === "blockquote" ? "quote" : t, text: value });
    }
  }
  return { title, published, blocks };
}

const urls = process.argv.slice(2);
if (!urls.length) {
  console.error("Usage: node scripts/import-wordpress.mjs <post-url> [...]");
  process.exit(1);
}

let existing = {};
try {
  existing = JSON.parse(await readFile(out, "utf8"));
} catch {}

for (const url of urls) {
  const res = await fetch(url, { headers: { "user-agent": "RoleEdge content import" } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const post = extract(await res.text());
  const legacyPath = new URL(url).pathname;
  const slug = legacyPath.replace(/^\/|\/$/g, "");
  existing[slug] = { ...post, legacyPath, sourceUrl: url };
  console.log(`${slug}: ${post.blocks.length} blocks`);
}

await writeFile(out, JSON.stringify(existing, null, 2) + "\n");
console.log(`Wrote ${out}`);
