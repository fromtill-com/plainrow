"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const polarKitchen =
  "https://buy.polar.sh/polar_cl_WC72cncKI9qvJnIsKuSqE9gv2Aha7xU6HtiG50Pc2F9";

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

const fakeCheckout = /github\.io|polar\.sh\/plainrow(?![A-Za-z0-9_-])/i;
const hostedKitchen = /href=["'][^"']*kitchen\/plainrow\.html|plainrow\/kitchen\//i;

for (const rel of publicPages) {
  const html = read(rel);
  assert.doesNotMatch(html, fakeCheckout, rel + " invents GitHub Pages or polar.sh/plainrow");
  assert.doesNotMatch(html, hostedKitchen, rel + " hosts Kitchen HTML on the public tree");
  assert.doesNotMatch(html, /when checkout is live/i, rel + " still says checkout is not live");
  assert.doesNotMatch(html, /disabled Kitchen|Kitchen has more tools/i, rel + " pitches a disabled Kitchen inside Lite");
}

const home = read("index.html");
assert.match(home, /href="\/plainrow\/"/);
assert.match(home, /Lite is free/);
assert.match(home, /Kitchen is \$19/);
assert.match(home, /<h1 class="lede">Small offline tools\.<\/h1>/);
assert.doesNotMatch(home, /Buy Kitchen|buy\.polar\.sh/, "keep the Polar buy on /plainrow/");

const merge = read("plainrow/merge-csv-without-uploading/index.html");
const mergeLede = merge.match(/<p class="lede">([\s\S]*?)<\/p>/);
assert.ok(mergeLede, "merge page missing lede");
assert.doesNotMatch(mergeLede[0], /duplicate/i, "merge lede should not promise dedupe");
assert.match(mergeLede[0], /Stack two CSV files in your browser/);

const product = read("plainrow/index.html");
assert.match(product, />Try Lite</);
assert.match(product, /href="app\.html"/);
assert.match(product, />Download Lite</);
assert.match(product, /href="plainrow-lite\.html"/);
assert.match(product, /How it works/);
assert.match(product, /href="\/plainrow\/support\/"/);
assert.match(product, /id="buyKitchen"/);
assert.match(product, new RegExp('href="' + polarKitchen.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"'));
assert.match(product, /target="_blank"/);
assert.match(product, />Buy Kitchen · \$19</);
assert.match(product, /paid offline HTML file: join, stack, split, clean/i);
assert.match(product, /Lite stays two files, stack, dedupe, export/);
assert.match(product, /Polar delivers the zip/);
assert.doesNotMatch(product, /not a switch/);
assert.doesNotMatch(product, /There is no paid product|nothing to refund/i);

const support = read("plainrow/support/index.html");
assert.match(support, /two files: stack, dedupe, and export/i);
assert.match(support, /href="\/plainrow\/app\.html"/);
assert.match(support, /Lite is free/);
assert.match(support, /Kitchen is \$19 via Polar/);
assert.match(support, /<h2>Open a ticket<\/h2>/);
assert.match(support, /<h2>Do files leave my machine\?<\/h2>/);
assert.match(support, /<h2>What can Lite do\?<\/h2>/);
assert.match(support, /<h2>What can Kitchen do\?<\/h2>/);
assert.match(support, /<h2>How do I buy Kitchen\?<\/h2>/);
assert.match(support, /mailto:till@fromtill\.com/);
assert.match(support, />till@fromtill\.com</);
assert.match(support, /We reply from that address/);
assert.match(support, /column names and row count, never file contents/i);
assert.match(support, /never ask for CSV contents/i);
assert.match(support, /paid offline HTML file: join, stack, split, clean/i);
assert.match(support, /property="og:title" content="Plainrow support"/);
assert.match(support, /type="application\/ld\+json"/);
assert.match(support, />Email till@fromtill\.com</);
assert.match(support, />Try Lite</);
assert.doesNotMatch(support, /buy\.polar\.sh/, "support Polar checkout belongs with a buy control");
const supportVisible = support
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ");
assert.match(supportVisible, /mailto:till@fromtill\.com/, "ticket address must be readable without JS");
assert.match(supportVisible, />till@fromtill\.com</, "ticket address text must be readable without JS");
assert.doesNotMatch(support, /There is no paid product|nothing to refund/i);
assert.doesNotMatch(support, /How do I join/i);
assert.doesNotMatch(support, /<form|zendesk|intercom|crisp|drift|chat widget/i);
assert.doesNotMatch(support, /google-analytics|googletagmanager|gtag\(/i);
assert.doesNotMatch(support, /14-day|testimonial|as seen in/i);

const lite = read("plainrow/app.html");
assert.match(lite, /Two files\. Stack\. Dedupe\. Export/);
assert.match(lite, /id="btnStack"/);
assert.match(lite, /id="btnDedupe"/);
assert.match(lite, /class="buy-job"/);
assert.match(lite, />Join · Kitchen · \$19</);
assert.match(lite, />Split · Kitchen · \$19</);
assert.match(lite, />Clean · Kitchen · \$19</);
assert.match(lite, new RegExp('href="' + polarKitchen.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"'));
assert.match(lite, /rel="canonical" href="https:\/\/fromtill\.com\/plainrow\/app\.html"/);
assert.match(lite, /property="og:title" content="Plainrow Lite"/);
assert.doesNotMatch(lite, /litebar|k-badge|data-kitchen|Kitchen has more tools/);
assert.doesNotMatch(lite, /function openJoin|function openSplit|function openClean|joinTables|splitTable/);

const sitemap = read("sitemap.xml");
assert.match(sitemap, /https:\/\/fromtill\.com\/plainrow\/support\//);
assert.doesNotMatch(sitemap, /\/kitchen\//);

console.log("public-copy.test.js ok");
