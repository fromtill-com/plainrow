"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

const pages = [
  ["index.html", "/logo.png"],
  ["plainrow/index.html", "/plainrow/logo.png"],
  ["plainrow/app.html", "/plainrow/logo.png"],
  ["plainrow/support/index.html", "/plainrow/logo.png"]
];

for (const [rel, href] of pages) {
  const html = read(rel);
  assert.match(html, /rel="icon"[^>]*href="\/favicon\.ico"/);
  assert.match(html, new RegExp(`rel="apple-touch-icon"[^>]*href="${href}"`));
  assert.match(html, new RegExp(`sizes="32x32"[^>]*href="${href}"`));
  assert.match(html, new RegExp(`sizes="192x192"[^>]*href="${href}"`));
  assert.doesNotMatch(html, /polarcdn|cdn\.polar/i);
}

const housePng = fs.readFileSync(path.join(root, "logo.png"));
const productPng = fs.readFileSync(path.join(root, "plainrow/logo.png"));
assert.ok(housePng.equals(productPng), "house and product logo.png must be the same bytes");
assert.ok(housePng.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])));
const width = housePng.readUInt32BE(16);
const height = housePng.readUInt32BE(20);
assert.strictEqual(width, 512);
assert.strictEqual(height, 512);

const ico = fs.readFileSync(path.join(root, "favicon.ico"));
assert.ok(ico.slice(0, 4).equals(Buffer.from([0, 0, 1, 0])), "favicon.ico must be an ICO");

console.log("favicon.test.js ok");
