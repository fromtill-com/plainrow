"use strict";

// Visual-run fixtures recorded 2026-08-30 from a real click-through:
//   Lite  (plainrow/app.html)          — Load the stack demo, then Stack (source column on).
//     week-10.csv  3 rows · 5 cols
//     week-11.csv  3 rows · 5 cols
//     stacked      6 rows · 6 cols   (Work Date, Staff, Project, Hours, Notes, source)
//   Kitchen (kitchen/plainrow.html)    — Load the inventory demo, left join on SKU.
//     catalog.csv    5 rows · 3 cols
//     warehouse.csv  4 rows · 3 cols
//     joined         5 rows · 5 cols (SKU, Product, Price, On Hand, Bin)
//     forecast       3 matches, 2 unmatched left, 1 unmatched right
//   Lite email keep-first (same demo data as the emails sample):
//     email-list.csv 6 rows · 4 cols → 4 rows · 4 cols after keep-first on email

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");

function scriptFrom(html) {
  return html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
}

function extractFunction(src, name) {
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

function extractConstObject(src, name) {
  const needle = "const " + name + " =";
  const start = src.indexOf(needle);
  if (start < 0) throw new Error("missing const " + name);
  const brace = src.indexOf("{", start);
  let depth = 0;
  for (let i = brace; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return src.slice(brace, i + 1);
    }
  }
  throw new Error("unclosed const " + name);
}

function loadFunctions(src, names) {
  vm.runInThisContext(names.map((n) => extractFunction(src, n)).join("\n"));
}

function tableFromDemo(pack) {
  const parsed = parseCSV(pack.csv);
  return {
    id: uid(),
    name: pack.name,
    headers: parsed.headers,
    rows: parsed.rows,
    warnings: parsed.warnings
  };
}

const liteBytes = fs.readFileSync(path.join(root, "plainrow/app.html"));
const kitchenLiteBytes = fs.readFileSync(path.join(root, "kitchen/plainrow-lite.html"));
const liteHtml = liteBytes.toString("utf8");
const kitchenHtml = fs.readFileSync(path.join(root, "kitchen/plainrow.html"), "utf8");
const liteSrc = scriptFrom(liteHtml);
const kitchenSrc = scriptFrom(kitchenHtml);

assert.ok(liteBytes.equals(kitchenLiteBytes), "plainrow/app.html must be byte-identical to kitchen/plainrow-lite.html");

assert.doesNotMatch(liteHtml, /\bjoinTables\b/, "Lite must not contain joinTables");
assert.doesNotMatch(liteHtml, /recipeInput|btnLoadRecipe|Load recipe JSON|extraRecipes/, "Lite must not load recipe JSON");
assert.doesNotMatch(liteHtml, /\bLITE\b/, "Lite must not carry a LITE flag");
assert.doesNotMatch(
  liteHtml,
  /function openJoin|function openSplit|function openClean|function splitTable|function trimTable|function dropEmptyRows|function joinForecast/,
  "Lite must not implement Join, Split, or Clean"
);
assert.doesNotMatch(liteHtml, /localStorage|unlocked|data-kitchen|k-badge|litebar/, "Lite must not restore the locked Kitchen teaser");

const polarKitchen =
  "https://buy.polar.sh/polar_cl_WC72cncKI9qvJnIsKuSqE9gv2Aha7xU6HtiG50Pc2F9";
const liteToolbar = liteHtml.match(/<div class="toolbar">[\s\S]*?<\/div>/);
assert.ok(liteToolbar, "Lite toolbar exists");
assert.match(liteToolbar[0], /id="btnStack"/);
assert.match(liteToolbar[0], /id="btnDedupe"/);
assert.match(liteToolbar[0], />Join</);
assert.match(liteToolbar[0], />Split</);
assert.match(liteToolbar[0], />Clean</);
const buyJobs = [...liteToolbar[0].matchAll(/<a class="buy-job"[^>]*>/g)].map((m) => m[0]);
assert.strictEqual(buyJobs.length, 3, "Join, Split, and Clean are three empty buy links");
for (const tag of buyJobs) {
  assert.ok(tag.includes(polarKitchen), "empty Kitchen job links Polar checkout");
  assert.ok(tag.includes('target="_blank"'), "empty Kitchen job opens a new tab");
  assert.ok(tag.includes('rel="noopener noreferrer"'), "empty Kitchen job has rel");
  assert.ok(tag.includes("Buy Kitchen · $19"), "empty Kitchen job promotes Buy Kitchen · $19");
}

loadFunctions(liteSrc, [
  "uid",
  "cloneTable",
  "detectDelim",
  "parseCSV",
  "normName",
  "resolveCol",
  "stackTables",
  "dedupeTable"
]);
const liteDemos = vm.runInThisContext("(" + extractConstObject(liteSrc, "DEMOS") + ")");
assert.ok(liteDemos.timesheets && liteDemos.timesheets.length === 2, "Lite stack demo is two timesheet files");
assert.ok(liteDemos.emails && liteDemos.emails.length === 1, "Lite email demo is one file");

