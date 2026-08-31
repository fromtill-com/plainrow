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

const jobPages = [
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

const polarKitchen =
  "https://buy.polar.sh/polar_cl_WC72cncKI9qvJnIsKuSqE9gv2Aha7xU6HtiG50Pc2F9";
const llms = read("llms.txt");
assert.match(llms, /^# From Till\n/);
assert.match(llms, /https:\/\/fromtill\.com\/plainrow\/app\.html/);
assert.match(llms, /stack/i);
assert.match(llms, /dedupe/i);
assert.match(llms, /Nothing is uploaded/);
assert.match(llms, /\$19 one-time/);
assert.match(llms, /join, stack, split, clean/i);
assert.match(llms, new RegExp(polarKitchen.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(llms, /till@fromtill\.com/);
assert.doesNotMatch(llms, /kitchen\/plainrow\.html|github\.io/i);
assert.doesNotMatch(llms, /google-analytics|googletagmanager|gtag\(/i);
assert.doesNotMatch(llms, /14-day|14 day|testimonial|customers/i);

console.log("discovery-seo.test.js ok");
