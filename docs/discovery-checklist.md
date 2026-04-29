# Phase 0 — Discovery Checklist

Goal: capture **everything** the legacy VB.NET + SQL Server app does today, so nothing gets dropped on cutover.

## A. Application inventory (1–2 hours with your wife)

For each screen in the legacy app, record:

| # | Screen / Window name | What it does (1 line) | Who uses it (Operator / Admin / SuperAdmin) | Saved-to-DB tables (if known) | Pain points (slow? buggy? missing?) |
|---|----------------------|-----------------------|---------------------------------------------|-------------------------------|--------------------------------------|
| 1 |                      |                       |                                             |                               |                                      |

Also list:

- Every printable report (header/columns/filters).
- Every Excel/CSV export the team relies on.
- Any external integration: scanner, label printer, accounting export, email, etc.
- Recurring manual tasks (e.g. "every Friday I close the day").

Save as `docs/discovery-app-inventory.md`.

## B. Database extract

Run [`legacy-schema-extract.sql`](legacy-schema-extract.sql) against the **production** SQL Server (read-only login is fine) and save the output as `docs/legacy-schema.txt`. We need:

- Full table list with row counts.
- All columns with types and nullability.
- All foreign keys.
- All indexes.
- All stored procedures / views (names + definitions).
- Top-5 sample rows from every table (anonymise customer/supplier names if needed).

## C. Backup

- Take a fresh `.bak` backup of the legacy database.
- Store it on an **encrypted** drive (BitLocker on Windows).
- This is the snapshot we develop the ETL against — never touch production.

## D. User & permission audit

- List every Windows / SQL login that touches the system today.
- Note who must become `SuperAdmin` (1 person — the owner), who is `Admin` (managers), who is `Operator` (everyone else).

## E. Sign-off

- Wife confirms inventory is complete.
- Owner confirms role assignments.

When A–E are all checked, Phase 0 is done and Phase 6 (migration) becomes implementable.