const week10 = tableFromDemo(liteDemos.timesheets[0]);
const week11 = tableFromDemo(liteDemos.timesheets[1]);
assert.strictEqual(week10.name, "week-10.csv");
assert.strictEqual(week11.name, "week-11.csv");
assert.strictEqual(week10.rows.length, 3, "visual: week-10.csv 3 rows");
assert.strictEqual(week10.headers.length, 5, "visual: week-10.csv 5 cols");
assert.strictEqual(week11.rows.length, 3, "visual: week-11.csv 3 rows");
assert.strictEqual(week11.headers.length, 5, "visual: week-11.csv 5 cols");
assert.deepStrictEqual(week10.headers, ["Work Date", "Staff", "Project", "Hours", "Notes"]);

const stacked = stackTables([week10, week11], { sourceColumn: "source" });
assert.strictEqual(stacked.rows.length, 6, "visual: stacked 6 rows");
assert.strictEqual(stacked.headers.length, 6, "visual: stacked 6 cols (union + source)");
assert.deepStrictEqual(stacked.headers, ["Work Date", "Staff", "Project", "Hours", "Notes", "source"]);
assert.strictEqual(stacked.rows[0][5], "week-10.csv");
assert.strictEqual(stacked.rows[3][5], "week-11.csv");

const emails = tableFromDemo(liteDemos.emails[0]);
assert.strictEqual(emails.rows.length, 6, "email demo starts at 6 rows");
assert.strictEqual(emails.headers.length, 4, "email demo has 4 cols");
const unique = dedupeTable(emails, ["email"], "first");
assert.strictEqual(unique.rows.length, 4, "keep-first email dedupe: 4 rows");
assert.strictEqual(unique.headers.length, 4, "keep-first email dedupe: 4 cols");
assert.deepStrictEqual(unique.rows.map((r) => r[0]), [
  "ada@example.com",
  "nia@example.net",
  "ross@example.test",
  "sol@example.org"
]);
assert.strictEqual(unique.rows[0][3], "donor", "keep-first keeps the first Ada row, not volunteer");

loadFunctions(kitchenSrc, [
  "uid",
  "cloneTable",
  "detectDelim",
  "parseCSV",
  "normName",
  "resolveCol",
  "joinKeyCell",
  "isLikelyKeyName",
  "pickSharedKey",
  "rightJoinColumns",
  "joinForecast",
  "joinTypeHint",
  "joinPrefixHint",
  "joinResultSummary",
  "joinTables"
]);
const kitchenDemos = vm.runInThisContext("(" + extractConstObject(kitchenSrc, "DEMOS") + ")");
assert.ok(kitchenDemos.inventory && kitchenDemos.inventory.length === 2, "Kitchen inventory demo is two files");

const catalog = tableFromDemo(kitchenDemos.inventory[0]);
const warehouse = tableFromDemo(kitchenDemos.inventory[1]);
assert.strictEqual(catalog.name, "catalog.csv");
assert.strictEqual(warehouse.name, "warehouse.csv");
assert.strictEqual(catalog.rows.length, 5, "visual: catalog.csv 5 rows");
assert.strictEqual(catalog.headers.length, 3, "visual: catalog.csv 3 cols");
assert.strictEqual(warehouse.rows.length, 4, "visual: warehouse.csv 4 rows");
assert.strictEqual(warehouse.headers.length, 3, "visual: warehouse.csv 3 cols");

const inventoryLeft = { type: "left", leftKey: "SKU", rightKey: "SKU" };
const fc = joinForecast(catalog, warehouse, inventoryLeft);
assert.strictEqual(fc.error, null);
assert.strictEqual(fc.match, 3, "visual: 3 matches");
assert.strictEqual(fc.unmatchedLeft, 2, "visual: 2 unmatched left");
assert.strictEqual(fc.unmatchedRight, 1, "visual: 1 unmatched right");

const joined = joinTables(catalog, warehouse, inventoryLeft);
assert.strictEqual(joined.rows.length, 5, "visual: joined 5 rows");
assert.strictEqual(joined.headers.length, 5, "visual: joined 5 cols");
assert.deepStrictEqual(joined.headers, ["SKU", "Product", "Price", "On Hand", "Bin"]);
assert.deepStrictEqual(joined.rows[0], ["SKU-1001", "Linen tea towel", "18.00", "12", "A-1"]);
assert.deepStrictEqual(joined.rows[1], ["SKU-1002", "Stoneware mug", "14.00", "", ""]);
assert.match(joined.warnings[0], /3 matches, 2 unmatched on catalog\.csv, 1 unmatched on warehouse\.csv/);

console.log("visual-smoke.test.js ok");
console.log("  Lite stack union: 6 rows × 6 cols");
console.log("  Lite keep-first dedupe: 4 rows × 4 cols");
console.log("  Kitchen inventory join: 5 rows × 5 cols (3 matches / 2 unmatched left / 1 unmatched right)");
