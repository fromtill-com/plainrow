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

const jobs = [
  ["/plainrow/merge-csv-without-uploading/", "Merge CSV without uploading", "Lite"],
  ["/plainrow/dedupe-csv-without-uploading/", "Dedupe CSV without uploading", "Lite"],
  ["/plainrow/join-csv-without-uploading/", "Join CSV without uploading", "Kitchen"],
  ["/plainrow/split-csv-in-browser/", "Split CSV in the browser", "Kitchen"],
  ["/plainrow/clean-csv-without-uploading/", "Clean CSV without uploading", "Kitchen"]
];

for (const [href, label, tier] of jobs) {
  const item = new RegExp(
    "<li><a href=\"" + href.replace(/\//g, "\\/") + "\">" +
      label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
      "<\\/a> <span class=\"job-tier\">" + tier + "<\\/span><\\/li>"
  );
  assert.match(product, item, "missing list item for " + label);
}

assert.match(product, /<ul class="job-pages">/);
assert.match(css, /\.job-pages\s*\{/);
assert.match(css, /\.job-tier\s*\{/);
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

assert.doesNotMatch(
  home,
  /merge-csv-without-uploading|merge-csv-in-browser|stack-two-csv-files-in-browser|dedupe-csv-without-uploading|join-csv-without-uploading|split-csv-in-browser|clean-csv-without-uploading/
);
assert.doesNotMatch(
  product,
  /filter-csv|dates-csv|replace-csv|sort-csv|recipe-json/,
  "do not invent extra Kitchen job URLs"
);

console.log("job-pages-list.test.js ok");
