# PRD: Invoicing Process

## 1. Summary

Bill customers for delivered goods. Legacy `frmInvoice` / `frmARInvoice` (ObjType 30). Updates customer `Balance` and enables payment collection.

**New route:** `/sales/invoicing-process`  
**Backend:** `Invoice`, `InvoiceLine`, `Payment`  
**Permission:** `sales` module.

## 2. User stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| INV-01 | Operator | Create invoice from delivery | Customer is billed |
| INV-02 | System | Check credit limit against `Balance` | Invoice-stage credit control |
| INV-03 | Operator | Assign Faktur Pajak serial for PKP customers | Tax compliance |
| INV-04 | Operator | Print invoice PDF | Customer receives document |
| INV-05 | Operator | Record payment against invoice | A/R is collected |

## 3. Business rules

1. Pull from Delivery (BaseType 28); qty ≤ delivered − already invoiced.
2. On post: increment customer AR balance; status → Posted.
3. Credit check uses `Balance` field.
4. **Tax serial:** For PKP address, allocate from `TaxRegistration` pool (see tax PRD).
5. Payment methods: Cash, Transfer, Check/Giro, Others, Return offset, Adjustment.
6. Void (SuperAdmin): reverse AR impact; status → Voided.

## 4. API (existing)

| Method | Path | Status |
|--------|------|--------|
| GET/POST | `/api/invoices` | Implemented |
| POST | `/api/invoices/{id}/post` | Implemented |
| POST | `/api/invoices/{id}/void` | Implemented (SuperAdmin) |
| GET | `/api/invoices/{id}/pdf` | Implemented |
| POST | `/api/invoices/{id}/payments` | Implemented |

**Gaps:** Pull-from-delivery UI, Faktur serial, credit/overdue, batch payment receipt.

## 5. Frontend

- `InvoicingProcessPage` — UI shell
- `InvoicesPage` — API-backed CrudPage **not routed** (wire-up needed)

## 6. Acceptance criteria

- [ ] Create invoice from delivery with correct totals
- [ ] Post updates customer balance
- [ ] PDF matches legacy layout (or approved new layout)
- [ ] Faktur serial assigned for PKP customers
- [ ] Payment reduces outstanding amount

---

## 7. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Invoicing Process | `/sales/invoicing-process` | Create/post invoices from delivery |

---

## 8. UI Behavior

### Toolbar — mode `transaction`

- [ ] **F4** Browse `invoices`; **F5** Print PDF (`GET /api/invoices/{id}/pdf`)

### Header lookups

| Field | Lookup type |
|-------|-------------|
| Source Delivery | `delivery-orders` |
| Customer | `customers` |
| Faktur Pajak | `tax-registrations` (PKP only) |

### Line grid

- [ ] Pull from delivery lines; qty ≤ delivered − invoiced
- [ ] Tax serial field on header when customer is PKP
- [ ] Payment panel (optional tab): Cash/Transfer/Giro allocation — links to Payment Receipt PRD

### Dialogs

- [ ] Credit limit (`Balance`) Yes/No/Cancel
- [ ] Void confirm (SuperAdmin only)

---

## 9. Permissions

| Action | Roles |
|--------|-------|
| Create/edit draft | Sales edit+ |
| Post | Admin+ |
| Void | SuperAdmin |

---

## 10. Localization keys

Namespace: `sales.invoicing.*`

| Key | id | en |
|-----|-----|-----|
| `sales.invoicing.title` | Proses Faktur | Invoicing Process |
| `sales.invoicing.fakturPajak` | Faktur Pajak | Tax Invoice |
| `sales.invoicing.pullFromDo` | Ambil dari Surat Jalan | Pull from Delivery |

---

## 11. How This Matches Existing Patterns

Foundation PRDs; `InvoicingProcessPage` in `src/features/sales/`.
