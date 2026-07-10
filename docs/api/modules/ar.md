# Accounts receivable module — `/api/ar`

Batch payment receipts, AR adjustments, post-dated cheques (PDC), and period closing.

**Auth policy:** `RequireOperator` + `RequireModule("ar")`. Posting/clearing/delete operations typically require Admin.

**Controllers:** `ArPaymentsController`, `ArAdjustmentsController`, `ArClosingController`, `PdcController`

---

## Route table

| Method | Path | Write policy | Notes |
|--------|------|--------------|-------|
| POST | `/api/ar/payments` | Operator | Batch payment + allocations |
| GET | `/api/ar/adjustments` | — | List adjustments |
| GET | `/api/ar/adjustments/{id}` | — | Detail |
| POST | `/api/ar/adjustments` | Operator | Create draft |
| PUT | `/api/ar/adjustments/{id}` | Operator | Update draft |
| POST | `/api/ar/adjustments/{id}/post` | Admin | Post adjustment |
| DELETE | `/api/ar/adjustments/{id}` | Admin | Delete draft |
| POST | `/api/ar/close-period` | Admin | Close AR period |
| POST | `/api/ar/recalculate-balance` | Admin | Recalculate balances |
| GET | `/api/ar/pdc` | — | List PDC |
| GET | `/api/ar/pdc/{id}` | — | PDC detail |
| POST | `/api/ar/pdc` | Operator | Create PDC |
| PUT | `/api/ar/pdc/{id}` | Operator | Update PDC |
| DELETE | `/api/ar/pdc/{id}` | Admin | Delete PDC |
| POST | `/api/ar/pdc/{id}/clear` | Admin | Clear cheque |
| POST | `/api/ar/pdc/{id}/cancel-clearance` | Admin | Cancel clearance |

Invoice-level payments: `POST /api/invoices/{id}/payments` (see [invoicing.md](invoicing.md)).

---

## Happy path — batch payment

```bash
curl -s -X POST https://localhost:5001/api/ar/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Division: DISTRIBUTIONBDG" \
  -d '{
    "customerId": "019dfb81b-2222-7000-8000-000000000050",
    "receivedAt": "2026-07-10T14:00:00Z",
    "method": "Transfer",
    "currency": "IDR",
    "reference": "TRF-20260710-001",
    "allocations": [
      {
        "invoiceId": "019dfb85f-7777-7000-8000-000000000090",
        "amount": 379764,
        "notes": "Full settlement"
      }
    ]
  }'
```

```json
{
  "receiptId": "019dfb86a-8888-7000-8000-000000000100",
  "receiptNumber": "RCP-2026-0150",
  "totalAmount": 379764,
  "allocations": [
    {
      "invoiceId": "019dfb85f-7777-7000-8000-000000000090",
      "invoiceNumber": "INV-2026-0201",
      "amount": 379764,
      "remainingDue": 0
    }
  ]
}
```

---

## Error example — over-allocation (409)

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Business rule violated",
  "status": 409,
  "detail": "Allocation amount exceeds open balance on invoice INV-2026-0201.",
  "instance": "/api/ar/payments"
}
```

---

## See also

- [invoicing.md](invoicing.md)
- [reports.md](reports.md) — AR aging reports
