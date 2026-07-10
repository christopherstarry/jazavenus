# PRD: Payment Receipt

## Summary

Full batch payment receipt screen matching legacy `frmPaymentReceipt`. Supports six allocation types: Cash, Transfer, Check/Giro (PDC), Others, Return offset, and AR Adjustment. Broader than [bank-transfer.md](bank-transfer.md).

**Legacy reference:** `frmPaymentReceipt.frm`, `ReceiptDetail1/2` tables.

**Route:** `/ar/payment-receipt` (add to `modules.tsx`)  
**Permission:** `ar` module.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Payment Receipt | `/ar/payment-receipt` | Record customer payments with multi-invoice allocation |

---

## Data Model

```ts
interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  customerId: string;
  division: string;
  totalAmount: number;
  cashApplied: number;
  transferApplied: number;
  checkApplied: number;
  othersApplied: number;
  returnApplied: number;
  adjustmentApplied: number;
  lines: PaymentAllocationLine[];
  pdcLines: PostDatedCheckLine[];
}

interface PaymentAllocationLine {
  invoiceId: string;
  invoiceNumber: string;
  outstanding: number;
  cashApplied: number;
  transferApplied: number;
  checkApplied: number;
  othersApplied: number;
  returnApplied: number;
  adjustmentApplied: number;
}

interface PostDatedCheckLine {
  checkNumber: string;
  bankId: string;
  checkDate: string;
  amount: number;
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/ar/payment-receipts` | List |
| POST | `/api/ar/payment-receipts` | Create |
| GET | `/api/ar/payment-receipts/{id}` | Detail |
| POST | `/api/ar/payment-receipts/{id}/post` | Post receipt |
| GET | `/api/ar/customers/{id}/open-invoices` | Allocation source |

---

## UI Behavior

### Toolbar â€” mode `transaction`

- [ ] **F1** New, **F2** Save, **F4** Browse `payments`, **Esc** Close
- [ ] See [transaction-toolbar-and-shortcuts.md](../../shared/ui-foundation/transaction-toolbar-and-shortcuts.md)

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Customer | `customers` |
| Collector | `collectors` |

### Allocation grid (open invoices)

- [ ] Load on customer select
- [ ] Columns per allocation type: Cash, Transfer, Giro, Others, Return, Adjustment
- [ ] Row totals must not exceed invoice outstanding
- [ ] Header totals = sum of column allocations

### PDC sub-grid

- [ ] Add giro rows: Check #, Bank (`banks` lookup), Date, Amount
- [ ] Giro total must match Check column total in allocation grid

### Dialogs

- [ ] Over-allocation validation error
- [ ] Post confirm; success toast

---

## Permissions

| Role | Create | Post |
|------|--------|------|
| AR edit | Yes | No |
| Admin+ | Yes | Yes |

---

## Localization keys

Namespace: `ar.paymentReceipt.*`

| Key | id | en |
|-----|-----|-----|
| `ar.paymentReceipt.title` | Penerimaan Pembayaran | Payment Receipt |
| `ar.paymentReceipt.cash` | Tunai | Cash |
| `ar.paymentReceipt.transfer` | Transfer | Transfer |
| `ar.paymentReceipt.giro` | Giro | PDC / Giro |
| `ar.paymentReceipt.returnOffset` | Potong Retur | Return Offset |

---

## How This Matches Existing Patterns

- [lookup-browse-dialog.md](../../shared/ui-foundation/lookup-browse-dialog.md)
- [editable-grid-pattern.md](../../shared/ui-foundation/editable-grid-pattern.md) for PDC lines
- [dialog-patterns.md](../../shared/ui-foundation/dialog-patterns.md)
- Subsumes [bank-transfer.md](bank-transfer.md) transfer-only flow

---

## Acceptance Criteria

1. All six allocation types work in one receipt
2. PDC lines register outstanding giro for clearance
3. Post updates invoice paid amounts and customer balance
4. UI matches legacy `frmPaymentReceipt` field layout
