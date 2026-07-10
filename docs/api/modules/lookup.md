# Lookup & pricing — `/api/lookup`, `/api/pricing`

Typeahead lookup search and customer/item price resolution.

**Auth policy:** `RequireOperator` + module permission (`master` for lookup, `sales` for pricing).

**Controllers:** `LookupController`, `PricingController`

---

## Route table — LookupController

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/lookup/types` | Supported lookup type names |
| GET | `/api/lookup/{type}` | Search — query params: `q`, `page`, `pageSize`, filters per type |

Common types: `customers`, `items`, `suppliers`, `warehouses`, `salesmen`.

## Route table — PricingController

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/pricing/resolve` | Query: `customerId`, `itemId`, `quantity`, `asOf` (optional) |

---

## Happy path — lookup customers

```bash
curl -s "https://localhost:5001/api/lookup/customers?q=makmur&page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "items": [
    {
      "id": "019dfb81b-2222-7000-8000-000000000050",
      "code": "CUST-001",
      "label": "Toko Makmur",
      "meta": { "area": "BDG-NORTH", "creditLimit": 50000000 }
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 10,
  "totalPages": 1
}
```

---

## Happy path — resolve price

```bash
curl -s "https://localhost:5001/api/pricing/resolve?customerId=019dfb81b-2222-7000-8000-000000000050&itemId=019dfb7d-0003-7000-8000-000000000003&quantity=24" \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "itemId": "019dfb7d-0003-7000-8000-000000000003",
  "customerId": "019dfb81b-2222-7000-8000-000000000050",
  "unitPrice": 15000,
  "discountPercent": 5,
  "extraDiscountPercent": 0,
  "netUnitPrice": 14250,
  "priceSource": "customer-brand-discount"
}
```

---

## Error example — ambiguous price tier (409)

```json
{
  "type": "https://httpstatuses.io/409",
  "title": "Business rule violated",
  "status": 409,
  "detail": "Multiple active price tiers match customer CUST-001 and item SKU-001.",
  "instance": "/api/pricing/resolve"
}
```

---

## See also

- [master-data.md](master-data.md) — price tiers and item prices
- [outbound.md](outbound.md) — SO creation uses pricing
