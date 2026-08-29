# Plainrow

A one-file, offline CSV kitchen. Open the HTML file in Chrome, Edge,
Firefox, or Safari. Files stay on the machine. No install. No upload.

## What you get

| File | Role |
|---|---|
| `plainrow.html` | Paid Kitchen. Merge, join, split, clean. Cap: about 200,000 rows or 40 MB. |
| `plainrow-lite.html` | Free lite. Same tools. Cap: 2 files and 500 rows. |
| `recipes/` | Six Monday-job recipes (JSON). Load them from the app. |
| `samples/` | Tiny synthetic Stripe, PayPal, and bank CSVs for a dry run. |
| `LICENSE.txt` | Personal + one-seat commercial. No redistribution. |
| `PRIVACY.txt` | No telemetry. Files never leave the machine. |
| `REFUND.txt` | 14-day no-questions refund on the paid Kitchen. |

## Open it

Point the browser at the file. No server:

    file:///workspace/plainrow/plainrow.html

On your machine that is wherever you saved the folder, for example
`file:///Users/you/Downloads/plainrow/plainrow.html`.

1. Double-click `plainrow.html` (or the lite file), or open it with Chrome, Edge, Firefox, or Safari.
2. Drop CSV files, or use **Open CSV**.
3. Or pick a synthetic demo from the menu.
4. Pick a tool. Preview updates in place.
5. **Export CSV** writes a file to your downloads folder.

Works offline. There is no CDN and no remote script.

## Tools

- **Stack** — concatenate tables; columns are unioned
- **Join** — key-join two tables (inner, left, right, or full)
- **Split** — one table per distinct value in a column
- **Dedupe** — keep the first row per key column(s)
- **Filter** — keep or drop rows by a column test
- **Rename / reorder** — column names and order
- **Find & replace** — one column or all columns
- **Dates** — normalize common date strings to `YYYY-MM-DD`
- **Sort** — click a header, or use Sort
- **Clean** — trim, drop empty rows or columns
- **Import / export** — CSV (comma, tab, or semicolon in; comma out). Optional Excel BOM

Hard cap (Kitchen): about **200,000 rows** or **40 MB** in memory.
Lite: **2 files** and **500 rows**. Over the cap, you get a clear
error. Nothing is silently truncated.

## Recipes

Load a JSON file from `recipes/` with **Load recipe**. The recipe
renames and runs steps against tables whose names contain the
`fileMatch` text (case-insensitive).

| Recipe | Monday job |
|---|---|
| `stripe-paypal-bank.json` | Stack Stripe + PayPal + bank exports into one ledger |
| `email-dedupe.json` | Lowercase emails and drop duplicate addresses |
| `survey-cleaner.json` | Rename, trim empties, normalize dates |
| `inventory-sku-join.json` | Join two inventory files on SKU |
| `donation-merge.json` | Stack two donation exports |
| `timesheet-stack.json` | Stack weekly timesheets |

Demo data inside the app uses the same column names as these
recipes and as `samples/*.csv`.

## Samples

`samples/stripe.csv`, `samples/paypal.csv`, and `samples/bank.csv`
are tiny and fake. They are for trying **Stack** and the first
recipe. Do not treat them as real money movement.

## License

Personal use and one licensed seat of commercial use (including
client files). You may not redistribute the app. See `LICENSE.txt`.

## Privacy

The app does not send telemetry. Files never leave the machine.
See `PRIVACY.txt`.
