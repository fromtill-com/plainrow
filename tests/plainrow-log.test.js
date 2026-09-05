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

const log = read("plainrow/log/index.html");
const product = read("plainrow/index.html");
const support = read("plainrow/support/index.html");
const home = read("index.html");
const sitemap = read("sitemap.xml");
const llms = read("llms.txt");
const css = read("styles.css");

assert.match(log, /<header class="masthead">/);
assert.match(log, /<a class="wordmark" href="\/">From Till<\/a>/);
assert.match(log, /<p class="crumb"><a href="\/">Tools<\/a> \/ <a href="\/plainrow\/">Plainrow<\/a> \/ log<\/p>/);
assert.match(log, /<footer class="colophon">fromtill.com<\/footer>/);
assert.match(
  log,
  /<script data-goatcounter="https:\/\/fromtill\.goatcounter\.com\/count"\n        async src="\/\/gc\.zgo\.at\/count\.js"><\/script>/
);

assert.match(log, /<time datetime="2026-09-04">2026-09-04<\/time>/);
assert.ok(
  /2026-09-04|2026-09-05/.test(log),
  "log needs a 2026-09-04 and/or 2026-09-05 entry"
);

const data = jsonLd(log, "plainrow/log/index.html");
assert.strictEqual(data["@type"], "CollectionPage", "log JSON-LD should be CollectionPage");
assert.strictEqual(data.url, "https://fromtill.com/plainrow/log/");
assert.ok(Array.isArray(data.hasPart) && data.hasPart.length >= 1, "log missing dated part");
assert.strictEqual(data.hasPart[0]["@type"], "BlogPosting");
assert.ok(
  data.hasPart[0].datePublished === "2026-09-04" || data.hasPart[0].datePublished === "2026-09-05",
  "first log entry date"
);
const body = String(data.hasPart[0].articleBody || "");
assert.match(body, /Buy Kitchen · \$19/);
assert.match(body, /filter, columns, replace, dates, sort, recipes, join, stack, split, clean/);
assert.match(body, /Join, split, and clean/);
assert.match(body, /Stack two CSV files/);
const visible = log
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");
assert.ok(
  visible.includes(body.split(". ")[0]),
  "JSON-LD articleBody must appear on the page"
);

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
  /<loc>https:\/\/fromtill\.com\/plainrow\/log\/<\/loc>\s*<lastmod>2026-09-05<\/lastmod>/
);
assert.doesNotMatch(sitemap, /\/kitchen\//);

assert.strictEqual(
  (llms.match(/fromtill\.com\/plainrow\/log\//g) || []).length,
  1,
  "llms.txt gets one log line"
);
assert.match(llms, /\[Plainrow log\]\(https:\/\/fromtill\.com\/plainrow\/log\/\): dated ships/);

assert.match(css, /\.colophon a \{/);
assert.doesNotMatch(log, /14-day|testimonial|as seen in|\d+%/i);
assert.doesNotMatch(log, /kitchen\/plainrow\.html/);
assert.doesNotMatch(log, /<div class="actions">/, "log is not a second sell page");

console.log("plainrow-log.test.js ok");
