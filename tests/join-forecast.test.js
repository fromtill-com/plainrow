"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "../kitchen/plainrow.html"), "utf8");
const src = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));

function extractFunction(name) {
  const needle = "function " + name;
  const start = src.indexOf(needle);
  if (start < 0) throw new Error("missing function " + name);
  const brace = src.indexOf("{", start);
  let depth = 0;
  for (let i = brace; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error("unclosed function " + name);
}

const names = [
  "uid",
  "normName",
  "resolveCol",
  "joinKeyCell",
  "isLikelyKeyName",
  "pickSharedKey",
  "rightJoinColumns",
  "joinForecast",
  "joinTypeHint",
  "joinPrefixHint",
  "joinResultSummary",
  "joinTables"
];
vm.runInThisContext(names.map(extractFunction).join("\n"));

function table(name, headers, rows, id) {
  return { id: id || name, name: name, headers: headers, rows: rows };
}

const catalog = table("catalog.csv", ["SKU", "Product", "Price"], [
  ["SKU-1001", "Linen tea towel", "18.00"],
  ["SKU-1002", "Stoneware mug", "14.00"],
  ["SKU-1003", "Oak spoon", "9.00"],
  ["SKU-1004", "Cotton apron", "28.00"],
  ["SKU-1005", "Beeswax wrap", "12.00"]
]);
const warehouse = table("warehouse.csv", ["SKU", "On Hand", "Bin"], [
  ["SKU-1001", "12", "A-1"],
  ["SKU-1003", "9", "A-3"],
  ["SKU-1005", "18", "A-5"],
  ["SKU-1008", "11", "B-8"]
]);

const inventoryLeft = {
  type: "left",
  leftKey: "SKU",
  rightKey: "SKU"
};

const fc = joinForecast(catalog, warehouse, inventoryLeft);
assert.strictEqual(fc.error, null);
assert.strictEqual(fc.match, 3);
assert.strictEqual(fc.unmatchedLeft, 2);
assert.strictEqual(fc.unmatchedRight, 1);
assert.strictEqual(fc.prefixed.length, 0);
assert.match(joinResultSummary(fc), /3 matches, 2 unmatched on catalog\.csv, 1 unmatched on warehouse\.csv/);
assert.match(joinResultSummary(fc), /No right-hand columns were prefixed/);

const joined = joinTables(catalog, warehouse, inventoryLeft);
assert.strictEqual(joined.rows.length, 5);
assert.deepStrictEqual(joined.headers, ["SKU", "Product", "Price", "On Hand", "Bin"]);
assert.ok(joined.warnings[0].indexOf("3 matches") !== -1);
assert.ok(joined.warnings[0].indexOf("No right-hand columns were prefixed") !== -1);
assert.deepStrictEqual(joined.rows[0], ["SKU-1001", "Linen tea towel", "18.00", "12", "A-1"]);
assert.deepStrictEqual(joined.rows[1], ["SKU-1002", "Stoneware mug", "14.00", "", ""]);

const inner = joinTables(catalog, warehouse, { type: "inner", leftKey: "SKU", rightKey: "SKU" });
assert.strictEqual(inner.rows.length, 3);

const zero = joinForecast(catalog, warehouse, { type: "inner", leftKey: "SKU", rightKey: "Bin" });
assert.strictEqual(zero.error, null);
assert.strictEqual(zero.match, 0);
assert.strictEqual(zero.unmatchedLeft, 5);
assert.strictEqual(zero.unmatchedRight, 4);
assert.match(joinTypeHint(zero), /0 rows/);

const miss = joinTables(catalog, warehouse, { type: "left", leftKey: "SKU", rightKey: "Bin" });
assert.strictEqual(miss.rows.length, 5);
assert.ok(miss.rows.every((row) => row[3] === "" && row[4] === ""));
assert.match(miss.warnings[0], /0 matches/);

const blank = table("blank.csv", ["SKU", "Qty"], [["", "1"], ["", "2"], ["  ", "3"]]);
const blankFc = joinForecast(catalog, blank, { type: "left", leftKey: "SKU", rightKey: "SKU" });
assert.match(blankFc.error, /blank in every row/);
assert.throws(() => joinTables(catalog, blank, { type: "left", leftKey: "SKU", rightKey: "SKU" }), /blank in every row/);

assert.throws(() => joinTables(catalog, warehouse, { type: "left", leftKey: "", rightKey: "SKU" }), /Pick a key column/);

const same = joinForecast(catalog, catalog, { type: "left", leftKey: "SKU", rightKey: "SKU" });
assert.match(same.error, /two different files/);

const collideLeft = table("shop.csv", ["SKU", "Name", "Qty"], [["A", "Mug", "1"]]);
const collideRight = table("stock.csv", ["SKU", "Name", "Bin"], [["A", "Mug", "B-1"], ["B", "Bowl", "B-2"]]);
const collide = joinForecast(collideLeft, collideRight, { type: "left", leftKey: "SKU", rightKey: "SKU" });
assert.strictEqual(collide.match, 1);
assert.strictEqual(collide.unmatchedRight, 1);
assert.deepStrictEqual(collide.prefixed.map((p) => p.prefixed), ["stock.Name"]);
const collideJoined = joinTables(collideLeft, collideRight, { type: "left", leftKey: "SKU", rightKey: "SKU" });
assert.deepStrictEqual(collideJoined.headers, ["SKU", "Name", "Qty", "stock.Name", "Bin"]);
assert.match(collideJoined.warnings[0], /Prefixed right-hand columns: stock\.Name/);

assert.strictEqual(pickSharedKey(["Product", "SKU", "Price"], ["On Hand", "SKU"]), "SKU");
assert.strictEqual(pickSharedKey(["email", "name"], ["Email", "role"]), "email");
assert.strictEqual(pickSharedKey(["a", "b"], ["c", "d"]), null);

const blanksDoNotMatch = table("left.csv", ["id", "n"], [["", "x"], ["1", "y"]]);
const blanksRight = table("right.csv", ["id", "m"], [["", "z"], ["1", "w"]]);
const blankMatch = joinTables(blanksDoNotMatch, blanksRight, { type: "inner", leftKey: "id", rightKey: "id" });
assert.strictEqual(blankMatch.rows.length, 1);
assert.deepStrictEqual(blankMatch.rows[0], ["1", "y", "w"]);

console.log("join-forecast tests passed");
