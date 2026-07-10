# PRD: A/R Adjustment

## Summary

Manual A/R balance adjustments per customer. Legacy `FrmAdjustmentAR` — debit/credit corrections without invoice document.

**Route:** `/ar/ar-adjustment` (add to `modules.tsx`)  
**Permission:** `ar` module, Admin+.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| A/R Adjustment | `/ar/ar-adjustment` | Post debit/credit to customer balance |

---

## Data Model

```ts
interface ArAdjustment {
  id: string;
  adjustmentNumber: string;
  adjustmentDate: string;
  customerId: string;
  division: string;
  amount: number;           // positive = debit, negative = credit
  adjustmentType: "debit" | "credit";
  reason: string;
  status: "draft" | "posted";
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/ar/adjustments` | List |
| POST | `/api/ar/adjustments` | Create |
| POST | `/api/ar/adjustments/{id}/post` | Post adjustment |

---

## UI Behavior

### Toolbar — mode `transaction`

- [ ] **F1** New, **F2** Save, **F4** Browse adjustments, **Esc** Close

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Customer | `customers` |
| Adjustment type | native select (Debit/Credit) |

### Form (no line grid)

- [ ] Amount numeric field
- [ ] Reason textarea required
- [ ] Current balance display (read-only) after customer select

### Dialogs

- [ ] Post confirm showing balance impact
- [ ] Block if AR period closed

---

## Permissions

Admin+ only.

---

## Localization keys

Namespace: `ar.adjustment.*`

| Key | id | en |
|-----|-----|-----|
| `ar.adjustment.title` | Penyesuaian Piutang | A/R Adjustment |
| `ar.adjustment.debit` | Debit | Debit |
| `ar.adjustment.credit` | Kredit | Credit |
| `ar.adjustment.reason` | Keterangan | Reason |

---

## How This Matches Existing Patterns

Foundation PRDs; allocation type also used in [payment-receipt.md](payment-receipt.md).

---

## Acceptance Criteria

1. Debit increases customer balance; credit decreases
2. Posted adjustments appear in AR reports
3. Audit trail captured
