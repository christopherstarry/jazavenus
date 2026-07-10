# Invoicing module — `/api/invoices`

Tax invoices, credit memos, PDF export, and invoice-level payments.

**Auth policy:** `RequireOperator` + `RequireModule("ar")`. Post requires Admin; void requires SuperAdmin.

**Controllers:** `InvoicingController`, `CreditMemosController`

---

## Route table — InvoicingController

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/invoices` | — |
| GET | `/api/invoices/{id}` | — |
| POST | `/api/invoices` | Operator |
| PUT | `/api/invoices/{id}` | Operator (draft) |
| POST | `/api/invoices/{id}/post` | Admin |
| POST | `/api/invoices/{id}/void` | SuperAdmin |
| GET | `/api/invoices/{id}/pdf` | Operator |
| POST | `/api/invoices/{id}/payments` | Operator |

## Route table — CreditMemosController

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/invoices/credit-memos`, `/{id}` | — |
| POST | `/api/invoices/credit-memos` | Operator |
| PUT | `/api/invoices/credit-memos/{id}` | Operator (draft) |
| POST | `/api/invoices/credit-memos/{id}/post` | Admin |

---

## Happy path — create draft invoice

```bash
curl -s -X POST https://localhost:5001/api/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Division: DISTRIBUTIONBDG" \
  -d '{
    "customerId": "019dfb81b-2222-7000-8000-000000000050",
    "deliveryOrderId": "019dfb84e-6666-7000-8000-000000000080",
    "invoiceDate": "2026-07-10T00:00:00Z",
    "currency": "IDR",
    "lines": [
      {
        "lineNumber": 1,
        "itemId": "019dfb7d-0003-7000-8000-000000000003",
        "quantity": 24,
        "unitPrice": 15000,
        "discountPercent": 5,
        "taxPercent": 11
      }
    ]
  }'
```

```json
{
  "id": "019dfb85f-7777-7000-8000-000000000090",
  "number": "INV-2026-0201",
  "status": "Draft",
  "customerId": "019dfb81b-2222-7000-8000-000000000050",
  "taxSerialNo": null,
  "grandTotal": 379764,
  "amountPaid": 0,
  "amountDue": 379764
}
```

---

## Error example — tax serial already used (409)

Posting when the allocated Faktur serial was consumed by a concurrent invoice post:

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Conflict",
  "status": 409,
  "detail": "Tax serial 010.000-26.00000001 is no longer available.",
  "instance": "/api/invoices/019dfb85f-7777-7000-8000-000000000090/post"
}
```

---

## See also

- [ar.md](ar.md) — batch payments and PDC
- [tax.md](tax.md) — Faktur serial pool
