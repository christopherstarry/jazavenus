# Permissions — Who Can See What

This page explains how to think about giving people access. If you have to decide "should Didi see Master Maintenance?", read this.

## The two layers

Every user has:

- **One role** (Sales / Admin / SuperAdmin / Developer) — the broad bucket.
- Optional **per-user permissions** that override the bucket — the fine-grained controls.

When the API loads a user, it computes their *resolved permissions* (the answer to "what can they actually open?") in this priority order:

1. **Developer?** → full access, including error logs and dev tools. Stop here.
2. **SuperAdmin without custom permissions?** → full access to every business module and every report (no error logs). Stop here.
3. **Has custom permissions turned on?** → only the modules and reports explicitly ticked for them.
4. **Otherwise** → fallback. They get **edit access to Sales** and **no reports**.

The frontend uses the same logic in `frontend/src/lib/auth.tsx` so the sidebar exactly matches what the API will allow.

## What "module" means

There are five top-level modules. They line up with the sidebar groups:

| Module        | What it covers                                                                |
| ------------- | ----------------------------------------------------------------------------- |
| **master**    | Customers, products, suppliers, banks, terms of payment, warehouses, salesmen, …  |
| **purchase**  | Purchase orders, receiving, returns to suppliers.                              |
| **sales**     | Sales orders, sales confirmation, invoicing, sales returns.                    |
| **inventory** | Stock movements, stock takes, planning, BPB / BBK / inter-warehouse.          |
| **ar**        | Accounts receivable: bank transfers, PDC, ageing.                              |

For each module the user can have:

- **edit** — they can create and update records (the default).
- **delete** — they can also delete (must be granted explicitly).

If a user has **neither** edit nor delete on a module, they don't see it in the sidebar at all.

## What "report" means

Four buckets of reports:

| Report bucket | What it covers                                                                       |
| ------------- | ------------------------------------------------------------------------------------ |
| **sales**     | Daily / monthly / yearly sales, gross margin, customer-by-CA, sales-return analysis. |
| **inventory** | Stock position, stock mutation, opname, BPB / BBK reports.                           |
| **purchase**  | Purchase reports, daily purchase, service level.                                     |
| **ar**        | Outstanding invoices, collection, DOAR, outstanding PDC.                             |

A user either sees the bucket (and all the reports inside) or they don't. We don't grant individual reports — too granular for the team's needs today.

## Worked examples

**Didi** is the warehouse lead.
- Role: **Admin**.
- Custom permissions: ✅
- Modules: master (edit), purchase (edit + delete), sales (edit + delete).
- Reports: a/r.
- Result: Sidebar shows Master, Purchase, Sales, plus the A/R reports group. He cannot open Inventory or A/R modules. He cannot see Sales reports or Inventory reports.

**Adin** is a sales rep.
- Role: **Sales**.
- Custom permissions: ❌ (left default).
- Result: Sidebar shows only Sales. No reports at all. (The system applies the fallback rule.)

**Robby** is a senior sales rep with light reporting access.
- Role: **Sales**.
- Custom permissions: ✅
- Modules: sales (edit).
- Reports: sales, a/r.
- Result: Sidebar shows Sales (transactions) and Reports → Sales / A/R. No Master, no Purchase, no Inventory.

**Owner** uses a SuperAdmin login and has not turned on custom permissions.
- Result: Sidebar shows everything except the error log.

**You** are the Developer.
- Result: Sidebar shows everything, including the error log and any dev-only diagnostics.

## How to set this up

Today the JSON-shaped API exists at `PUT /api/users/{userId}/permissions`. The UI for editing this lives at `/admin/users` and is on the immediate roadmap. Until the UI is shipped, talk to a developer to set it via the API. After it ships, the screen will be a simple matrix:

```
                 master  purchase  sales  inventory  ar
[ ] custom?
        edit       []      [x]     [x]      []      []
        delete     []      []      [x]      []      []

reports: [x] sales   [ ] inventory   [ ] purchase   [x] a/r
```

Tick the boxes you want, click **Save**. The system rotates the user's `SecurityVersion` so any cached permissions on their other devices are refreshed within a minute.

## Common operations

**A user is leaving the company.** SuperAdmin → Manage Users → set them to **Inactive**. Their access stops on the next API request from any of their devices.

**A user joins the company.** SuperAdmin → Manage Users → **New user**. Set role + permissions + initial password. Tell them the password in person; the system marks `MustChangePassword = true` so they pick their own next.

**A user is promoted from Sales to Admin.** Two clicks: change the role; if you also want custom permissions, tick them. Click Save. They get re-prompted to sign in (we rotate `SecurityVersion`).

## What's NOT in this model

- We do **not** support row-level filters ("Adin can only see customers in Java"). Today everyone with a module sees all rows in that module.
- We do **not** have read-only / view-only access. If you have the module, you can edit. (Delete is a separate flag.)
- We do **not** have time-bound permissions ("temp access for 7 days"). The simplest workaround is granting it now and revoking it later by hand.
- We do **not** support groups (e.g. "Marketing team" → grant once, applies to many). Permissions are per-user. With 20-ish users this is manageable; if it grows, the data model already supports moving to a group abstraction later.

If any of those become important, raise it with the Developer and we'll cost the change.
