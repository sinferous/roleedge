// Renders every entry in lib/content/resources.ts to a printable PDF in public/downloads, plus a
// cover image of page one for the /resources cards, and writes sizes and page counts to
// lib/content/downloads.generated.json. Run with `npm run build:downloads` after editing resources.
// Uses the Chromium that Playwright already installed, so it needs no extra packages.

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { resources, resourceTracks } from "../lib/content/resources.ts";

const root = resolve(import.meta.dirname, "..");
const outDir = join(root, "public", "downloads");
const asset = (p) => pathToFileURL(join(root, "public", "assets", p)).href;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const css = `
@font-face { font-family: "DM Sans"; src: url("${asset("fonts/dm-sans-regular.ttf")}"); font-weight: 400 500; }
@font-face { font-family: "DM Sans"; src: url("${asset("fonts/dm-sans-semibold.ttf")}"); font-weight: 600 800; }
@page { size: A4; margin: 16mm 16mm 18mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 400 10.5pt/1.55 "DM Sans", sans-serif; color: #172f3a; }
body.screen { width: 794px; height: 1123px; padding: 60px 60px 68px; overflow: hidden; background: #fff; }
.top { display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid #e3e0d8; }
.top .brand { display: flex; align-items: center; gap: 8px; }
.top img { height: 22px; width: auto; }
.top b { font-size: 14pt; font-weight: 600; letter-spacing: -.6px; color: #172f3a; }
.top b .edge { font-weight: 400; color: inherit; } .top b .dot { color: #ae8040; }
.top b span { font-size: inherit; letter-spacing: inherit; text-transform: none; }
.top span { font-size: 8pt; font-weight: 600; letter-spacing: .8px; text-transform: uppercase; color: #7f5a22; }
.top .draft { margin-left: 8px; padding: 1px 6px; border: 1px dashed currentColor; border-radius: 3px; }
h1 { margin: 22px 0 6px; font-size: 25pt; font-weight: 600; line-height: 1.1; letter-spacing: -.6px; }
.summary { margin: 0 0 22px; max-width: 135mm; color: #4c5654; font-size: 11pt; }
section { margin-top: 18px; break-inside: avoid; }
h2 { margin: 0 0 8px; font-size: 12.5pt; font-weight: 600; letter-spacing: -.2px; }
ol.steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 9px; }
ol.steps li { display: grid; grid-template-columns: 22px 1fr; gap: 10px; }
ol.steps b { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: #172f3a; color: #fff; font-size: 8pt; }
ol.steps strong { display: block; font-weight: 600; }
ol.steps p { margin: 0; color: #4c5654; }
ul.check { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
ul.check li { display: grid; grid-template-columns: 16px 1fr; gap: 9px; align-items: start; }
ul.check li::before { content: ""; width: 11px; height: 11px; margin-top: 3px; border: 1.3px solid #172f3a; border-radius: 2px; }
.prompt { margin-bottom: 10px; }
.prompt p { margin: 0 0 2px; font-weight: 500; }
.prompt i { display: block; height: 22px; border-bottom: 1px solid #cfd6d7; }
table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
th { padding: 7px 8px; background: #172f3a; color: #fff; font-weight: 600; text-align: left; }
td { padding: 7px 8px; border-bottom: 1px solid #dfe4e4; vertical-align: top; color: #4c5654; }
td:first-child { color: #172f3a; font-weight: 500; }
tr.blank td { height: 26px; }
.note { padding: 12px 14px; border-left: 3px solid #ae8040; border-radius: 0 6px 6px 0; background: #f6efe1; }
.note h2 { font-size: 11pt; margin-bottom: 3px; }
.note p { margin: 0; }
.cta { margin-top: 24px; padding: 14px 16px; border-radius: 8px; background: #172f3a; color: #fff; break-inside: avoid; }
.cta strong { display: block; font-size: 11.5pt; font-weight: 600; }
.cta span { color: #c9d3d4; }
.cta em { font-style: normal; color: #e6be74; font-weight: 600; }
`;

function block(b) {
  const h = `<h2>${esc(b.heading)}</h2>`;
  switch (b.kind) {
    case "steps":
      return `<section>${h}<ol class="steps">${b.items
        .map((s, i) => `<li><b>${i + 1}</b><div><strong>${esc(s.title)}</strong><p>${esc(s.body)}</p></div></li>`)
        .join("")}</ol></section>`;
    case "checklist":
      return `<section>${h}<ul class="check">${b.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></section>`;
    case "prompts":
      return `<section>${h}${b.items
        .map((q) => `<div class="prompt"><p>${esc(q)}</p>${"<i></i>".repeat(b.lines ?? 3)}</div>`)
        .join("")}</section>`;
    case "table": {
      const rows = (b.rows ?? []).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`);
      const blank = Array.from({ length: b.blankRows ?? 0 }, () => `<tr class="blank">${b.columns.map(() => "<td></td>").join("")}</tr>`);
      return `<section>${h}<table><thead><tr>${b.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${[...rows, ...blank].join("")}</tbody></table></section>`;
    }
    case "note":
      return `<section class="note"><h2>${esc(b.heading)}</h2><p>${esc(b.body)}</p></section>`;
  }
}

function html(r, screen) {
  const track = resourceTracks.find((t) => t.slug === r.track);
  const label = track.title.replace(/^For /, "").replace(/^your /, "");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(r.title)} | RoleEdge</title><style>${css}</style></head>
<body class="${screen ? "screen" : ""}">
<div class="top"><div class="brand"><img src="${asset("roleedge-mark.png")}" alt=""><b>Role<span class="edge">Edge</span><span class="dot">.</span></b></div><span>${esc(label[0].toUpperCase() + label.slice(1))} · Free resource${r.confirmed ? "" : '<span class="draft">Draft</span>'}</span></div>
<h1>${esc(r.title)}</h1>
<p class="summary">${esc(r.summary)}</p>
${r.blocks.map(block).join("\n")}
<div class="cta"><strong>Want someone to check your work?</strong><span>Book a free consultation with RoleEdge at <em>roleedge.com/book</em></span></div>
</body></html>`;
}

const footer = `<div style="width:100%;padding:0 16mm;font:7.5pt sans-serif;color:#8a9493;display:flex;justify-content:space-between">
<span>RoleEdge · roleedge.com · Free to use and share</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;

mkdirSync(outDir, { recursive: true });
const work = mkdtempSync(join(tmpdir(), "roleedge-downloads-"));
const browser = await chromium.launch({ channel: "chrome" });
const manifest = {};
try {
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  for (const r of resources) {
    for (const screen of [false, true]) {
      const file = join(work, `${r.slug}${screen ? "-cover" : ""}.html`);
      writeFileSync(file, html(r, screen));
      await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      if (screen) {
        await page.screenshot({ path: join(outDir, `${r.slug}.jpg`), type: "jpeg", quality: 82 });
      } else {
        const pdf = join(outDir, `${r.slug}.pdf`);
        await page.pdf({ path: pdf, format: "A4", printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: footer });
        const bytes = readFileSync(pdf);
        const pages = (bytes.toString("latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
        manifest[r.slug] = { bytes: bytes.length, pages };
      }
    }
    console.log(`${r.slug}: ${manifest[r.slug].pages} page(s), ${Math.round(manifest[r.slug].bytes / 1024)} KB`);
  }
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}
writeFileSync(join(root, "lib", "content", "downloads.generated.json"), JSON.stringify(manifest, null, 2) + "\n");
