"use strict";

// Cheap CTA harness: every public Try/Download/Buy href on house + job pages
// must be root-absolute (or https) so relative resolution from / cannot 404.

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");

function collectHtml(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...collectHtml(p));
    else if (ent.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const files = [
  path.join(root, "plainrow/index.html"),
  ...collectHtml(path.join(root, "plainrow")).filter((f) => !f.endsWith("/app.html") && !f.endsWith("plainrow-lite.html"))
];
const uniq = [...new Set(files)];

for (const file of uniq) {
  const html = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file);
  for (const m of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/gi)) {
    const tag = m[0];
    const href = m[1];
    const label = />([^<]*)</.exec(tag);
    const text = (label && label[1]) || "";
    if (!/Try Lite|Download Lite|Buy Kitchen|Open Lite/i.test(text) && !/id="(buyKitchen|downloadLite)"/.test(tag)) {
      continue;
    }
    assert.ok(
      href.startsWith("/") || href.startsWith("https://"),
      `${rel}: CTA "${text || tag}" href must be absolute, got ${href}`
    );
    if (/Try Lite|Open Lite/i.test(text)) {
      assert.strictEqual(href, "/plainrow/app.html", `${rel}: Try/Open Lite must be /plainrow/app.html`);
    }
    if (/Download Lite/i.test(text) || /id="downloadLite"/.test(tag)) {
      assert.ok(href === "/plainrow/plainrow-lite.bin" || href.endsWith("/plainrow-lite.bin"), `${rel}: Download Lite href ${href}`);
    }
  }
}

console.log("cta-links ok:", uniq.length, "files");
