# Master data module — `/api/master`

Core and reference master data CRUD.

**Auth policy:** `RequireOperator` + `RequireModule("master")`. Writes typically `RequireAdmin`; deletes often `RequireSuperAdmin`.

**Controllers:** `MasterDataController`, `ReferenceDataController`, `ExtraDiscountsController`

---

## Route table — core (`MasterDataController`)

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/master/units` | — |
| POST/PUT/DELETE | `/api/master/units`, `/units/{id}` | Admin / SA delete |
| GET | `/api/master/categories` | — |
| POST/PUT/DELETE | `/api/master/categories`, `/{id}` | Admin / SA |
| GET | `/api/master/items`, `/items/{id}` | — (cost hidden from Sales) |
| POST/PUT/DELETE | `/api/master/items`, `/items/{id}` | Admin / SA |
| GET | `/api/master/suppliers` | — |
| POST/PUT/DELETE | `/api/master/suppliers`, `/{id}` | Admin / SA |
| GET | `/api/master/customers`, `/customers/{id}` | — |
| POST/PUT/DELETE | `/api/master/customers`, `/{id}` | Admin / SA |
| GET/POST/PUT/DELETE | `/api/master/customers/{customerId}/addresses` … | Admin / SA |
| GET/POST/PUT/DELETE | `/api/master/customers/{customerId}/brand-discounts` … | Admin / SA |
| GET/POST/PUT/DELETE | `/api/master/warehouses`, `/locations` … | Admin / SA |

## Route table — reference (`ReferenceDataController`)

Each resource supports `GET` list, `POST`, `PUT /{id}`, `DELETE /{id}`:

`brands`, `banks`, `salesmen`, `collectors`, `areas`, `warehouse-types`, `outlet-types`, `outlet-groups`, `outlet-group-types`, `trade-types`, `sub-trade-types`, `distribution-types`, `class-outlets`, `cost-types`, `manufacturers`, `tax-registrations`, `price-tiers`, `discount-codes`, `payment-terms`, `sub-categories`, `customer-addresses`, `item-prices`, `item-discounts`

## Route table — extra discounts

| Method | Path | Write policy |
|--------|------|--------------|
| GET | `/api/master/extra-discounts`, `/{id}` | — |
| POST/PUT/DELETE | `/api/master/extra-discounts`, `/{id}` | Admin |

---

## Happy path — create customer

```bash
curl -s -X POST https://localhost:5001/api/master/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Division: DISTRIBUTIONBDG" \
  -d '{
    "code": "CUST-001",
    "name": "Toko Makmur",
    "idNo": "3276010101010001",
    "isActive": true,
    "creditLimit": 50000000,
    "paymentTermId": "019dfb7d-0100-7000-8000-000000000010"
  }'
```

```json
{
  "id": "019dfb81b-2222-7000-8000-000000000050",
  "code": "CUST-001",
  "name": "Toko Makmur",
  "idNo": "3276010101010001",
  "division": "DISTRIBUTIONBDG",
  "isActive": true,
  "creditLimit": 50000000,
  "balance": 0
}
```

---

## Error example — duplicate NIK (409)

```bash
curl -s -X POST https://localhost:5001/api/master/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "code": "CUST-002", "name": "Duplicate", "idNo": "3276010101010001" }'
```

```json
{
  "title": "duplicate_id_no",
  "detail": "Customer with this NIK already exists.",
  "status": 409
}
```

---

## See also

- [lookup.md](lookup.md) — typeahead search
- [settings.md](settings.md) — company-level settings
- [../legacy-endpoint-map.md](../legacy-endpoint-map.md)
