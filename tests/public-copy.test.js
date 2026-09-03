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

const polarEsc = polarKitchen.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const home = read("index.html");
assert.match(home, /href="\/plainrow\/"/);
assert.match(home, />Open</);
assert.match(home, /Lite is free/);
assert.match(home, /Kitchen is \$19/);
assert.match(home, /Kitchen is \$19: filter, columns, replace, dates, sort, recipes, join, stack, split, clean\./);
assert.doesNotMatch(home, /Kitchen is \$19: join, stack, split, clean\./);
assert.match(home, /<h1 class="lede">Small offline tools\.<\/h1>/);
assert.match(home, /<ul class="catalog">/);
assert.match(home, /<ul class="catalog">[\s\S]*>Buy Kitchen · \$19 · filter/);
assert.match(home, new RegExp('href="' + polarEsc + '"'));
assert.match(home, /target="_blank"/);
assert.match(home, /rel="noopener noreferrer"/);
const houseCatalog = home.match(/<ul class="catalog">[\s\S]*?<\/ul>/);
assert.ok(houseCatalog, "house missing catalog");
assert.strictEqual((houseCatalog[0].match(/<li>/g) || []).length, 1, "house stays one card");
assert.strictEqual((home.match(/>Open</g) || []).length, 1, "house stays one Open");
assert.match(houseCatalog[0], /<span class="item-name">Plainrow<\/span>/);
assert.match(houseCatalog[0], />Open</);
assert.match(houseCatalog[0], /class="btn primary kitchen-buy"/);
assert.match(
  houseCatalog[0],
  />Buy Kitchen · \$19 · filter, columns, replace, dates, sort, recipes, join, stack, split, clean · more than two files</
);
assert.doesNotMatch(houseCatalog[0], /class="fine"|toolbar-note/, "Kitchen tools are on the Buy Kitchen control");
assert.doesNotMatch(home, /<span class="item-name">Kitchen</);
assert.doesNotMatch(home, /<span class="item-name">Filter/);
assert.doesNotMatch(home, /polar\.sh\/plainrow/);
assert.doesNotMatch(home, /Try Lite|Download Lite/);
assert.doesNotMatch(home, /<div class="actions">/, "house stays a catalog, not a product pitch");
const css = read("styles.css");
assert.match(css, /\.catalog \.kitchen-buy \{[\s\S]*?font-weight: 650/);
assert.match(css, /\.catalog \.kitchen-buy \{[\s\S]*?white-space: normal/);

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
const productLede = product.match(/<p class="lede">([\s\S]*?)<\/p>/);
assert.ok(productLede, "product missing lede");
assert.match(productLede[0], /two files/);
assert.match(productLede[0], /stack/i);
assert.match(productLede[0], /duplicate rows/);
assert.match(
  productLede[0],
  /Kitchen is \$19: filter, columns, replace, dates, sort, recipes, join, stack, split, clean, more than two files/
);
assert.match(
  product,
  /Kitchen is the paid offline HTML file\. Polar delivers the zip\. \$19 one-time\. Filter, columns, replace, dates, sort, recipes, and more than two files, plus join, stack, split, and clean\. Lite stays two files, stack, dedupe, export\./
);
assert.strictEqual(
  (product.match(/Filter, columns, replace, dates, sort, recipes, and more than two files/g) || []).length,
  1,
  "one Kitchen sentence on /plainrow/"
);
assert.match(product, /Lite stays two files, stack, dedupe, export/);
assert.match(product, /Polar delivers the zip/);
assert.doesNotMatch(product, /paid offline HTML file: join, stack, split, clean\./);
assert.doesNotMatch(product, /Kitchen is \$19: join, stack, split, clean\./);
assert.doesNotMatch(product, /not a switch/);
assert.doesNotMatch(product, /There is no paid product|nothing to refund/i);
const productActions = product.match(/<div class="actions">[\s\S]*?<\/div>/);
assert.ok(productActions, "product missing .actions");
assert.match(productActions[0], /class="btn primary"[^>]*>Try Lite</);
assert.match(
  productActions[0],
  /<a class="btn primary" id="buyKitchen" href="https:\/\/buy\.polar\.sh\/polar_cl_WC72cncKI9qvJnIsKuSqE9gv2Aha7xU6HtiG50Pc2F9"[^>]*>Buy Kitchen · \$19</
);
assert.match(productActions[0], /id="downloadLite"/);
assert.doesNotMatch(productActions[0], /id="downloadLite"[^>]*primary|class="btn primary"[^>]*id="downloadLite"/);
assert.ok(
  productActions[0].indexOf("Buy Kitchen") < productActions[0].indexOf("Download Lite"),
  "Buy Kitchen must not sit behind Download Lite"
);
assert.strictEqual(
  (productActions[0].match(/class="btn primary"/g) || []).length,
  2,
  "Try Lite and Buy Kitchen are both primary"
);

const support = read("plainrow/support/index.html");
assert.match(support, /two files: stack, dedupe, and export/i);
assert.match(support, /href="\/plainrow\/app\.html"/);
assert.match(support, />Try Lite</);
assert.match(support, />Email till@fromtill\.com</);
assert.match(support, /Lite is free/);
assert.match(support, /Kitchen is \$19 via Polar/);
assert.match(support, /<h2>Open a ticket<\/h2>/);
assert.match(support, /<h2>Do files leave my machine\?<\/h2>/);
assert.match(support, /<h2>What can Lite do\?<\/h2>/);
assert.match(support, /<h2>What can Kitchen do\?<\/h2>/);
assert.match(support, /<h2>How do I buy Kitchen\?<\/h2>/);
const supportBuy = support.match(/<h2>How do I buy Kitchen\?<\/h2>\s*<p>([\s\S]*?)<\/p>/);
assert.ok(supportBuy, "support missing How do I buy Kitchen body");
assert.match(supportBuy[1], new RegExp(polarEsc));
assert.match(supportBuy[1], /offline HTML file/);
assert.match(supportBuy[1], /join, split, clean/);
assert.match(supportBuy[1], /filter, columns, replace, dates, and sort/);
assert.doesNotMatch(supportBuy[1], /testimonial|14-day|customers/i);
assert.match(support, /property="og:title" content="Plainrow support"/);
assert.match(support, /type="application\/ld\+json"/);
const supportVisible = support
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ");
assert.match(supportVisible, /mailto:till@fromtill\.com/, "ticket address must be readable without JS");
assert.match(supportVisible, />till@fromtill\.com</, "ticket address text must be readable without JS");
assert.doesNotMatch(support, /google-analytics|googletagmanager|gtag\(/i);
assert.doesNotMatch(support, /14-day|testimonial|as seen in/i);
assert.match(support, /mailto:till@fromtill\.com/);
assert.match(support, />till@fromtill\.com</);
assert.match(support, /We reply from that address/);
assert.match(support, /column names and row count, never file contents/i);
assert.match(support, /never ask for CSV contents/i);
assert.match(
  support,
  /Kitchen is the paid offline HTML file\. Polar delivers the zip\. \$19 one-time\. Filter, columns, replace, dates, sort, recipes, and more than two files, plus join, stack, split, and clean\. Lite stays two files, stack, dedupe, export\./
);
assert.doesNotMatch(support, /paid offline HTML file: join, stack, split, clean\./);
const supportActions = support.match(/<div class="actions">[\s\S]*?<\/div>/);
assert.ok(supportActions, "support missing .actions");
assert.match(supportActions[0], />Email till@fromtill\.com</);
assert.match(supportActions[0], />Try Lite</);
assert.match(supportActions[0], />Buy Kitchen · \$19</);
assert.match(supportActions[0], new RegExp('href="' + polarEsc + '"'));
assert.match(supportActions[0], /target="_blank"/);
assert.match(supportActions[0], /rel="noopener noreferrer"/);
assert.match(support, /mailto:till@fromtill\.com/, "ticket address must be readable without JS");
assert.doesNotMatch(support, /There is no paid product|nothing to refund/i);
assert.doesNotMatch(support, /How do I join/i);
assert.doesNotMatch(support, /<form|zendesk|intercom|crisp|drift|chat widget/i);
assert.doesNotMatch(support, /polar\.sh\/plainrow/);

const lite = read("plainrow/app.html");
assert.match(lite, /Two files\. Stack\. Dedupe\. Export/);
const liteEmpty = lite.slice(lite.indexOf('id="empty"'), lite.indexOf('id="tableHost"'));
assert.match(liteEmpty, /Stack two CSV files/);
assert.doesNotMatch(liteEmpty, /Drop a CSV on the counter/);
assert.match(liteEmpty, /Load the stack demo/);
assert.strictEqual((liteEmpty.match(/Open CSV/g) || []).length, 1);
assert.match(lite, /id="btnStack"/);
assert.match(lite, /id="btnDedupe"/);
assert.match(lite, /class="buy-job"/);
assert.match(
  lite,
  />Kitchen · \$19 · filter, columns, replace, dates, sort, recipes, join, stack, split, clean · more than two files</
);
assert.doesNotMatch(lite, />Join · Kitchen · \$19</);
assert.doesNotMatch(lite, />Split · Kitchen · \$19</);
assert.doesNotMatch(lite, />Clean · Kitchen · \$19</);
const liteToolbar = lite.match(/<div class="toolbar">[\s\S]*?<\/div>/);
assert.ok(liteToolbar, "Lite toolbar exists");
assert.strictEqual(
  (liteToolbar[0].match(/<a class="buy-job"/g) || []).length,
  1,
  "one Kitchen · $19 control on Lite"
);
assert.match(
  liteToolbar[0],
  />Kitchen · \$19 · filter, columns, replace, dates, sort, recipes, join, stack, split, clean · more than two files</
);
assert.doesNotMatch(lite, /toolbar-note|Kitchen also does|buy-job-set|buy-job-label/, "Kitchen tools are not a Lite whisper");
assert.strictEqual(
  (lite.match(/filter, columns, replace, dates, sort, recipes, join, stack, split, clean · more than two files/g) || []).length,
  1,
  "one Kitchen sentence on Lite"
);
assert.match(lite, new RegExp('href="' + polarKitchen.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"'));
assert.match(lite, /rel="canonical" href="https:\/\/fromtill\.com\/plainrow\/app\.html"/);
assert.match(lite, /property="og:title" content="Plainrow Lite"/);
assert.doesNotMatch(lite, /litebar|k-badge|data-kitchen|Kitchen has more tools/);
assert.doesNotMatch(lite, /function openJoin|function openSplit|function openClean|joinTables|splitTable/);
assert.doesNotMatch(lite, /recipeInput|btnLoadRecipe|Load recipe JSON|function openFilter|function openDates/);

const sitemap = read("sitemap.xml");
assert.match(sitemap, /https:\/\/fromtill\.com\/plainrow\/support\//);
assert.doesNotMatch(sitemap, /\/kitchen\//);

console.log("public-copy.test.js ok");
