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

function tbodyRowCount(figureHtml) {
  const m = figureHtml.match(/<tbody>([\s\S]*?)<\/tbody>/);
  assert.ok(m, "missing tbody");
  return (m[1].match(/<tr[\s>]/g) || []).length;
}

const polarKitchen =
  "https://buy.polar.sh/polar_cl_WC72cncKI9qvJnIsKuSqE9gv2Aha7xU6HtiG50Pc2F9";
const polarEsc = polarKitchen.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const liteJobPages = [
  "plainrow/merge-csv-without-uploading/index.html",
  "plainrow/dedupe-csv-without-uploading/index.html"
];

const kitchenJobPages = [
  "plainrow/join-csv-without-uploading/index.html",
  "plainrow/split-csv-in-browser/index.html",
  "plainrow/clean-csv-without-uploading/index.html"
];

function assertSharedJobActions(rel, html, actions) {
  assert.ok(actions, rel + " missing .actions");
  assert.match(html, /<section class="example"/, rel + " missing example section");
  assert.match(actions, />Try Lite</, rel + " missing Try Lite in .actions");
  assert.match(actions, />Buy Kitchen · \$19</, rel + " missing Buy Kitchen · $19 in .actions");
  assert.match(
    actions,
    new RegExp('href="' + polarEsc + '"'),
    rel + " missing Polar checkout"
  );
  assert.match(actions, /target="_blank"/, rel + " missing target=_blank");
  assert.match(actions, /rel="noopener noreferrer"/, rel + " missing rel");
  assert.doesNotMatch(html, /<img\b/i, rel + " has an img");
  assert.doesNotMatch(html, /polarcdn/i, rel + " mentions polarcdn");
  assert.doesNotMatch(html, /kitchen\/plainrow\.html/, rel + " links kitchen/plainrow.html");
}

for (const rel of liteJobPages) {
  const html = read(rel);
  const actions = html.match(/<div class="actions">[\s\S]*?<\/div>/);
  assertSharedJobActions(rel, html, actions && actions[0]);
  assert.match(
    actions[0],
    /class="btn primary"[^>]*href="\/plainrow\/app\.html"[^>]*>Try Lite</,
    rel + " should lead with Try Lite"
  );
  assert.match(
    actions[0],
    /class="btn"[^>]*href="https:\/\/buy\.polar\.sh/,
    rel + " Buy Kitchen should stay secondary"
  );
}

for (const rel of kitchenJobPages) {
  const html = read(rel);
  const actions = html.match(/<div class="actions">[\s\S]*?<\/div>/);
  assertSharedJobActions(rel, html, actions && actions[0]);
  assert.match(
    actions[0],
    new RegExp(
      '^\\s*<div class="actions">\\s*' +
        '<a class="btn primary" href="' +
        polarEsc +
        '" target="_blank" rel="noopener noreferrer">Buy Kitchen · \\$19</a>\\s*' +
        '<a class="btn" href="/plainrow/app\\.html">Try Lite</a>'
    ),
    rel + " should lead with Buy Kitchen · $19, Try Lite second"
  );
  assert.doesNotMatch(
    actions[0],
    /class="btn primary"[^>]*href="\/plainrow\/app\.html"/,
    rel + " Try Lite must not be primary"
  );
}

for (const rel of kitchenJobPages) {
  const html = read(rel);
  assert.match(
    html,
    /Lite names Kitchen · \$19 on the toolbar: filter, columns, replace, dates, sort, recipes, join, stack, split, clean\. Kitchen is the zip that actually runs them\./,
    rel + " missing honest Lite/Kitchen line"
  );
}

const stack = read("plainrow/merge-csv-without-uploading/index.html");
assert.match(stack, /<figcaption>File A<\/figcaption>/);
assert.match(stack, /<figcaption>File B<\/figcaption>/);
assert.match(stack, /<figcaption>Result<\/figcaption>/);
assert.match(stack, />A-1</);
assert.match(stack, />B-9</);

