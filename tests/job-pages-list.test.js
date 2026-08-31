"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const product = read("plainrow/index.html");
const home = read("index.html");
const css = read("styles.css");

assert.match(product, />Try Lite</);
assert.match(product, />Download Lite</);
assert.match(product, /<h2>How it works<\/h2>/);
assert.match(product, /Open two CSV files\. They never leave this computer\./);
assert.match(product, /href="\/plainrow\/support\/"/);
assert.match(product, />Support</);

const jobHrefs = [
  "/plainrow/merge-csv-without-uploading/",
  "/plainrow/dedupe-csv-without-uploading/"
];
const jobLabels = [
  "Merge CSV without uploading",
  "Dedupe CSV without uploading"
];

for (let i = 0; i < jobHrefs.length; i++) {
  const item = new RegExp(
    "<li><a href=\"" + jobHrefs[i].replace(/\//g, "\\/") + "\">" +
      jobLabels[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
      "<\\/a><\\/li>"
  );
  assert.match(product, item, "missing list item for " + jobLabels[i]);
}

assert.match(product, /<ul class="job-pages">/);
assert.match(css, /\.job-pages\s*\{/);
assert.doesNotMatch(
  product,
  /<ul class="job-pages">[\s\S]*merge-csv-in-browser[\s\S]*<\/ul>/,
  "alias still listed on the product page"
);
assert.doesNotMatch(
  product,
  /<ul class="job-pages">[\s\S]*stack-two-csv-files-in-browser[\s\S]*<\/ul>/,
  "stack alias still listed on the product page"
);

const blob = /<p class="fine">[\s\S]*Support[\s\S]*merge-csv-without-uploading[\s\S]*merge-csv-in-browser[\s\S]*stack-two-csv-files-in-browser[\s\S]*dedupe-csv-without-uploading[\s\S]*<\/p>/;
assert.doesNotMatch(product, blob, "job-page links still jammed into the Support paragraph");

assert.doesNotMatch(home, /merge-csv-without-uploading|merge-csv-in-browser|stack-two-csv-files-in-browser|dedupe-csv-without-uploading/);

console.log("job-pages-list.test.js ok");
