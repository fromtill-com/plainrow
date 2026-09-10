# Monday join — stranger copy draft

For UX voice-check. Replaces live `/plainrow/join-csv-without-uploading/` REJECT voice (“Left join two CSVs…”, SKU-1001/1002/1008, feature dump). URL stays. Buttons stay `Buy Kitchen · $19` / `Try Lite`. Do not restuff labels.

Bars: person first (lived constraint, not “For VAs…”); Monday job; short Kitchen close. No left-join. No SKU-1002/1008. No filter/columns laundry list.

---

## 1) Paste-ready page story (for UX)

A client is waiting on a sheet. You are the virtual assistant, the nonprofit ops person, the one-seat bookkeeper. The next screen wants an upload. You cannot put this client's CSV in the cloud.

Monday is putting warehouse stock on every product in the catalog. Every product stays, even if stock is blank. Leftover warehouse rows that were never listed have to go. None of it leaves this computer.

Lite cannot do that. Lite is free: two files, stack, dedupe, export.

Kitchen does this job. $19 one-time. Polar emails a zip. You get the sheet back without uploading.

CTA note: `Buy Kitchen · $19` and `Try Lite` stay as the buttons. Do not put Buy/Try into the prose.

---

## 2) Page chrome (exact strings)

**h1**
Put warehouse stock on the catalog

**lede**
A client trusted you with these files. You cannot put their CSV on someone else's computer.

**sub**
Put warehouse stock on every catalog product — blank stock stays, leftovers that were never listed go — and keep both files on this computer.

**steps**
1. Open the catalog and the warehouse file.
2. Put warehouse stock onto every catalog product.
3. Download one sheet.

**example-note**
The stoneware mug stays on the sheet with a blank On Hand. The leftover that was only in the warehouse never appears.

**fine**
Kitchen is the $19 zip Polar emails. This job runs on this computer. Lite is stack and dedupe only.

---

## 3) Example tables

Human SKUs. Same honesty as live: one catalog product with blank stock; one warehouse-only leftover that must not appear.

**catalog.csv**

| SKU | Product | Price |
| --- | --- | --- |
| TOWEL-01 | Linen tea towel | 18.00 |
| MUG-02 | Stoneware mug | 14.00 |

**warehouse.csv**

| SKU | On Hand | Bin |
| --- | --- | --- |
| TOWEL-01 | 12 | A-1 |
| CRATE-08 | 11 | B-8 |

**Result**

| SKU | Product | Price | On Hand | Bin |
| --- | --- | --- | --- | --- |
| TOWEL-01 | Linen tea towel | 18.00 | 12 | A-1 |
| MUG-02 | Stoneware mug | 14.00 |  |  |

CRATE-08 does not appear. MUG-02 keeps its price; On Hand is blank.

---

## 4) Kitchen recipe metadata

Keep the machine id. A rename is a Kitchen zip bump; the human name carries Monday.

```
id: inventory-sku-join
```

Optional later, only if Till bumps the zip: `monday-stock-on-catalog`.

**name**
Monday stock on the catalog

**description**
Put warehouse counts on every catalog product; blank stock stays; leftovers not in the catalog drop.

---

## 5) Log entry draft (# date TBD)

A client is waiting on a sheet. You are the virtual assistant, the nonprofit ops person, the one-seat bookkeeper. The next screen wants an upload. You cannot put this client's CSV in the cloud.

Monday is putting warehouse stock on every product in the catalog. Every product stays, even if stock is blank. Leftover warehouse rows that were never listed have to go.

That job is on the join page, with a Kitchen recipe — Monday stock on the catalog. Lite stays free: two files, stack, dedupe, export. Kitchen is $19 one-time: Polar emails a zip, work stays on this computer.

CTA stays outside the body: Buy Kitchen · $19. Try Lite.
