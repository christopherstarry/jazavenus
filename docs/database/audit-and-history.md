# Audit and Activity History

**Date:** 2026-07-10  
**Table:** `AuditLogs` (physical PascalCase; canonical `audit_logs`)

---

## Overview

Every change to an `Entity` subclass is logged automatically by `AuditSaveChangesInterceptor`. Auth events (login, MFA, password) are logged explicitly from `AuthController`. Post and Void document actions are detected when `Status` transitions to `Posted` or `Voided`.

**Access:** SuperAdmin and Developer only (`RequireSuperAdmin` policy includes both).

**UI:** `/system/audit-history` â€” `AuditHistoryPage.tsx`

---

## AuditLog schema

| Column | Type | Purpose |
|--------|------|---------|
| `Id` | uuid | Primary key |
| `OccurredAtUtc` | timestamptz | When the action happened |
| `UserId` | uuid? | Actor |
| `UserName` | varchar | Denormalized display name |
| `IpAddress` | varchar? | Request IP |
| `UserAgent` | varchar? | Browser agent |
| `Action` | varchar(64) | See actions below |
| `Entity` | varchar(64) | C# entity name (`SalesOrder`, `Item`, â€¦) |
| `EntityId` | uuid? | Affected record ID |
| `EntityCode` | varchar(64)? | Document number or code at write time |
| `Module` | varchar(32)? | `master`, `purchase`, `sales`, `inventory`, `ar`, `system` |
| `ChangesJson` | text? | Field-level diff array for updates |
| `BeforeJson` | text? | Full snapshot before change |
| `AfterJson` | text? | Full snapshot after change |
| `Notes` | text? | Free-text (auth failures, etc.) |

### Actions

| Action | When |
|--------|------|
| `Create` | New entity inserted |
| `Update` | Entity modified (non-status-only) |
| `Delete` | Soft-delete (`IsDeleted = true`) |
| `Post` | `Status` â†’ `Posted` on a document |
| `Void` | `Status` â†’ `Voided` |
| `Login.Success` / `Login.Failed` / `Login.Locked` | Auth events |
| `Logout`, `Password.Changed`, `MFA.Enabled` | Security events |

### ChangesJson format

```json
[
  { "Field": "Quantity", "OldValue": "10", "NewValue": "12" },
  { "Field": "UnitPrice", "OldValue": "50000", "NewValue": "48000" }
]
```

PRD originally specified a `changes` JSONB array â€” implemented as `ChangesJson` on `AuditLogs`, with `BeforeJson`/`AfterJson` retained for full snapshots.

---

## Soft delete behavior

Hard `Remove()` calls are intercepted: the row stays in place with `IsDeleted = true`, and a **Delete** audit row is written. This matches master-data delete UX and preserves referential integrity.

---

## Module mapping

Resolved in `AuditMetadata.EntityModules` by entity type name:

| Module | Entities |
|--------|----------|
| `master` | Customer, Item, Supplier, Brand, â€¦ |
| `purchase` | PurchaseOrder, GoodsReceiptNote, PurchaseReturn, â€¦ |
| `sales` | SalesOrder, DeliveryOrder, Invoice, SalesReturn, CreditMemo, â€¦ |
| `inventory` | StockMovement, StockOnHand, StockReceipt, StockTransfer, â€¦ |
| `ar` | Payment, PaymentAllocation, PostDatedCheck, ArAdjustment, â€¦ |
| `system` | CompanySettings, FiscalPeriod, User auth events |

---

## API

`GET /api/audit-logs`

| Query | Description |
|-------|-------------|
| `entity` | Display key (`sales_order`, `product`, â€¦) |
| `entityId` | Filter by record UUID |
| `action` | `Create`, `Update`, `Delete`, `Post`, `Void` |
| `module` | `master`, `purchase`, `sales`, â€¦ |
| `search` | User name, entity code, or notes (case-insensitive) |
| `from` / `to` | Date range (UTC) |
| `page` / `pageSize` | Pagination |

Default action filter includes `Post` and `Void` (not auth events unless explicitly filtered).

---

## Indexes

```sql
CREATE INDEX "IX_AuditLogs_OccurredAtUtc" ON "AuditLogs" ("OccurredAtUtc");
CREATE INDEX "IX_AuditLogs_Entity_EntityId" ON "AuditLogs" ("Entity", "EntityId");
CREATE INDEX "IX_AuditLogs_EntityCode" ON "AuditLogs" ("EntityCode");
CREATE INDEX "IX_AuditLogs_Module_OccurredAtUtc" ON "AuditLogs" ("Module", "OccurredAtUtc");
CREATE INDEX "IX_AuditLogs_UserId_OccurredAtUtc" ON "AuditLogs" ("UserId", "OccurredAtUtc");
```

---

## Example queries

**Recent PO edits:**

```sql
SELECT "OccurredAtUtc", "UserName", "Action", "EntityCode"
FROM "AuditLogs"
WHERE "Entity" = 'PurchaseOrder'
  AND "Action" IN ('Create', 'Update', 'Delete', 'Post')
ORDER BY "OccurredAtUtc" DESC
LIMIT 50;
```

**Worker activity today:**

```sql
SELECT "UserName", "Module", "Action", COUNT(*)
FROM "AuditLogs"
WHERE "OccurredAtUtc" >= CURRENT_DATE
GROUP BY 1, 2, 3
ORDER BY 4 DESC;
```

---

## Localization

- Stored values are **language-neutral codes** (`Posted`, not "Terbuka").
- Activity History labels use the viewer's `UserPreferences.Language` via frontend i18n.
- Business data in `BeforeJson`/`AfterJson` is shown as entered (customer names, notes).

---

## IActionAuditService

Explicit logging for actions that do not map to entity CRUD:

```csharp
await actionAudit.LogAsync("Login.Success", "User", userId, entityCode: email, module: "system");
```

Registered in DI as scoped `ActionAuditService`. Auth controller writes directly to `AuditLogs` for resilience (errors swallowed with log).

---

## Related

- [modules/master-data/prds/audit-history.md](../modules/master-data/prds/audit-history.md)
- [implementation-status.md](implementation-status.md)
- [naming-conventions.md](naming-conventions.md)
