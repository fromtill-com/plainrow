"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const product = fs.readFileSync(path.join(root, "plainrow/index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "plainrow/app.html"));
const downloadCopy = fs.readFileSync(path.join(root, "plainrow/plainrow-lite.html"));
const kitchenLite = fs.readFileSync(path.join(root, "kitchen/plainrow-lite.html"));
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.match(product, />Try Lite</);
assert.match(product, />Download Lite</);
assert.match(product, /href="plainrow-lite.html"/);
assert.match(product, /download="plainrow-lite.html"/);
assert.doesNotMatch(product, /polar|buy now|github\.io/i);
assert.doesNotMatch(sitemap, /plainrow-lite\.html/);

assert.ok(app.equals(downloadCopy), "plainrow/plainrow-lite.html must be the same bytes as plainrow/app.html");
assert.ok(app.equals(kitchenLite), "kitchen/plainrow-lite.html must be the same bytes as plainrow/app.html");

const html = app.toString("utf8");
assert.doesNotMatch(html, /cdn|unpkg|jsdelivr|googleapis|<script\s+src=/i);
assert.match(html, /id="btnStack"/);
assert.match(html, /id="btnDedupe"/);
assert.match(html, /id="btnExport"/);

const src = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));

function extractFunction(name) {
  const needle = "function " + name;
  const start = src.indexOf(needle);
  if (start < 0) throw new Error("missing function " + name);
  const brace = src.indexOf("{", start);
  let depth = 0;
  for (let i = brace; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error("unclosed function " + name);
}

vm.runInThisContext([
  "function uid() { return 't' + Math.random().toString(36).slice(2, 8); }",
  extractFunction("cloneTable"),
  extractFunction("normName"),
  extractFunction("resolveCol"),
  extractFunction("stackTables"),
  extractFunction("dedupeTable"),
  extractFunction("serializeCSV")
].join("\n"));

const week10 = {
  id: "a",
  name: "week-10.csv",
  headers: ["Work Date", "Staff", "Project", "Hours", "Notes"],
  rows: [
    ["03/02/2026", "Nia Colfax", "Archive", "6.5", ""],
    ["03/03/2026", "Ross Kepler", "Intake", "8", ""],
    ["03/04/2026", "Sol Rivera", "Archive", "4", "Half day"]
  ]
};
const week11 = {
  id: "b",
  name: "week-11.csv",
  headers: ["Work Date", "Staff", "Project", "Hours", "Notes"],
  rows: [
    ["03/09/2026", "Nia Colfax", "Archive", "7", ""],
    ["03/10/2026", "Ross Kepler", "Intake", "8", ""],
    ["03/11/2026", "Ada Meridian", "Outreach", "3", ""]
  ]
};
const stacked = stackTables([week10, week11], { sourceColumn: "source" });
assert.strictEqual(stacked.rows.length, 6);
assert.ok(stacked.headers.includes("source"));
assert.strictEqual(stacked.rows[0][stacked.headers.indexOf("source")], "week-10.csv");

const emails = {
  id: "c",
  name: "email-list.csv",
  headers: ["email", "first", "last", "tag"],
  rows: [
    ["ada@example.com", "Ada", "Meridian", "donor"],
    ["nia@example.net", "Nia", "Colfax", "newsletter"],
    ["Ada@example.com", "Ada", "Meridian", "volunteer"],
    ["ross@example.test", "Ross", "Kepler", "donor"],
    ["nia@example.net", "Nia", "Colfax", "event"],
    ["sol@example.org", "Sol", "Rivera", "newsletter"]
  ]
};
const unique = dedupeTable(emails, ["email"], "first");
assert.strictEqual(unique.rows.length, 4);

const csv = serializeCSV(unique.headers, unique.rows, false);
assert.match(csv, /ada@example\.com,Ada,Meridian,donor/);
assert.doesNotMatch(csv, /volunteer/);

console.log("lite-download.test.js ok");
