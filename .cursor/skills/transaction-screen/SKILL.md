---
name: transaction-screen
description: Builds Jaza Venus legacy-parity transaction forms — toolbar, editable grid, lookups, credit/overdue confirms. Use for SO, PO, GRN, Invoice, BPB, BBK, AR screens and similar document UIs.
disable-model-invocation: true
---

# Transaction Screen

For master CRUD lists, use `CrudPage` via skill `implement-prd`. This skill covers **document transaction** screens.

## Required components

| Component | Path | Purpose |
|-----------|------|---------|
| `LegacyTransactionToolbar` | `frontend/src/features/common/LegacyTransactionToolbar.tsx` | F-key modes: New, Save, Post, Void, Print, Close |
| `EditableLineGrid` | `frontend/src/features/common/EditableLineGrid.tsx` | Line items with add/delete row |
| `LookupFieldInput` / `LookupDialog` | `frontend/src/features/common/` | Product, customer, supplier pickers |
| `runWithBusinessRuleConfirm` | `frontend/src/features/common/businessRuleFlow.ts` | Credit plafond, overdue blocking |

Docs: [transaction-toolbar-and-shortcuts.md](../../../docs/modules/shared/ui-foundation/transaction-toolbar-and-shortcuts.md), [editable-grid-pattern.md](../../../docs/modules/shared/ui-foundation/editable-grid-pattern.md), [lookup-browse-dialog.md](../../../docs/modules/shared/ui-foundation/lookup-browse-dialog.md).

## Reference pages

Copy patterns from existing wired screens:

- `PurchaseOrderPage.tsx`, `ReceivingEntryPage.tsx`
- `SalesOrderPage.tsx`, `SalesConfirmationPage.tsx`, `InvoicingProcessPage.tsx`
- `InterWarehouseTransactionPage.tsx`, `ArAdjustmentPage.tsx`

## Status-driven UI

| Status | Toolbar behavior |
|--------|------------------|
| Draft | Edit, Save, Post enabled |
| Posted | Edit disabled except New, Print, Close; Void if allowed |
| Voided | Read-only |

Store `Draft` / `Posted` / `Voided` — display via i18n (`invoiceStatus.*`, `documentStatus.*`).

API lifecycle: `POST .../{id}/post`, `POST .../{id}/void` — mirror existing pages.

## Business rule confirms

Before Post/Save when credit or overdue applies:

```typescript
import { runWithBusinessRuleConfirm } from "#/features/common/businessRuleFlow";

await runWithBusinessRuleConfirm(api, "credit-check-endpoint", async () => {
  await api.post(`outbound/sales-orders/${id}/post`);
});
```

Do not bypass confirms unless PRD specifies admin override flow.

## Checklist

- [ ] Toolbar modes match PRD and ui-foundation doc
- [ ] Line grid: product lookup, qty, price, discount, computed total
- [ ] Header fields use lookups where PRD specifies
- [ ] Loading, error, empty states
- [ ] i18n en + id for all labels
- [ ] Permissions gate Post/Void/Delete
- [ ] Vitest for toolbar enablement logic if non-trivial

## Don't

- Build a one-off toolbar — extend `LegacyTransactionToolbar`
- Mix legacy O/B/C enum values with Draft/Posted/Voided in API payloads
- Skip `businessRuleFlow` for SO/Delivery/Invoice credit checks