const dedupe = read("plainrow/dedupe-csv-without-uploading/index.html");
assert.match(dedupe, /<figcaption>Input<\/figcaption>/);
assert.match(dedupe, /<figcaption>Result<\/figcaption>/);
assert.strictEqual(tbodyA1Count(figureByCaption(dedupe, "Input")), 2, "dedupe input should have two A-1 rows");
assert.strictEqual(tbodyA1Count(figureByCaption(dedupe, "Result")), 1, "dedupe result tbody should have one A-1");

const join = read("plainrow/join-csv-without-uploading/index.html");
assert.match(join, /<figcaption>catalog.csv<\/figcaption>/);
assert.match(join, /<figcaption>warehouse.csv<\/figcaption>/);
assert.match(join, /<figcaption>Result<\/figcaption>/);
const joinResult = figureByCaption(join, "Result");
assert.match(joinResult, /<th>Price<\/th>/, "join result must have a Price column");
assert.match(joinResult, /SKU-1002/, "join result keeps unmatched catalog SKU");
assert.doesNotMatch(joinResult, /SKU-1008/, "join result drops warehouse-only SKU");

const split = read("plainrow/split-csv-in-browser/index.html");
const splitInput = figureByCaption(split, "Input");
const splitResult = figureByCaption(split, "Result");
assert.match(splitInput, /Ada Lee/, "split input must show Ada Lee");
assert.match(splitResult, /<th>first<\/th>/, "split result must have first column");
assert.match(splitResult, /<th>last<\/th>/, "split result must have last column");
assert.match(splitResult, />Ada</, "split result must have first name");
assert.match(splitResult, />Lee</, "split result must have last name");
assert.doesNotMatch(splitResult, /Ada Lee/, "split result should not keep the combined name");

const clean = read("plainrow/clean-csv-without-uploading/index.html");
const cleanInput = figureByCaption(clean, "Input");
const cleanResult = figureByCaption(clean, "Result");
assert.ok(
  /<td>\s*<\/td>/.test(cleanInput) || /<td>&nbsp;<\/td>/.test(cleanInput) || /<td>\s+<\/td>/.test(cleanInput),
  "clean input should have a blank-ish extra row"
);
assert.ok(
  tbodyRowCount(cleanResult) < tbodyRowCount(cleanInput),
  "clean result should have fewer rows than input"
);

const css = read("styles.css");
assert.match(css, /\.example-grid/);
assert.match(css, /\.csv table/);

const aliases = [
  "plainrow/merge-csv-in-browser/index.html",
  "plainrow/stack-two-csv-files-in-browser/index.html"
];
for (const rel of aliases) {
  const html = read(rel);
  assert.match(html, /rel="canonical" href="https:\/\/fromtill.com\/plainrow\/merge-csv-without-uploading\/"/, rel + " missing canonical");
  assert.match(html, /http-equiv="refresh"/, rel + " missing refresh");
  assert.match(html, /location\.replace\("\/plainrow\/merge-csv-without-uploading\/"\)/, rel + " missing hop");
  assert.doesNotMatch(html, /<section class="example"/, rel + " still has its own example");
  assert.doesNotMatch(html, /buy\.polar\.sh/, rel + " links buy.polar.sh");
  assert.doesNotMatch(html, /kitchen\/plainrow\.html/, rel + " links kitchen HTML");
}

const sitemap = read("sitemap.xml");
assert.match(sitemap, /https:\/\/fromtill\.com\/plainrow\/merge-csv-without-uploading\//);
assert.match(sitemap, /https:\/\/fromtill\.com\/plainrow\/dedupe-csv-without-uploading\//);
assert.match(sitemap, /https:\/\/fromtill\.com\/plainrow\/join-csv-without-uploading\//);
assert.match(sitemap, /https:\/\/fromtill\.com\/plainrow\/split-csv-in-browser\//);
assert.match(sitemap, /https:\/\/fromtill\.com\/plainrow\/clean-csv-without-uploading\//);
assert.doesNotMatch(sitemap, /merge-csv-in-browser/);
assert.doesNotMatch(sitemap, /stack-two-csv-files-in-browser/);

console.log("job-page-examples.test.js ok");
