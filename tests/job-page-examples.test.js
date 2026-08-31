"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function figureByCaption(html, caption) {
  const re = new RegExp(
    '<figure class="csv">\\s*<figcaption>' + caption + "</figcaption>[\\s\\S]*?</figure>"
  );
  const m = html.match(re);
  assert.ok(m, "missing figure " + caption);
  return m[0];
}

function tbodyA1Count(figureHtml) {
  const m = figureHtml.match(/<tbody>([\s\S]*?)<\/tbody>/);
  assert.ok(m, "missing tbody");
  return (m[1].match(/>A-1</g) || []).length;
}

const jobPages = [
  "plainrow/merge-csv-without-uploading/index.html",
  "plainrow/merge-csv-in-browser/index.html",
  "plainrow/stack-two-csv-files-in-browser/index.html",
  "plainrow/dedupe-csv-without-uploading/index.html"
];

const stackPages = [
  "plainrow/merge-csv-without-uploading/index.html",
  "plainrow/merge-csv-in-browser/index.html",
  "plainrow/stack-two-csv-files-in-browser/index.html"
];

for (const rel of jobPages) {
  const html = read(rel);
  assert.match(html, /<section class="example"/, rel + " missing example section");
  assert.match(html, />Try Lite</, rel + " missing Try Lite");
  assert.doesNotMatch(html, /<img\b/i, rel + " has an img");
  assert.doesNotMatch(html, /polarcdn/i, rel + " mentions polarcdn");
  assert.doesNotMatch(html, /kitchen\/plainrow\.html/, rel + " links kitchen/plainrow.html");
  assert.doesNotMatch(html, /buy\.polar\.sh/, rel + " links buy.polar.sh");
}

for (const rel of stackPages) {
  const html = read(rel);
  assert.match(html, /<figcaption>File A<\/figcaption>/, rel + " missing File A");
  assert.match(html, /<figcaption>File B<\/figcaption>/, rel + " missing File B");
  assert.match(html, /<figcaption>Result<\/figcaption>/, rel + " missing Result");
  assert.match(html, />A-1</, rel + " missing A-1");
  assert.match(html, />B-9</, rel + " missing B-9");
}

const dedupe = read("plainrow/dedupe-csv-without-uploading/index.html");
assert.match(dedupe, /<figcaption>Input<\/figcaption>/);
assert.match(dedupe, /<figcaption>Result<\/figcaption>/);
assert.strictEqual(tbodyA1Count(figureByCaption(dedupe, "Input")), 2, "dedupe input should have two A-1 rows");
assert.strictEqual(tbodyA1Count(figureByCaption(dedupe, "Result")), 1, "dedupe result tbody should have one A-1");

const css = read("styles.css");
assert.match(css, /\.example-grid/);
assert.match(css, /\.csv table/);

console.log("job-page-examples.test.js ok");
