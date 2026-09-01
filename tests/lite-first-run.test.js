"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const lite = fs.readFileSync(path.join(__dirname, "../plainrow/app.html"), "utf8");
const download = fs.readFileSync(path.join(__dirname, "../plainrow/plainrow-lite.html"));
const kitchenLite = fs.readFileSync(path.join(__dirname, "../kitchen/plainrow-lite.html"));
const kitchen = fs.readFileSync(path.join(__dirname, "../kitchen/plainrow.html"), "utf8");

assert.ok(Buffer.from(lite).equals(download), "download Lite matches live app.html");
assert.ok(Buffer.from(lite).equals(kitchenLite), "kitchen/plainrow-lite.html matches live app.html");

const empty = lite.slice(lite.indexOf('id="empty"'), lite.indexOf('id="tableHost"'));
assert.match(empty, /Stack two CSV files/);
assert.match(empty, /two weekly timesheets/);
assert.match(empty, /then Stack them/);
assert.match(empty, /Load the stack demo/);
assert.doesNotMatch(empty, /Drop a CSV on the counter/);
assert.doesNotMatch(empty, /Drop a CSV/);
assert.ok(
  empty.indexOf('id="btnDemo"') < empty.indexOf('id="btnOpen2"'),
  "stack demo is the empty primary, not Open CSV"
);
assert.match(empty, /class="btn primary" id="btnDemo"/);
assert.match(empty, /id="btnOpen2">Open CSV</);
assert.strictEqual((empty.match(/Open CSV/g) || []).length, 1, "do not add another empty Open button");
assert.doesNotMatch(empty, /id="btnOpen3"|Open another|Open CSVs/);

assert.match(lite, /loadDemo\("timesheets", \{ thenStack: true \}\)/);
assert.match(lite, /Two weekly timesheets — week 10 and week 11\. Stack them\./);
assert.doesNotMatch(lite, /thenJoin|openJoin|joinTables|function openJoin/);
const thenBlock = lite.slice(lite.indexOf("if (thenStack)"), lite.indexOf("if (n) toast"));
assert.match(thenBlock, /openStack\(\)/);
assert.doesNotMatch(thenBlock, /stackTables/, "demo must not auto-apply Stack and hide the tool");

const help = lite.slice(lite.indexOf('id="help"'), lite.indexOf("id=\"foot\""));
assert.match(help, /stack demo/);
assert.match(help, /two weekly timesheets/);
assert.match(help, /Stack is the first toolbar button/);
assert.doesNotMatch(help, /Open CSV or TSV files with the picker/);

assert.doesNotMatch(lite, /kitchen\/plainrow\.html/);
assert.doesNotMatch(kitchen, /id="btnDemo">Load the stack demo/);
console.log("lite-first-run tests passed");
