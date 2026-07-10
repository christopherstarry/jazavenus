# Inventory module — `/api/inventory`, `/api/stock`

Stock on-hand, adjustments, BPB/BBK documents, transfers, and stock take.

**Auth policy:** `RequireOperator` + `RequireModule("inventory")`. Adjustments and document post require Admin.

**Controllers:** `StockController`, `InventoryDocumentsController`, `StockTakeController`

---

## Route table — StockController

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/stock/on-hand` | — |
| POST | `/api/stock/adjustments` | Admin |

## Route table — InventoryDocumentsController

| Resource | GET list | GET id | POST | PUT | POST post |
|----------|----------|--------|------|-----|-----------|
| Stock receipts (BPB) | `/api/inventory/stock-receipts` | `/{id}` | ✓ | draft | Admin |
| Stock issues (BBK) | `/api/inventory/stock-issues` | `/{id}` | ✓ | draft | Admin |
| Stock transfers | `/api/inventory/stock-transfers` | `/{id}` | ✓ | draft | Admin |

## Route table — StockTakeController

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/inventory/stock-takes`, `/{id}` | — |
| POST | `/api/inventory/stock-takes/prep` | Operator |
| PUT | `/api/inventory/stock-takes/{id}/lines` | Operator |
| POST | `/api/inventory/stock-takes/{id}/post` | Admin |

---

## Happy path — stock on-hand query

```bash
curl -s "https://localhost:5001/api/stock/on-hand?warehouseId=019dfb7d-0002-7000-8000-000000000002&page=1&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "items": [
    {
      "itemId": "019dfb7d-0003-7000-8000-000000000003",
      "itemSku": "SKU-001",
      "itemName": "Product A",
      "warehouseId": "019dfb7d-0002-7000-8000-000000000002",
      "quantityOnHand": 176,
      "quantityCommitted": 24,
      "quantityAvailable": 152
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}
```

---

## Error example — adjustment would go negative (409)

```bash
curl -s -X POST https://localhost:5001/api/stock/adjustments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "warehouseId": "019dfb7d-0002-7000-8000-000000000002",
    "itemId": "019dfb7d-0003-7000-8000-000000000003",
    "quantityDelta": -500,
    "reason": "Physical count correction"
  }'
```

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Business rule violated",
  "status": 409,
  "detail": "Adjustment would result in negative stock for SKU-001 in WH-BDG-01.",
  "instance": "/api/stock/adjustments"
}
```

---

## See also

- [inbound.md](inbound.md) — GRN stock in
- [outbound.md](outbound.md) — DO stock out
