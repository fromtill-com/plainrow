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

const pages = [
  "index.html",
  "plainrow/index.html",
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

  const scripts = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  assert.strictEqual(scripts.length, 1, rel + " should have exactly one JSON-LD script");
  const jsonText = scripts[0].replace(/^<script type="application\/ld\+json">/, "").replace(/<\/script>$/, "");
  JSON.parse(jsonText);
}

const robots = read("robots.txt");
assert.doesNotMatch(robots, /59f32e29a92e4537b944974ec760e8fd/, "IndexNow key must not be listed as a sitemap in robots");

const sitemap = read("sitemap.xml");
assert.doesNotMatch(sitemap, /59f32e29a92e4537b944974ec760e8fd/, "IndexNow key file must not be in sitemap");
assert.doesNotMatch(sitemap, /polar\.sh/, "sitemap must not include polar");
assert.doesNotMatch(sitemap, /\/kitchen\//, "sitemap must not include kitchen HTML");

console.log("discovery-seo.test.js ok");
