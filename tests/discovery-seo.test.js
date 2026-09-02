"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const key = "59f32e29a92e4537b944974ec760e8fd";
const keyRel = key + ".txt";
assert.ok(fs.existsSync(path.join(root, keyRel)), "IndexNow key file missing");
const keyFile = read(keyRel);
assert.strictEqual(keyFile, key + "\n", "IndexNow key file must equal the key plus a trailing newline");

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

const pages = [
  "index.html",
  "plainrow/index.html",
  "plainrow/app.html",
  "plainrow/support/index.html",
  "plainrow/append-csv-files-in-browser/index.html",
  "plainrow/merge-csv-without-uploading/index.html",
  "plainrow/dedupe-csv-without-uploading/index.html",
  "plainrow/join-csv-without-uploading/index.html",
  "plainrow/split-csv-in-browser/index.html",
  "plainrow/clean-csv-without-uploading/index.html"
];

for (const rel of pages) {
  const html = read(rel);
  assert.match(html, /application\/ld\+json/, rel + " missing JSON-LD");
  assert.match(html, /property="og:title"/, rel + " missing og:title");
  assert.doesNotMatch(html, /kitchen\/plainrow\.html/, rel + " links kitchen/plainrow.html");
  jsonLd(html, rel);
}

const home = read("index.html");
assert.match(home, /<h1[\s>]/, "house page missing h1");

const lite = read("plainrow/app.html");
assert.match(
  lite,
  /rel="canonical" href="https:\/\/fromtill\.com\/plainrow\/app\.html"/,
  "Lite missing canonical"
);
assert.match(lite, /property="og:url" content="https:\/\/fromtill\.com\/plainrow\/app\.html"/);

const support = read("plainrow/support/index.html");
assert.match(
  support,
  /rel="canonical" href="https:\/\/fromtill\.com\/plainrow\/support\/"/,
  "support missing canonical"
);
assert.match(support, /property="og:title" content="Plainrow support"/);
assert.match(support, /property="og:url" content="https:\/\/fromtill\.com\/plainrow\/support\/"/);
assert.match(support, /property="og:image" content="https:\/\/fromtill\.com\/plainrow\/logo\.png"/);
assert.match(
  support,
  /property="og:description" content="Email till@fromtill.com. Lite is free. Kitchen is \$19 via Polar. Answers and how files stay on your machine. Nothing is uploaded."/
);
const supportLd = jsonLd(support, "plainrow/support/index.html");
assert.strictEqual(supportLd["@type"], "FAQPage", "support JSON-LD should be FAQPage");
assert.ok(Array.isArray(supportLd.mainEntity) && supportLd.mainEntity.length >= 5, "support FAQPage missing questions");
const supportVisible = visibleCopy(support);
const supportText = support
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, "")
  .replace(/\s+/g, " ");
const requiredFaqs = [
  "Open a ticket",
  "Do files leave my machine",
  "What can Lite do",
  "What can Kitchen do",
  "How do I buy Kitchen"
];
const faqNames = supportLd.mainEntity.map((q) => String(q.name || ""));
for (const phrase of requiredFaqs) {
  assert.ok(
    faqNames.some((name) => name.replace(/\?$/, "") === phrase),
    "support FAQPage missing question: " + phrase
  );
}
for (const question of supportLd.mainEntity) {
  assert.strictEqual(question["@type"], "Question", "support FAQ is not Question");
  const name = String(question.name || "").trim();
  assert.ok(name, "support Question missing name");
  assert.ok(
    supportVisible.toLowerCase().includes(name.replace(/\?$/, "").toLowerCase()),
    "support Question is not on the page: " + name
  );
  const answer = question.acceptedAnswer;
  assert.ok(answer && answer["@type"] === "Answer", "support Question missing Answer");
  const text = String(answer.text || "").trim();
  assert.ok(text, "support Answer missing text");
  assert.ok(
    supportText.toLowerCase().includes(text.toLowerCase()),
    "support Answer is not on the page: " + text
  );
}

const jobPages = [
  "plainrow/append-csv-files-in-browser/index.html",
  "plainrow/merge-csv-without-uploading/index.html",
  "plainrow/dedupe-csv-without-uploading/index.html",
  "plainrow/join-csv-without-uploading/index.html",
  "plainrow/split-csv-in-browser/index.html",
  "plainrow/clean-csv-without-uploading/index.html"
];

for (const rel of jobPages) {
  const html = read(rel);
  const data = jsonLd(html, rel);
  assert.strictEqual(data["@type"], "HowTo", rel + " JSON-LD should be HowTo");
  assert.ok(Array.isArray(data.step) && data.step.length >= 3, rel + " HowTo missing steps");
  const visible = visibleCopy(html);
  for (const step of data.step) {
    assert.strictEqual(step["@type"], "HowToStep", rel + " step is not HowToStep");
    const phrase = String(step.text || step.name || "").replace(/\.$/, "").trim();
    assert.ok(phrase, rel + " HowToStep missing name/text");
    assert.ok(
      visible.toLowerCase().includes(phrase.toLowerCase()),
      rel + " HowToStep is not on the page: " + phrase
    );
  }
}

const robots = read("robots.txt");
assert.doesNotMatch(robots, /59f32e29a92e4537b944974ec760e8fd/, "IndexNow key must not be listed as a sitemap in robots");

const sitemap = read("sitemap.xml");
assert.match(sitemap, /https:\/\/fromtill\.com\/plainrow\/plainrow-lite\.html/);
assert.match(sitemap, /https:\/\/fromtill\.com\/plainrow\/app\.html/);
assert.doesNotMatch(sitemap, /59f32e29a92e4537b944974ec760e8fd/, "IndexNow key file must not be in sitemap");
assert.doesNotMatch(sitemap, /polar\.sh/, "sitemap must not include polar");
assert.doesNotMatch(sitemap, /\/kitchen\//, "sitemap must not include kitchen HTML");
assert.doesNotMatch(sitemap, /merge-csv-in-browser|stack-two-csv-files-in-browser/);
assert.match(sitemap, /<lastmod>2026-08-31<\/lastmod>/);
assert.match(
  sitemap,
  /<loc>https:\/\/fromtill\.com\/plainrow\/<\/loc>\s*<lastmod>2026-09-02<\/lastmod>/
);
assert.match(
  sitemap,
  /<loc>https:\/\/fromtill\.com\/plainrow\/support\/<\/loc>\s*<lastmod>2026-09-02<\/lastmod>/
);

const polarKitchen =
  "https://buy.polar.sh/polar_cl_WC72cncKI9qvJnIsKuSqE9gv2Aha7xU6HtiG50Pc2F9";
const llms = read("llms.txt");
assert.match(llms, /^# From Till\n/);
assert.match(llms, /https:\/\/fromtill\.com\/plainrow\/app\.html/);
assert.match(llms, /stack/i);
assert.match(llms, /dedupe/i);
assert.match(llms, /Nothing is uploaded/);
assert.match(llms, /\$19 one-time/);
assert.match(llms, /Filter, columns, replace, dates, sort, recipes, and more than two files, plus join, stack, split, and clean/);
assert.match(llms, new RegExp(polarKitchen.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(llms, /till@fromtill\.com/);
assert.doesNotMatch(llms, /kitchen\/plainrow\.html|github\.io/i);
assert.doesNotMatch(llms, /google-analytics|googletagmanager|gtag\(/i);
assert.doesNotMatch(llms, /14-day|14 day|testimonial|customers/i);

console.log("discovery-seo.test.js ok");
