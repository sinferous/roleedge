// CSV for spreadsheet apps. Cells that start with = + - @ (or tab/CR) are prefixed with a
// quote so a visitor's message can't run as a formula in Excel or Sheets.
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** UTF-8 BOM first so Excel reads non-ASCII names correctly. */
export function toCsv(header: string[], rows: string[][]) {
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
