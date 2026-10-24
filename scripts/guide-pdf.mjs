// Page template for the long guides and workbooks in content/guides/*.json.
// Used by build-downloads.mjs. Print-first: a navy brand band on every page (Chrome header template),
// ruled writing space under every exercise, and the same "check your work" call to action as the worksheets.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const navy = "#172f3a";
const gold = "#ae8040";

export function guideTemplate(root) {
  const asset = (p) => pathToFileURL(join(root, "public", "assets", p)).href;
  const dataUri = (p, type) => `data:${type};base64,${readFileSync(join(root, "public", "assets", p)).toString("base64")}`;
  const mark = dataUri("roleedge-mark.png", "image/png");
  // Header and footer templates can't load files, so they get the font inline.
  const fontFace = `@font-face{font-family:"DM Sans";src:url(${dataUri("fonts/dm-sans-semibold.ttf", "font/ttf")});font-weight:600}`;

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // **bold** in the source text; "Label: rest" lines get a bold label.
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const labelled = (s) => {
    const m = /^([A-Z][\w’' /-]{1,26}):\s+(.*)$/.exec(s);
    return m && !s.startsWith("**") ? `<strong>${esc(m[1])}:</strong> ${md(m[2])}` : md(s);
  };

  const brand = (size) =>
    `<span style="display:flex;align-items:center;gap:${size * 0.45}px"><img src="${mark}" alt="" style="height:${size}px;width:auto"><span style="font:600 ${size * 0.78}px/1 'DM Sans',sans-serif;letter-spacing:-.4px;color:#fff">Role<span style="font-weight:400">Edge</span><span style="color:${gold}">.</span></span></span>`;
  const band = (title, label) =>
    `<div style="box-sizing:border-box;width:100%;height:13mm;padding:0 14mm;display:flex;align-items:center;justify-content:space-between;background:${navy};border-bottom:1mm solid ${gold};-webkit-print-color-adjust:exact;print-color-adjust:exact">${brand(18)}<span style="display:flex;align-items:center;gap:10px;font:600 7.5pt/1 'DM Sans',sans-serif;color:#d9e0e1"><span style="padding:3px 7px;border:1px solid ${gold};border-radius:3px;color:#e6be74;letter-spacing:.9px;text-transform:uppercase;font-size:6.5pt">${esc(label)}</span>${esc(title)}</span></div>`;

  const css = `
@font-face { font-family: "DM Sans"; src: url("${asset("fonts/dm-sans-regular.ttf")}"); font-weight: 400 500; }
@font-face { font-family: "DM Sans"; src: url("${asset("fonts/dm-sans-semibold.ttf")}"); font-weight: 600 800; }
@page { size: A4; margin: 22mm 16mm 17mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 400 10.5pt/1.55 "DM Sans", sans-serif; color: ${navy}; }
body.screen { width: 794px; height: 1123px; overflow: hidden; background: #fff; }
body.screen .cover { padding: 30px 60px 0; }
strong { font-weight: 600; }
p { margin: 0 0 7px; }
.eyebrow { margin: 0 0 4px; font-size: 7.5pt; font-weight: 600; letter-spacing: 1.4px; text-transform: uppercase; color: #8a6430; }

.cover { break-after: page; }
.cover h1 { margin: 6mm 0 3mm; font-size: 29pt; font-weight: 600; line-height: 1.08; letter-spacing: -.8px; }
.cover .subtitle { margin: 0; max-width: 150mm; font-size: 13pt; color: #4c5654; }
.cover .rule { width: 18mm; height: 1.2mm; margin: 6mm 0; background: ${gold}; border-radius: 1mm; }
.chips { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-bottom: 6mm; }
.chips div { padding: 3.5mm 3mm; border: 0.6pt solid #dfe3e1; border-radius: 2mm; background: #f7f8f6; text-align: center; }
.chips b { display: block; font-size: 15pt; font-weight: 600; color: #8a6430; line-height: 1.2; }
.chips span { font-size: 7.5pt; font-weight: 600; letter-spacing: .8px; text-transform: uppercase; }
.howto { margin-bottom: 6mm; padding: 4mm 5mm; border-left: 1mm solid ${navy}; border-radius: 0 2mm 2mm 0; background: #f6efe1; }
.howto p { margin: 0; }
.contents h2 { margin: 0 0 2.5mm; font-size: 11pt; }
.contents ol { margin: 0; padding: 0; list-style: none; columns: 2; column-gap: 8mm; font-size: 9.5pt; }
.contents li { display: flex; gap: 2.5mm; padding: 1.6mm 0; border-bottom: 0.5pt solid #e6e8e4; break-inside: avoid; }
.contents li span { flex: none; width: 6mm; color: #8a6430; font-weight: 600; }
.byline { margin-top: 8mm; padding-top: 4mm; border-top: 0.6pt solid #dfe3e1; font-size: 8.5pt; color: #5d6765; }
.byline strong { color: ${navy}; }

section.part { margin: 0 0 8mm; }
section.part.new-page { break-before: page; }
section.part > h2 { margin: 0 0 3mm; padding-bottom: 2.5mm; border-bottom: 0.6pt solid #dfe3e1; font-size: 15pt; font-weight: 600; line-height: 1.2; letter-spacing: -.3px; break-after: avoid; }
section.part > .eyebrow { break-after: avoid; }
.illustrative { margin: -1mm 0 3mm; font-size: 8.5pt; font-style: italic; color: #6c7573; }
section.example-part { padding: 4mm 5mm 1mm; border-radius: 2mm; background: #f7f4ee; break-inside: avoid; }
section.example-part > h2 { border-color: #e4dccd; }
h3 { margin: 4mm 0 2mm; font-size: 11pt; font-weight: 600; break-after: avoid; }
/* A heading and the block after it stay on the same page. */
.keep { break-inside: avoid; }

ul.bullets { margin: 0 0 7px; padding-left: 5mm; }
ul.bullets li { margin-bottom: 1.3mm; padding-left: 1mm; }
ul.bullets li::marker { color: ${gold}; }
ul.ticks, ul.crosses { list-style: none; margin: 0 0 7px; padding: 0; }
ul.ticks li, ul.crosses li { display: grid; grid-template-columns: 6mm 1fr; margin-bottom: 1.6mm; }
ul.ticks li::before { content: ""; width: 3.4mm; height: 3.4mm; margin-top: 1mm; border: 0.9pt solid ${navy}; border-radius: .6mm; }
ul.crosses li::before { content: "✕"; color: #9b3d2e; font-weight: 600; }
.example, .callout { margin: 2mm 0 3.5mm; padding: 3mm 4mm; border-radius: 0 2mm 2mm 0; break-inside: avoid; }
.example { border-left: 0.9mm solid #c9ced0; background: #f4f6f6; }
.callout { border-left: 0.9mm solid ${gold}; background: #f6efe1; }
.example > b, .callout > b { display: block; margin-bottom: 1mm; font-size: 7pt; letter-spacing: 1.2px; text-transform: uppercase; color: #6c7573; }
.callout > b { color: #8a6430; }
.example p:last-child, .callout p:last-child, .example ul:last-child, .callout ul:last-child { margin-bottom: 0; }
.script { margin: 2mm 0 3.5mm; padding: 3mm 4mm; border: 0.6pt solid #dfe3e1; border-radius: 2mm; break-inside: avoid; }
.script > b { display: block; margin-bottom: 1.5mm; font-size: 7pt; letter-spacing: 1.2px; text-transform: uppercase; color: #8a6430; }
.script p { display: grid; grid-template-columns: 22mm 1fr; margin-bottom: 1.5mm; }
.compare { display: grid; grid-template-columns: auto 1fr; gap: 1.5mm 3mm; margin: 2mm 0 3.5mm; align-items: baseline; }
.compare span { padding: .6mm 2mm; border-radius: 1mm; font-size: 7pt; font-weight: 600; letter-spacing: .8px; text-transform: uppercase; text-align: center; }
.compare .neg { background: #f3e3df; color: #8a3324; } .compare .pos { background: #e2eee6; color: #2c6145; }

.exercise { margin: 3mm 0 4.5mm; padding: 3.5mm 4.5mm 4.5mm; border: 0.7pt solid #d8d2c4; border-radius: 2mm; break-inside: avoid; }
.exercise > b { display: inline-block; margin-bottom: 1.6mm; font-size: 7pt; letter-spacing: 1.2px; text-transform: uppercase; color: #8a6430; }
.exercise > p { margin: 0 0 1mm; font-weight: 500; }
.write i { display: block; height: 9mm; border-bottom: 0.6pt solid #b7c1c2; }
ol.write { margin: 0; padding: 0; list-style: none; counter-reset: n; }
ol.write li { display: grid; grid-template-columns: 6mm 1fr; align-items: end; counter-increment: n; }
ol.write li::before { content: counter(n) "."; padding-bottom: 1mm; color: #8a6430; font-weight: 600; font-size: 9pt; }
table { width: 100%; margin-top: 2mm; border-collapse: collapse; font-size: 9pt; table-layout: fixed; }
th { padding: 1.8mm 2.5mm; background: ${navy}; color: #fff; font-weight: 600; text-align: left; }
td { height: 11mm; padding: 1.5mm 2.5mm; border: 0.6pt solid #cfd6d7; vertical-align: top; }
td.label { width: 34%; background: #f7f8f6; font-weight: 500; }
table.plan { break-inside: avoid; }
table.plan td { height: 17mm; }
tr { break-inside: avoid; }
table.plan td:first-child { width: 22mm; font-weight: 600; color: #8a6430; }
table.plan td:nth-child(2) { width: 38%; }
table.answers td { height: auto; padding: 1.2mm 2.5mm; }
table.answers td:first-child { width: 30%; color: #5d6765; }
.field { margin-bottom: 3mm; break-inside: avoid; }
.template { break-inside: avoid; }
.field .write i { height: 8mm; }
.field > b { display: block; font-size: 8pt; letter-spacing: .6px; text-transform: uppercase; color: #5d6765; }
ol.questions { margin: 0; padding: 0; list-style: none; counter-reset: q; }
ol.questions li { counter-increment: q; break-inside: avoid; }
ol.questions li::before { content: counter(q) "."; font-weight: 600; color: #8a6430; margin-right: 2mm; }
ol.questions.work li { margin-bottom: 3mm; }
ol.questions.work li div { height: 24mm; margin-top: 1.5mm; border: 0.6pt solid #d6dcdd; border-radius: 1.5mm; background: #fcfcfb; }
ol.questions.tick li { display: grid; grid-template-columns: 7mm 6mm 1fr; padding: 1.6mm 0; border-bottom: 0.5pt solid #e6e8e4; }
ol.questions.tick li::after { content: ""; grid-column: 2; grid-row: 1; width: 3.4mm; height: 3.4mm; margin-top: .9mm; border: 0.9pt solid ${navy}; border-radius: .6mm; }
ol.questions.tick li::before { grid-column: 1; }
ol.questions.tick li span { grid-column: 3; }

/* The last page: room for notes, then the call to action. */
.notes { break-before: page; break-inside: avoid; }
.notes > h2 { margin: 0 0 1mm; padding-bottom: 2.5mm; border-bottom: 0.6pt solid #dfe3e1; font-size: 15pt; font-weight: 600; }
.cta { margin-top: 10mm; padding: 7mm 8mm; border-radius: 2.5mm; background: ${navy}; color: #fff; break-inside: avoid; border-bottom: 1.2mm solid ${gold}; }
.cta .eyebrow { color: #e6be74; }
.cta h2 { margin: 0 0 2mm; font-size: 16pt; font-weight: 600; }
.cta p { margin: 0 0 4mm; color: #c9d3d4; max-width: 140mm; }
.cta span { display: inline-block; padding: 2.4mm 5mm; border-radius: 1.5mm; background: ${gold}; color: #fff; font-weight: 600; }
`;

  function exercise(b) {
    const head = `<b>${esc(b.label)}</b><p>${md(b.text)}</p>`;
    let space;
    if (b.table) space = tableHtml(b.table);
    else if (b.numbered) space = `<ol class="write">${Array.from({ length: b.numbered }, () => "<li><i></i></li>").join("")}</ol>`;
    else space = `<div class="write">${"<i></i>".repeat(b.lines ?? 4)}</div>`;
    return `<div class="exercise">${head}${space}</div>`;
  }

  function tableHtml(t, cls = "") {
    const head = t.columns.some(Boolean) ? `<thead><tr>${t.columns.map((c, i) => `<th${t.widths ? ` style="width:${t.widths[i]}%"` : ""}>${esc(c)}</th>`).join("")}</tr></thead>` : "";
    const rows = typeof t.rows === "number" ? Array.from({ length: t.rows }, () => t.columns.map(() => "")) : t.rows;
    const labelled = typeof t.rows !== "number";
    return `<table class="${cls}">${head}<tbody>${rows
      .map((r) => `<tr>${r.map((c, i) => `<td${labelled && i === 0 ? ' class="label"' : ""}>${md(c)}</td>`).join("")}</tr>`)
      .join("")}</tbody></table>`;
  }

  const negative = /^(Bad|Weak|Instead of|Bad headline|Don’t)/;
  function block(b) {
    switch (b.t) {
      case "p":
        return `<p>${labelled(b.text)}</p>`;
      case "lines":
        return b.items.map((l) => `<p>${labelled(l)}</p>`).join("");
      case "h3":
        return `<h3>${md(b.text)}</h3>`;
      case "ul":
        return `<ul class="bullets">${b.items.map((i) => `<li>${md(i)}</li>`).join("")}</ul>`;
      case "check":
        return `<ul class="ticks">${b.items.map((i) => `<li><span>${md(i)}</span></li>`).join("")}</ul>`;
      case "avoid":
        return `<ul class="crosses">${b.items.map((i) => `<li><span>${md(i)}</span></li>`).join("")}</ul>`;
      case "example":
        return `<div class="example"><b>Example</b>${b.items.map((i) => `<p>${labelled(i)}</p>`).join("")}${b.list ? `<ul class="bullets">${b.list.map((i) => `<li>${md(i)}</li>`).join("")}</ul>` : ""}</div>`;
      case "callout":
        return `<div class="callout"><b>${esc(b.label)}</b>${b.text ? `<p>${md(b.text)}</p>` : ""}${b.items ? `<ul class="bullets">${b.items.map((i) => `<li>${md(i)}</li>`).join("")}</ul>` : ""}</div>`;
      case "script": {
        const [title, ...lines] = b.items;
        return `<div class="script"><b>${esc(title.replace(/\*\*/g, "").replace(/:$/, ""))}</b>${lines
          .map((l) => {
            const m = /^(\w+):\s*(.*)$/.exec(l);
            return m ? `<p><strong>${esc(m[1])}</strong><span>${md(m[2])}</span></p>` : `<p>${md(l)}</p>`;
          })
          .join("")}</div>`;
      }
      case "compare":
        return `<div class="compare">${b.rows.map(([k, v]) => `<span class="${negative.test(k) ? "neg" : "pos"}">${esc(k)}</span><div>${md(v)}</div>`).join("")}</div>`;
      case "exercise":
        return exercise(b);
      case "plan":
        return `${b.titled ? "" : `<h3>${b.rows.some((r) => /^Days/.test(r[0])) ? "Your 90-day plan" : "Your plan"}</h3>`}${tableHtml({ columns: ["When", "Focus", "My actions"], rows: b.rows.map((r) => [...r, ""]) }, "plan")}`;
      case "template":
        return `<div class="template">${b.fields.map(([label, n]) => `<div class="field"><b>${esc(label)}</b><div class="write">${"<i></i>".repeat(n)}</div></div>`).join("")}</div>`;
      case "questions":
        return `<ol class="questions ${b.space}">${b.items.map((q) => (b.space === "work" ? `<li>${md(q)}<div></div></li>` : `<li><span>${md(q)}</span></li>`)).join("")}</ol>`;
      case "answers":
        return tableHtml({ columns: ["Question", "Answer"], rows: b.rows }, "answers");
      default:
        throw new Error(`Unknown guide block "${b.t}"`);
    }
  }

  // A heading, or a paragraph that ends in a colon, stays on the same page as the block after it.
  const leadsIn = (b) => b.t === "h3" || (b.t === "p" && /:(\*\*)?$/.test(b.text.trim()));
  function groups(blocks) {
    const out = [];
    for (let i = 0; i < blocks.length; i++) {
      const run = [blocks[i]];
      while (leadsIn(run.at(-1)) && i + 1 < blocks.length) run.push(blocks[++i]);
      const html = run.map((b, k) => block(b.t === "plan" && run[k - 1]?.t === "h3" ? { ...b, titled: true } : b)).join("");
      out.push(run.length > 1 || blocks[i].t === "plan" ? `<div class="keep">${html}</div>` : html);
    }
    return out;
  }
  // Long lists split across pages anyway, so only short first blocks join the section heading.
  const splits = /^<(ol class="questions|table class="answers)/;

  function section(s, i) {
    const newPage = /^(Practice set|Guesstimate worksheet|Answers)/.test(s.title);
    const cls = ["part", s.example && "example-part", newPage && "new-page"].filter(Boolean).join(" ");
    const eyebrow = s.example ? "Example" : s.eyebrow;
    const head = `${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ""}<h2>${md(s.title)}</h2>${
      s.example ? '<p class="illustrative">An illustrative example. Names and details are representative, not real clients.</p>' : ""
    }`;
    const [first = "", ...rest] = groups(s.blocks);
    const lead = splits.test(first) ? `<div class="keep">${head}</div>${first}` : `<div class="keep">${head}${first}</div>`;
    return `<section class="${cls}" id="s${i}">${lead}${rest.join("\n")}</section>`;
  }

  function counts(g) {
    let exercises = 0;
    for (const s of g.sections) for (const b of s.blocks) if (b.t === "exercise" || b.t === "template") exercises++;
    return exercises;
  }

  function html(g, r, label, screen) {
    // g.summary is a count for the middle chip, such as "40 practice questions".
    const [count, ...what] = (g.summary ?? `${counts(g)} exercises`).split(" ");
    const chips = [
      [String(g.sections.length), "Sections"],
      [count, what.join(" ")],
      ["Print", "With space to write"],
    ];
    const contents = g.sections.map((s, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span>${md(s.eyebrow && !s.example ? `${s.eyebrow}: ${s.title}` : s.title)}</li>`).join("");
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(g.title)} | RoleEdge</title><style>${css}</style></head>
<body class="${screen ? "screen" : ""}">
${screen ? band(g.title, label) : ""}
<div class="cover">
<p class="eyebrow">RoleEdge · ${esc(label)}</p>
<h1>${esc(g.title)}</h1>
<p class="subtitle">${esc(g.subtitle)}</p>
<div class="rule"></div>
<div class="chips">${chips.map(([n, t]) => `<div><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join("")}</div>
<div class="howto"><p><strong>How to use this ${/workbook/i.test(g.title) ? "workbook" : "guide"}:</strong> print it, work through it in order, and write in the spaces. Every exercise has room for your answers, and you can print extra copies of any page.</p></div>
<div class="contents"><h2>Inside</h2><ol>${contents}</ol></div>
<p class="byline">From <strong>RoleEdge</strong>, founded by Mayank Kapoor, former Manager at Bain &amp; Company and Warwick MBA. Free to use and share.</p>
</div>
${screen ? "" : g.sections.map(section).join("\n")}
${
  screen
    ? ""
    : `<div class="notes"><h2>My notes</h2><div class="write">${"<i></i>".repeat(17)}</div><div class="cta"><p class="eyebrow">Next step</p><h2>Want someone to check your work?</h2><p>Bring this ${/workbook/i.test(g.title) ? "workbook" : "guide"} to a free call with RoleEdge. We’ll go through your answers and help you plan what comes next.</p><span>Book a free call at roleedge.com/book</span></div></div>`
}
</body></html>`;
  }

  const header = (g, label) => `<style>${fontFace}html,body{margin:0;padding:0}</style><div style="position:absolute;top:0;left:0;right:0">${band(g.title, label)}</div>`;
  const footer = (g) =>
    `<style>${fontFace}</style><div style="box-sizing:border-box;width:100%;padding:0 16mm;display:flex;justify-content:space-between;font:600 7pt 'DM Sans',sans-serif;color:#8a9493"><span>RoleEdge · roleedge.com · Free to use and share</span><span style="letter-spacing:.8px;text-transform:uppercase">${esc(g.title)}</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`;

  return { html, header, footer };
}
