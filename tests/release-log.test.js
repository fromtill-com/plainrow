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

const rel = "plainrow/log/index.html";
const html = read(rel);
const visible = visibleCopy(html);

assert.match(html, /<title>Plainrow release log<\/title>/);
assert.match(html, /rel="canonical" href="https:\/\/fromtill\.com\/plainrow\/log\/"/);
assert.match(html, /property="og:title" content="Plainrow release log"/);
assert.match(html, /property="og:url" content="https:\/\/fromtill\.com\/plainrow\/log\/"/);
assert.match(html, /property="og:image" content="https:\/\/fromtill\.com\/plainrow\/logo\.png"/);
assert.match(
  html,
  /property="og:description" content="What shipped on Plainrow. Kitchen is \$19. Lite is free. Nothing is uploaded."/
);
assert.match(html, /<h1 class="product-name">Plainrow release log<\/h1>/);
assert.match(html, /href="\/styles\.css\?v=20260905a"/);

assert.match(visible, /Kitchen is \$19/);
assert.match(visible, /Buy Kitchen · \$19 is the only primary CTA on Plainrow/);
assert.match(visible, /Try Lite is second/);
assert.match(
  visible,
  /filter, columns, replace, dates, sort, recipes, join, stack, split, clean/
);
assert.match(visible, /Join, split, and clean job pages lead Buy Kitchen/);
assert.match(visible, /Lite empty state stacks two CSVs/);
assert.match(visible, /Buy Kitchen sits before Try Lite/);
assert.doesNotMatch(visible, /testimonial|customers|Product Hunt|14-day/i);
assert.doesNotMatch(visible, /\b\d[\d,]*\s+(visitors?|users?|customers?)\b/i);
assert.doesNotMatch(html, /kitchen\/plainrow\.html|\/kitchen\//);
assert.doesNotMatch(html, /google-analytics|googletagmanager|gtag\(/i);

const first = html.indexOf('id="2026-09-05"');
const second = html.indexOf('id="2026-09-01"');
const third = html.indexOf('id="2026-08-31"');
assert.ok(first > 0 && second > first && third > second, "entries must be newest first");

const data = jsonLd(html, rel);
assert.strictEqual(data["@type"], "Blog", "log JSON-LD should be Blog");
assert.strictEqual(data.url, "https://fromtill.com/plainrow/log/");
assert.ok(Array.isArray(data.blogPost) && data.blogPost.length >= 1, "log Blog missing posts");
assert.strictEqual(data.blogPost[0].datePublished, "2026-09-05");
for (const post of data.blogPost) {
  assert.strictEqual(post["@type"], "BlogPosting");
  assert.ok(post.headline, "BlogPosting missing headline");
  assert.ok(post.datePublished, "BlogPosting missing datePublished");
  assert.ok(visible.includes(post.headline), "headline not on page: " + post.headline);
  assert.ok(visible.includes(post.description), "description not on page: " + post.description);
}

const house = read("index.html");
const product = read("plainrow/index.html");
const support = read("plainrow/support/index.html");
for (const [name, page] of [
  ["house", house],
  ["product", product],
  ["support", support]
]) {
  assert.match(page, /href="\/plainrow\/log\/"/, name + " missing release log href");
  assert.match(page, />Release log</, name + " missing Release log link text");
}

const houseCatalog = house.match(/<ul class="catalog">[\s\S]*?<\/ul>/);
assert.ok(houseCatalog, "house missing catalog");
assert.strictEqual((houseCatalog[0].match(/<li>/g) || []).length, 1, "house stays one card");
assert.doesNotMatch(houseCatalog[0], /Release log/, "do not add a second Tools card for the log");

console.log("release-log.test.js ok");
