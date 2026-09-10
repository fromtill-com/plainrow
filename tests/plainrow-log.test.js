"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function jsonLd(html, rel) {
  const scripts = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  assert.strictEqual(scripts.length, 1, rel + " should have exactly one JSON-LD script");
  const jsonText = scripts[0].replace(/^<script type="application\/ld\+json">/, "").replace(/<\/script>$/, "");
  return JSON.parse(jsonText);
}

function visibleCopy(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

const log = read("plainrow/log/index.html");
const product = read("plainrow/index.html");
const support = read("plainrow/support/index.html");
const home = read("index.html");
const sitemap = read("sitemap.xml");
const llms = read("llms.txt");
const css = read("styles.css");
const visible = visibleCopy(log);
const data = jsonLd(log, "plainrow/log/index.html");
const jsonText = JSON.stringify(data);
const publicText = visible + " " + jsonText;

assert.match(log, /<header class="masthead">/);
assert.match(log, /<a class="wordmark" href="\/">From Till<\/a>/);
assert.match(log, /<p class="crumb"><a href="\/">Tools<\/a> \/ <a href="\/plainrow\/">Plainrow<\/a> \/ log<\/p>/);
assert.match(log, /<footer class="colophon">fromtill.com<\/footer>/);
assert.match(
  log,
  /<script data-goatcounter="https:\/\/fromtill\.goatcounter\.com\/count"\n        async src="\/\/gc\.zgo\.at\/count\.js"><\/script>/
);

assert.match(log, /<time datetime="2026-09-10">2026-09-10<\/time>/);
assert.match(log, /<time datetime="2026-09-09">2026-09-09<\/time>/);
assert.match(log, /<time datetime="2026-09-08">2026-09-08<\/time>/);
assert.match(log, /<time datetime="2026-09-07">2026-09-07<\/time>/);
assert.match(log, /<time datetime="2026-09-06">2026-09-06<\/time>/);
assert.match(log, /<time datetime="2026-09-05">2026-09-05<\/time>/);
assert.match(log, /<time datetime="2026-09-04">2026-09-04<\/time>/);
const dateOrder = log.indexOf('id="2026-09-10"');
assert.ok(dateOrder > -1, "log missing 2026-09-10 section");
assert.ok(dateOrder < log.indexOf('id="2026-09-09"'), "2026-09-10 must sit above 2026-09-09");
assert.ok(log.indexOf('id="2026-09-09"') < log.indexOf('id="2026-09-08"'), "2026-09-09 must sit above 2026-09-08");
assert.ok(log.indexOf('id="2026-09-08"') < log.indexOf('id="2026-09-07"'), "2026-09-08 must sit above 2026-09-07");
assert.ok(log.indexOf('id="2026-09-07"') < log.indexOf('id="2026-09-06"'), "2026-09-07 must sit above 2026-09-06");
assert.ok(log.indexOf('id="2026-09-06"') < log.indexOf('id="2026-09-05"'), "2026-09-06 must sit above 2026-09-05");
assert.ok(log.indexOf('id="2026-09-05"') < log.indexOf('id="2026-09-04"'), "2026-09-05 must sit above 2026-09-04");
assert.match(visible, /The files are yours because they trusted you/);
assert.match(visible, /You cannot put this client's file in the cloud/);
assert.match(visible, /Monday is putting the catalog and the warehouse on one sheet/);
assert.match(visible, /Lite cannot do that/);
assert.match(visible, /Kitchen can/);
assert.match(visible, /You already have the catalog/);
assert.match(visible, /warehouse leftovers that were never in the catalog/);
assert.match(visible, /Kitchen can: \$19 once, Polar emails a zip/);
assert.match(visible, /Monday is matching stock to the catalog/);
assert.match(visible, /Keep every catalog product even if stock is blank/);
assert.match(visible, /Lite stays free for two-file stack and dedupe/);
assert.match(visible, /Download Lite saves the free tool as one HTML file/);
assert.match(visible, /it is not another tab of the site/);
assert.match(visible, /that is Kitchen, not Lite/);

assert.match(visible, /Plainrow is offline CSV work in the browser/);
assert.match(visible, /Lite is free: two files, stack, dedupe, export/);
assert.match(visible, /Kitchen is \$19 one-time/);
assert.match(visible, /Polar delivers a zip of the offline HTML file/);
assert.match(visible, /Filter, columns, replace, dates, sort, recipes, join, stack, split, clean, more than two files/);
assert.match(visible, /Open Lite/);
assert.match(visible, /Buy Kitchen · \$19/);
assert.match(visible, /Try Lite/);
assert.match(log, /href="\/plainrow\/app\.html"/);
assert.match(log, /href="\/plainrow\/"/);
assert.match(
  log,
  /href="https:\/\/buy\.polar\.sh\/polar_cl_WC72cncKI9qvJnIsKuSqE9gv2Aha7xU6HtiG50Pc2F9"/
);

assert.match(visible, /that is Lite/);
assert.match(visible, /that is Kitchen/);
assert.match(visible, /Merge, append, and dedupe pages are Lite jobs/);
assert.match(visible, /Join, split, and clean pages are Kitchen jobs/);

assert.match(log, /Buy Kitchen · \$19 is the only primary button/);
assert.match(log, /filter, columns, replace, dates, sort, recipes, join, stack, split, clean/);
assert.match(log, /Join, split, and clean pages lead with Buy Kitchen/);
assert.match(log, /Lite empty state is Stack two CSV files/);
assert.doesNotMatch(log, /perfect[\s-]*inner[\s-]*join/i);

const opsLeaks = [
  /FRO-\d+/i,
  /\bPR\s*#\s*\d+/i,
  /\bLinear\b/,
  /keep\/kill/i,
  /Polar Kitchen still 0/i,
  /Polar orders?\s*0/i,
  /\bstill 0\b/i,
  /GoatCounter/,
  /Product Hunt/i,
  /Curlie/i,
  /AlternativeTo/i,
  /directory suggest/i,
  /kill review/i,
  /Sep 30 score/i,
  /2026-10-31/,
  /integrity PASS/i,
  /\bbet\b/i,
  /ticket closed/i
];
for (const leak of opsLeaks) {
  assert.doesNotMatch(publicText, leak, "public log leaked internal ops: " + leak);
}

assert.doesNotMatch(publicText, /SKU-100/, "log must not show demo SKUs");
assert.doesNotMatch(publicText, /left-join/i, "log must not lead with left-join jargon");

assert.strictEqual(data["@type"], "CollectionPage", "log JSON-LD should be CollectionPage");
assert.strictEqual(data.url, "https://fromtill.com/plainrow/log/");
assert.ok(Array.isArray(data.hasPart) && data.hasPart.length >= 4, "log missing dated parts");
assert.strictEqual(data.hasPart[0]["@type"], "BlogPosting");
assert.strictEqual(data.hasPart[0].datePublished, "2026-09-09", "first log entry date");
assert.strictEqual(data.hasPart[1].datePublished, "2026-09-08");
assert.strictEqual(data.hasPart[2].datePublished, "2026-09-07");
assert.strictEqual(data.hasPart[3].datePublished, "2026-09-06");
assert.strictEqual(data.hasPart[4].datePublished, "2026-09-05");
assert.strictEqual(data.hasPart[5].datePublished, "2026-09-04");
assert.match(String(data.hasPart[0].articleBody || ""), /The files are yours because they trusted you/);
assert.match(String(data.hasPart[0].articleBody || ""), /You cannot put this client's file in the cloud/);
assert.match(String(data.hasPart[0].articleBody || ""), /Kitchen can/);
assert.match(String(data.hasPart[0].articleBody || ""), /Buy Kitchen · \$19/);
assert.doesNotMatch(String(data.hasPart[0].articleBody || ""), /SKU-1002|SKU-1008|left-join|When stock has to land/i);
assert.match(String(data.hasPart[1].articleBody || ""), /You already have the catalog/);
assert.match(String(data.hasPart[1].articleBody || ""), /Kitchen can: \$19 once/);
assert.match(String(data.hasPart[1].articleBody || ""), /Buy Kitchen · \$19/);
assert.doesNotMatch(String(data.hasPart[1].articleBody || ""), /SKU-1002|SKU-1008|left-join/i);
assert.match(String(data.hasPart[2].articleBody || ""), /Monday is matching stock to the catalog/);
assert.match(String(data.hasPart[2].articleBody || ""), /Buy Kitchen · \$19/);
assert.doesNotMatch(String(data.hasPart[2].articleBody || ""), /SKU-1002|SKU-1008|left-join/i);
assert.match(String(data.hasPart[3].articleBody || ""), /Download Lite saves the free tool as one HTML file/);
assert.match(String(data.hasPart[3].articleBody || ""), /not another tab of the site/);
assert.match(String(data.hasPart[4].articleBody || ""), /Plainrow is offline CSV work in the browser/);
assert.match(String(data.hasPart[4].articleBody || ""), /Buy Kitchen · \$19/);
assert.match(String(data.hasPart[4].articleBody || ""), /Lite is free/);
assert.match(String(data.hasPart[5].articleBody || ""), /that is Lite/);
assert.match(String(data.hasPart[5].articleBody || ""), /that is Kitchen/);
assert.match(String(data.hasPart[6].articleBody || ""), /Stack two CSV files/);
assert.match(String(data.hasPart[6].articleBody || ""), /Buy Kitchen · \$19 is the only primary button/);

for (const part of data.hasPart) {
  const body = String(part.articleBody || "");
  assert.ok(body, "log JSON-LD entry missing articleBody");
  const first = body.split(". ")[0];
  assert.ok(visible.includes(first), "JSON-LD articleBody must appear on the page: " + first);
}

assert.match(product, /<a href="\/plainrow\/log\/">Log<\/a>/);
assert.match(support, /<a href="\/plainrow\/log\/">Log<\/a>/);
assert.match(product, /<footer class="colophon">fromtill.com · <a href="\/plainrow\/log\/">Log<\/a><\/footer>/);
assert.match(support, /<footer class="colophon">fromtill.com · <a href="\/plainrow\/log\/">Log<\/a><\/footer>/);

const houseCatalog = home.match(/<ul class="catalog">[\s\S]*?<\/ul>/);
assert.ok(houseCatalog, "house missing catalog");
assert.strictEqual((houseCatalog[0].match(/<li>/g) || []).length, 1, "house stays one card");
assert.doesNotMatch(houseCatalog[0], /item-name">Log</, "do not add a second Tools card for the log");
assert.doesNotMatch(home, /href="\/plainrow\/log\/"/);

assert.match(
  sitemap,
  /<loc>https:\/\/fromtill\.com\/plainrow\/log\/<\/loc>\s*<lastmod>2026-09-09<\/lastmod>/
);
assert.doesNotMatch(sitemap, /\/kitchen\//);

assert.strictEqual(
  (llms.match(/fromtill\.com\/plainrow\/log\//g) || []).length,
  1,
  "llms.txt gets one log line"
);
assert.match(llms, /\[Plainrow log\]\(https:\/\/fromtill\.com\/plainrow\/log\/\): what shipped/);

assert.match(css, /\.colophon a \{/);
assert.doesNotMatch(log, /14-day|testimonial|as seen in|\d+%/i);
assert.doesNotMatch(log, /kitchen\/plainrow\.html/);
assert.doesNotMatch(log, /<div class="actions">/, "log is not a second sell page");

console.log("plainrow-log.test.js ok");
