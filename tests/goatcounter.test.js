"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const snippet =
  '<script data-goatcounter="https://fromtill.goatcounter.com/count"\n' +
  '        async src="//gc.zgo.at/count.js"></script>';

const livePages = [
  "index.html",
  "plainrow/index.html",
  "plainrow/app.html",
  "plainrow/plainrow-lite.html",
  "plainrow/support/index.html",
  "plainrow/stack-two-csv-files-in-browser/index.html",
  "plainrow/merge-csv-without-uploading/index.html",
  "plainrow/merge-csv-in-browser/index.html",
  "plainrow/join-csv-without-uploading/index.html",
  "plainrow/split-csv-in-browser/index.html",
  "plainrow/clean-csv-without-uploading/index.html",
  "plainrow/dedupe-csv-without-uploading/index.html"
];

const marker = /data-goatcounter="https:\/\/fromtill\.goatcounter\.com\/count"/g;
const src = /src="\/\/gc\.zgo\.at\/count\.js"/g;

for (const rel of livePages) {
  const html = read(rel);
  assert.ok(html.includes(snippet), rel + " missing exact GoatCounter snippet");
  assert.strictEqual((html.match(marker) || []).length, 1, rel + " should have GoatCounter once");
  assert.strictEqual((html.match(src) || []).length, 1, rel + " should have count.js once");
  const body = html.lastIndexOf("</body>");
  assert.ok(body > html.lastIndexOf(snippet), rel + " snippet must sit before </body>");
  assert.doesNotMatch(html, /google-analytics|googletagmanager|gtag\(|fbq\(|facebook\.net\/.*pixel/i, rel);
}

const kitchen = read("kitchen/plainrow.html");
assert.doesNotMatch(kitchen, /data-goatcounter|gc\.zgo\.at/, "Kitchen HTML must not ship GoatCounter");

const liteRedirect = read("lite/index.html");
assert.doesNotMatch(liteRedirect, /data-goatcounter|gc\.zgo\.at/, "lite/ redirect is not a listed live page");

console.log("goatcounter.test.js ok");
