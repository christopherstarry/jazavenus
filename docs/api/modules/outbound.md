# Outbound module — `/api/outbound`

Sales orders, delivery orders, and sales returns.

**Auth policy:** `RequireOperator` + `RequireModule("sales")`. SO post requires `RequireAdmin`.

**Controllers:** `OutboundController`, `SalesReturnsController`

---

## Route table — OutboundController

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/outbound/sales-orders` | — |
| GET | `/api/outbound/sales-orders/{id}` | — |
| POST | `/api/outbound/sales-orders` | Operator (credit check) |
| PUT | `/api/outbound/sales-orders/{id}` | Operator (draft) |
| POST | `/api/outbound/sales-orders/{id}/post` | Admin |
| GET | `/api/outbound/delivery-orders` | — |
| GET | `/api/outbound/delivery-orders/{id}` | — |
| POST | `/api/outbound/delivery-orders` | Operator |
| PUT | `/api/outbound/delivery-orders/{id}` | Operator (draft) |
| POST | `/api/outbound/delivery-orders/{id}/post` | Operator |

## Route table — SalesReturnsController

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/outbound/sales-returns`, `/{id}` | — |
| POST | `/api/outbound/sales-returns` | Operator |
| PUT | `/api/outbound/sales-returns/{id}` | Operator (draft) |
| POST | `/api/outbound/sales-returns/{id}/post` | Admin |

---

## Happy path — create sales order

```bash
curl -s -X POST https://localhost:5001/api/outbound/sales-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Division: DISTRIBUTIONBDG" \
  -d '{
    "customerId": "019dfb81b-2222-7000-8000-000000000050",
    "warehouseId": "019dfb7d-0002-7000-8000-000000000002",
    "orderDate": "2026-07-10T00:00:00Z",
    "currency": "IDR",
    "lines": [
      {
        "lineNumber": 1,
        "itemId": "019dfb7d-0003-7000-8000-000000000003",
        "quantity": 24,
        "unitPrice": 15000,
        "discountPercent": 5
      }
    ]
  }'
```

```json
{
  "id": "019dfb83d-4444-7000-8000-000000000070",
  "number": "SO-2026-0105",
  "status": "Draft",
  "customerId": "019dfb81b-2222-7000-8000-000000000050",
  "customerName": "Toko Makmur",
  "grandTotal": 342000,
  "lines": [
    {
      "lineNumber": 1,
      "itemSku": "SKU-001",
      "quantity": 24,
      "unitPrice": 15000,
      "quantityDelivered": 0,
      "quantityOpen": 24
    }
  ]
}
```

---

## Error example — post return conflict (409)

Sales return post when invoice already credited for the same lines:

```bash
curl -s -X POST "https://localhost:5001/api/outbound/sales-returns/$ID/post" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-XSRF-TOKEN: $XSRF"
```

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Business rule violated",
  "status": 409,
  "detail": "Return quantity exceeds deliverable quantity on linked delivery order.",
  "instance": "/api/outbound/sales-returns/019dfb83e-5555-7000-8000-000000000071/post"
}
```

---

## See also

- [invoicing.md](invoicing.md)
- [pricing.md](lookup.md#pricing) — price resolution
