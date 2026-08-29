"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const publicPages = [
  "index.html",
  "plainrow/index.html",
  "plainrow/app.html",
  "plainrow/support/index.html",
  "plainrow/merge-csv-without-uploading/index.html",
  "plainrow/merge-csv-in-browser/index.html",
  "plainrow/stack-two-csv-files-in-browser/index.html",
  "plainrow/dedupe-csv-without-uploading/index.html",
  "lite/index.html"
];

const kitchenPitch = /Kitchen \(join|\$19|checkout is live|Join on a key|Kitchen only|Kitchen is the full engine|Kitchen's cap|when checkout is live/i;
const buyPath = /polar|buy now|github\.io/i;

for (const rel of publicPages) {
  const html = read(rel);
  assert.doesNotMatch(html, kitchenPitch, rel + " still pitches Kitchen or a checkout that is not live");
  assert.doesNotMatch(html, buyPath, rel + " has a buy path or GitHub Pages");
}

const home = read("index.html");
assert.match(home, /href="\/plainrow\/"/);
assert.match(home, /Stack two CSVs/);
assert.doesNotMatch(home, /disabled Kitchen|Kitchen has more tools/i);

const product = read("plainrow/index.html");
assert.match(product, />Try Lite</);
assert.match(product, /href="app\.html"/);
assert.match(product, /How it works/);
assert.match(product, /href="\/plainrow\/support\/"/);
assert.doesNotMatch(product, />Download Lite</, "leave Download Lite to FRO-9");
assert.doesNotMatch(product, /not a switch/);

const support = read("plainrow/support/index.html");
assert.match(support, /two files: stack, dedupe, and export/i);
assert.match(support, /href="\/plainrow\/app\.html"/);
assert.match(support, /There is no paid product on this site/);
assert.doesNotMatch(support, /How do I join|Lite or Kitchen|14 days/i);

const lite = read("plainrow/app.html");
assert.match(lite, /Two files\. Stack\. Dedupe\. Export/);
assert.match(lite, /id="btnStack"/);
assert.match(lite, /id="btnDedupe"/);
assert.doesNotMatch(lite, /litebar|k-badge|data-kitchen|Kitchen has more tools/);

const sitemap = read("sitemap.xml");
assert.match(sitemap, /https:\/\/fromtill\.com\/plainrow\/support\//);
assert.doesNotMatch(sitemap, /\/kitchen\//);

console.log("public-copy.test.js ok");
