# Inbound module — `/api/inbound`

Purchase orders, goods receipt notes (GRN), and purchase returns.

**Auth policy:** `RequireOperator` + `RequireModule("purchase")`. PO create/update/post requires `RequireAdmin`. GRN create/update/post available to Operator+.

**Controllers:** `InboundController`, `PurchaseReturnsController`

---

## Route table — InboundController

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/inbound/purchase-orders` | — |
| GET | `/api/inbound/purchase-orders/{id}` | — |
| POST | `/api/inbound/purchase-orders` | Admin |
| PUT | `/api/inbound/purchase-orders/{id}` | Admin (draft only) |
| POST | `/api/inbound/purchase-orders/{id}/post` | Admin |
| GET | `/api/inbound/grns` | — |
| GET | `/api/inbound/grns/{id}` | — |
| POST | `/api/inbound/grns` | Operator |
| PUT | `/api/inbound/grns/{id}` | Operator (draft only) |
| POST | `/api/inbound/grns/{id}/post` | Operator |

## Route table — PurchaseReturnsController

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/inbound/purchase-returns`, `/{id}` | — |
| POST | `/api/inbound/purchase-returns` | Operator |
| PUT | `/api/inbound/purchase-returns/{id}` | Operator (draft) |
| POST | `/api/inbound/purchase-returns/{id}/post` | Admin |

---

## Happy path — create purchase order

```bash
curl -s -X POST https://localhost:5001/api/inbound/purchase-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Division: DISTRIBUTIONBDG" \
  -d '{
    "supplierId": "019dfb7d-0001-7000-8000-000000000001",
    "warehouseId": "019dfb7d-0002-7000-8000-000000000002",
    "orderDate": "2026-07-10T00:00:00Z",
    "expectedDate": "2026-07-15T00:00:00Z",
    "currency": "IDR",
    "notes": "Weekly replenishment",
    "lines": [
      {
        "lineNumber": 1,
        "itemId": "019dfb7d-0003-7000-8000-000000000003",
        "quantity": 100,
        "unitPrice": 12500,
        "discountPercent": 0,
        "taxPercent": 11
      }
    ]
  }'
```

```json
{
  "id": "019dfb82c-3333-7000-8000-000000000060",
  "number": "PO-2026-0042",
  "status": "Draft",
  "supplierId": "019dfb7d-0001-7000-8000-000000000001",
  "supplierName": "PT Supplier Jaya",
  "warehouseId": "019dfb7d-0002-7000-8000-000000000002",
  "warehouseCode": "WH-BDG-01",
  "orderDate": "2026-07-10T00:00:00Z",
  "currency": "IDR",
  "grandTotal": 1387500,
  "lines": [
    {
      "lineNumber": 1,
      "itemId": "019dfb7d-0003-7000-8000-000000000003",
      "itemSku": "SKU-001",
      "quantity": 100,
      "unitPrice": 12500,
      "quantityReceived": 0,
      "quantityOpen": 100
    }
  ]
}
```

---

## Error example — post already posted PO (400) / concurrency (409)

Posting a non-draft document returns **400**:

```json
{
  "type": "https://httpstatuses.io/400",
  "title": "Business rule violated",
  "status": 400,
  "detail": "Only draft POs can be posted."
}
```

Concurrent update while another user posts the same PO:

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Concurrency conflict",
  "status": 409,
  "detail": "The record was modified by another user.",
  "instance": "/api/inbound/purchase-orders/019dfb82c-3333-7000-8000-000000000060/post"
}
```

---

## See also

- [outbound.md](outbound.md) — sales chain
- [inventory.md](inventory.md) — BPB stock receipts
