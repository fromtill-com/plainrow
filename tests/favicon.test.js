"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function pngSize(buf) {
  assert.strictEqual(buf.slice(0, 8).toString("hex"), "89504e470d0a1a0a", "not a PNG");
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

const pages = [
  { rel: "index.html", png: "/logo.png" },
  { rel: "plainrow/index.html", png: "/plainrow/logo.png" },
  { rel: "plainrow/app.html", png: "/plainrow/logo.png" },
  { rel: "plainrow/support/index.html", png: "/plainrow/logo.png" }
];

for (const page of pages) {
  const html = read(page.rel);
  assert.match(html, /rel="icon" href="\/favicon\.ico"/, page.rel + " missing favicon.ico");
  assert.match(
    html,
    new RegExp('rel="apple-touch-icon" href="' + page.png.replace(/\//g, "\\/") + '"'),
    page.rel + " missing apple-touch-icon"
  );
  assert.match(
    html,
    new RegExp('rel="icon" type="image/png" sizes="32x32" href="' + page.png.replace(/\//g, "\\/") + '"'),
    page.rel + " missing 32x32 png icon"
  );
  assert.match(
    html,
    new RegExp('rel="icon" type="image/png" sizes="192x192" href="' + page.png.replace(/\//g, "\\/") + '"'),
    page.rel + " missing 192x192 png icon"
  );
  assert.doesNotMatch(html, /polarcdn/i, page.rel + " hotlinks Polar CDN");
}

const houseLogo = fs.readFileSync(path.join(root, "logo.png"));
const productLogo = fs.readFileSync(path.join(root, "plainrow/logo.png"));
assert.ok(houseLogo.equals(productLogo), "logo.png and plainrow/logo.png must be the same PNG bytes");

const houseSize = pngSize(houseLogo);
const productSize = pngSize(productLogo);
assert.strictEqual(houseSize.width, 512);
assert.strictEqual(houseSize.height, 512);
assert.strictEqual(productSize.width, 512);
assert.strictEqual(productSize.height, 512);

const ico = fs.readFileSync(path.join(root, "favicon.ico"));
assert.ok(ico.length >= 4, "favicon.ico is empty");
assert.strictEqual(ico[0], 0x00);
assert.strictEqual(ico[1], 0x00);
assert.strictEqual(ico[2], 0x01);
assert.strictEqual(ico[3], 0x00);

console.log("favicon.test.js ok");
