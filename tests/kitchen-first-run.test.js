"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const kitchen = fs.readFileSync(path.join(__dirname, "../kitchen/plainrow.html"), "utf8");
const readme = fs.readFileSync(path.join(__dirname, "../kitchen/README.md"), "utf8");

assert.doesNotMatch(kitchen, /\bLITE\b/);
assert.doesNotMatch(kitchen, /500 rows/);
assert.doesNotMatch(kitchen, /1 MB/);
assert.doesNotMatch(kitchen, /litebar/);
assert.doesNotMatch(kitchen, /Load the payment demo/);
assert.doesNotMatch(readme, /500 rows/);
assert.doesNotMatch(readme, /Same tools/);

assert.match(kitchen, /Join two files on a key/);
assert.match(kitchen, /Load the inventory demo/);
assert.match(kitchen, /class="join-tool"/);
assert.match(kitchen, /Lite is a separate two-file stack and dedupe tool, not this kitchen with a row cap/);
assert.match(kitchen, /\["join", "Join"\]/);
assert.ok(
  kitchen.indexOf('["join", "Join"]') < kitchen.indexOf('["stack", "Stack"]'),
  "Join should lead the toolbar"
);
assert.match(kitchen, /loadDemo\("inventory"/);
assert.match(readme, /Two-file stack and dedupe/);
assert.match(readme, /not a capped Kitchen|not Kitchen with a row cap/);
assert.match(readme, /The paid motion/);

const empty = kitchen.slice(kitchen.indexOf('id="empty"'), kitchen.indexOf('id="tableHost"'));
assert.match(empty, /catalog and warehouse/);
assert.match(empty, /Join them on SKU/);
assert.doesNotMatch(empty, /Drop a CSV on the counter/);

const help = kitchen.slice(kitchen.indexOf('id="help"'), kitchen.indexOf("Dates like"));
assert.match(help, /two-inventory demo/);
assert.match(help, /pine button/);
assert.doesNotMatch(help, /Lite is 2 files/);

console.log("kitchen-first-run tests passed");
