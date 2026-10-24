import Link from "next/link";
import type { Resource } from "@/lib/content/resources";
import downloads from "@/lib/content/downloads.generated.json";
import { DownloadButton } from "./DownloadButton";
import { LearnChevron } from "./Icons";

// One free download as a folder card: page one peeking out, what's inside, and the Download button,
// which asks for a name and email the first time (DownloadButton).
// Used on /resources and on the study abroad and career pages.
const meta = downloads as Record<string, { bytes: number; pages: number }>;

function fileInfo(slug: string) {
  const m = meta[slug];
  if (!m) return "PDF";
  return `PDF · ${m.pages} ${m.pages === 1 ? "page" : "pages"} · ${Math.max(1, Math.round(m.bytes / 1024))} KB`;
}

export function ResourceFolder({ resource: r, currentPath }: { resource: Resource; currentPath?: string }) {
  const info = fileInfo(r.slug);
  return (
    <article className="resource-folder reveal">
      <span className="resource-folder-tab">
        {info}
        {!r.confirmed && <span className="pending-tag">Draft</span>}
      </span>
      <div className="resource-folder-body">
        <div className="resource-paper" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- generated cover of page one */}
          <img src={`/downloads/${r.slug}.jpg`} alt="" width={794} height={1123} loading="lazy" decoding="async" />
        </div>
        <h3>{r.title}</h3>
        <p>{r.summary}</p>
        <ul className="resource-inside" aria-label={`Inside ${r.title}`}>
          {r.inside.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="resource-actions">
          <DownloadButton slug={r.slug} title={r.title} info={info} />
          {r.related && r.related.href !== currentPath && (
            <Link className="t-learn" href={r.related.href}>
              {r.related.label}
              <LearnChevron />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

