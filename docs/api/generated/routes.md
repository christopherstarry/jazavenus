# Generated route inventory

> **Auto-generated** by `backend/scripts/export-api-docs.ps1` â€” do not edit by hand.
> Regenerate after controller changes.

**Generated:** 2026-07-10T10:00:56.3522354Z  
**Controllers:** 36  
**Action routes scanned:** 206  
**OpenAPI:** /openapi/v1.json  
**OpenAPI status:** OpenAPI document not fetched - start the API (dotnet run --project backend/src/Jaza.Api) and re-run, or open https://localhost:5001/openapi/v1.json in Development.

---

## Quick links

| Artifact | Path |
|----------|------|
| Endpoint manifest (JSON) | [../endpoint-manifest.json](../endpoint-manifest.json) |
| Human route reference | [../../http-api.md](../../http-api.md) |
| Module guides | [../modules/](../modules/) |
| OpenAPI cache | [openapi-v1.json](openapi-v1.json) |

---

## Controller summary

| Controller | Prefix | Routes | Auth |
|------------|--------|--------|------|| `AnalyticsController` | `/api/analytics` | 1 | RequireOperator, Module:sales |
| `ArAdjustmentsController` | `/api/ar/adjustments` | 6 | RequireOperator, Module:ar |
| `ArClosingController` | `/api/ar` | 2 | RequireOperator, Module:ar |
| `ArPaymentsController` | `/api/ar/payments` | 1 | RequireOperator, Module:ar |
| `ArReportsController` | `/api/reports/ar` | 1 | RequireOperator |
| `AuditLogsController` | `/api/audit-logs` | 3 | RequireSuperAdmin |
| `AuthController` | `/api/auth` | 11 | RequireSuperAdmin |
| `ConsignmentsController` | `/api/outbound/consignments` | 1 | RequireOperator, Module:sales |
| `CreditMemosController` | `/api/invoices/credit-memos` | 5 | RequireOperator, Module:ar |
| `ErrorLogsController` | `/api/error-logs` | 2 | RequireDeveloper |
| `ExtraDiscountsController` | `/api/master/extra-discounts` | 5 | RequireOperator, Module:master |
| `ImportExportController` | `/api/io` | 2 | RequireAdmin, Module:master |
| `InboundController` | `/api/inbound` | 10 | RequireOperator, Module:purchase |
| `IntegrationsController` | `/api/integrations` | 3 | RequireOperator, Module:master |
| `InventoryDocumentsController` | `/api/inventory` | 15 | RequireOperator, Module:inventory |
| `InventoryReportsController` | `/api/reports/inventory` | 1 | RequireOperator |
| `InvoicingController` | `/api/invoices` | 8 | RequireOperator, Module:ar |
| `LookupController` | `/api/lookup` | 2 | RequireOperator, Module:master |
| `MasterDataController` | `/api/master` | 21 | RequireOperator, Module:master |
| `OutboundController` | `/api/outbound` | 10 | RequireOperator, Module:sales |
| `PdcController` | `/api/ar/pdc` | 7 | RequireOperator, Module:ar |
| `PermissionsController` | `/api/users/{userId:guid}/permissions` | 2 | RequireSuperAdmin |
| `PricingController` | `/api/pricing` | 1 | RequireOperator, Module:sales |
| `ProcessesController` | `/api/processes` | 5 | RequireOperator, Module:sales |
| `PurchaseReportsController` | `/api/reports/purchase` | 1 | RequireOperator |
| `PurchaseReturnsController` | `/api/inbound/purchase-returns` | 5 | RequireOperator, Module:purchase |
| `ReferenceDataController` | `/api/master` | 25 | RequireOperator, Module:master |
| `ReportsController` | `/api/reports` | 4 | RequireOperator |
| `SalesReportsController` | `/api/reports/sales` | 1 | RequireOperator |
| `SalesReturnsController` | `/api/outbound/sales-returns` | 5 | RequireOperator, Module:sales |
| `SettingsController` | `/api/settings` | 17 | RequireOperator, Module:master |
| `StockController` | `/api/stock` | 2 | RequireOperator, Module:inventory |
| `StockTakeController` | `/api/inventory/stock-takes` | 5 | RequireOperator, Module:inventory |
| `SystemController` | `/api/system` | 5 | RequireOperator, Module:master |
| `TaxSerialsController` | `/api/tax/serials` | 5 | RequireOperator, Module:sales |
| `UsersController` | `/api/users` | 6 | RequireSuperAdmin |

---

## Full route list (from source scan)
### AnalyticsController

| Method | Path |
|--------|------|
| GET | `/api/analytics/penetration` |

### ArAdjustmentsController

| Method | Path |
|--------|------|
| GET | `/api/ar/adjustments` |
| GET | `/api/ar/adjustments/{id}` |
| POST | `/api/ar/adjustments` |
| PUT | `/api/ar/adjustments/{id}` |
| POST | `/api/ar/adjustments/{id}/post` |
| DELETE | `/api/ar/adjustments/{id}` |

### ArClosingController

| Method | Path |
|--------|------|
| POST | `/api/ar/close-period` |
| POST | `/api/ar/recalculate-balance` |

### ArPaymentsController

| Method | Path |
|--------|------|
| POST | `/api/ar/payments` |

### ArReportsController

| Method | Path |
|--------|------|
| GET | `/api/reports/ar/{reportKey}` |

### AuditLogsController

| Method | Path |
|--------|------|
| GET | `/api/audit-logs` |
| GET | `/api/audit-logs/{id}` |
| GET | `/api/audit-logs/by-entity` |

### AuthController

| Method | Path |
|--------|------|
| POST | `/api/auth/login` |
| POST | `/api/auth/logout` |
| POST | `/api/auth/refresh` |
| GET | `/api/auth/me` |
| GET | `/api/auth/antiforgery` |
| POST | `/api/auth/change-password` |
| POST | `/api/auth/me/change-password` |
| POST | `/api/auth/mfa/init` |
| POST | `/api/auth/mfa/confirm` |
| GET | `/api/auth/preferences` |
| PUT | `/api/auth/preferences` |

### ConsignmentsController

| Method | Path |
|--------|------|
| GET | `/api/outbound/consignments` |

### CreditMemosController

| Method | Path |
|--------|------|
| GET | `/api/invoices/credit-memos` |
| GET | `/api/invoices/credit-memos/{id}` |
| POST | `/api/invoices/credit-memos` |
| PUT | `/api/invoices/credit-memos/{id}` |
| POST | `/api/invoices/credit-memos/{id}/post` |

### ErrorLogsController

| Method | Path |
|--------|------|
| GET | `/api/error-logs` |
| GET | `/api/error-logs/{id}` |

### ExtraDiscountsController

| Method | Path |
|--------|------|
| GET | `/api/master/extra-discounts` |
| GET | `/api/master/extra-discounts/{id}` |
| POST | `/api/master/extra-discounts` |
| PUT | `/api/master/extra-discounts/{id}` |
| DELETE | `/api/master/extra-discounts/{id}` |

### ImportExportController

| Method | Path |
|--------|------|
| GET | `/api/io/items.xlsx` |
| POST | `/api/io/items.xlsx` |

### InboundController

| Method | Path |
|--------|------|
| GET | `/api/inbound/purchase-orders` |
| GET | `/api/inbound/purchase-orders/{id}` |
| POST | `/api/inbound/purchase-orders` |
| PUT | `/api/inbound/purchase-orders/{id}` |
| POST | `/api/inbound/purchase-orders/{id}/post` |
| GET | `/api/inbound/grns` |
| GET | `/api/inbound/grns/{id}` |
| POST | `/api/inbound/grns` |
| PUT | `/api/inbound/grns/{id}` |
| POST | `/api/inbound/grns/{id}/post` |

### IntegrationsController

| Method | Path |
|--------|------|
| POST | `/api/integrations/semblog` |
| POST | `/api/integrations/clipper` |
| POST | `/api/integrations/sms-orders` |

### InventoryDocumentsController

| Method | Path |
|--------|------|
| GET | `/api/inventory/stock-receipts` |
| GET | `/api/inventory/stock-receipts/{id}` |
| POST | `/api/inventory/stock-receipts` |
| PUT | `/api/inventory/stock-receipts/{id}` |
| POST | `/api/inventory/stock-receipts/{id}/post` |
| GET | `/api/inventory/stock-issues` |
| GET | `/api/inventory/stock-issues/{id}` |
| POST | `/api/inventory/stock-issues` |
| PUT | `/api/inventory/stock-issues/{id}` |
| POST | `/api/inventory/stock-issues/{id}/post` |
| GET | `/api/inventory/stock-transfers` |
| GET | `/api/inventory/stock-transfers/{id}` |
| POST | `/api/inventory/stock-transfers` |
| PUT | `/api/inventory/stock-transfers/{id}` |
| POST | `/api/inventory/stock-transfers/{id}/post` |

### InventoryReportsController

| Method | Path |
|--------|------|
| GET | `/api/reports/inventory/{reportKey}` |

### InvoicingController

| Method | Path |
|--------|------|
| GET | `/api/invoices` |
| GET | `/api/invoices/{id}` |
| POST | `/api/invoices` |
| PUT | `/api/invoices/{id}` |
| POST | `/api/invoices/{id}/post` |
| POST | `/api/invoices/{id}/void` |
| GET | `/api/invoices/{id}/pdf` |
| POST | `/api/invoices/{id}/payments` |

### LookupController

| Method | Path |
|--------|------|
| GET | `/api/lookup/types` |
| GET | `/api/lookup/{type}` |

### MasterDataController

| Method | Path |
|--------|------|
| GET | `/api/master/units` |
| POST | `/api/master/units` |
| PUT | `/api/master/units/{id}` |
| DELETE | `/api/master/units/{id}` |
| GET | `/api/master/categories` |
| POST | `/api/master/categories` |
| PUT | `/api/master/categories/{id}` |
| DELETE | `/api/master/categories/{id}` |
| GET | `/api/master/items` |
| GET | `/api/master/items/{id}` |
| POST | `/api/master/items` |
| PUT | `/api/master/items/{id}` |
| DELETE | `/api/master/items/{id}` |
| GET | `/api/master/suppliers` |
| GET | `/api/master/customers` |
| GET | `/api/master/customers/{id}` |
| GET | `/api/master/customers/{id}/credit-status` |
| GET | `/api/master/customers/{customerId}/addresses` |
| GET | `/api/master/customers/{customerId}/brand-discounts` |
| GET | `/api/master/warehouses` |
| GET | `/api/master/locations` |

### OutboundController

| Method | Path |
|--------|------|
| GET | `/api/outbound/sales-orders` |
| GET | `/api/outbound/sales-orders/{id}` |
| POST | `/api/outbound/sales-orders` |
| PUT | `/api/outbound/sales-orders/{id}` |
| POST | `/api/outbound/sales-orders/{id}/post` |
| GET | `/api/outbound/delivery-orders` |
| GET | `/api/outbound/delivery-orders/{id}` |
| POST | `/api/outbound/delivery-orders` |
| PUT | `/api/outbound/delivery-orders/{id}` |
| POST | `/api/outbound/delivery-orders/{id}/post` |

### PdcController

| Method | Path |
|--------|------|
| GET | `/api/ar/pdc` |
| GET | `/api/ar/pdc/{id}` |
| POST | `/api/ar/pdc` |
| PUT | `/api/ar/pdc/{id}` |
| DELETE | `/api/ar/pdc/{id}` |
| POST | `/api/ar/pdc/{id}/clear` |
| POST | `/api/ar/pdc/{id}/cancel-clearance` |

### PermissionsController

| Method | Path |
|--------|------|
| GET | `/api/users/{userId}/permissions` |
| PUT | `/api/users/{userId}/permissions` |

### PricingController

| Method | Path |
|--------|------|
| GET | `/api/pricing/resolve` |

### ProcessesController

| Method | Path |
|--------|------|
| GET | `/api/processes` |
| POST | `/api/processes/auto-delivery` |
| POST | `/api/processes/auto-invoice` |
| POST | `/api/processes/auto-delete` |
| POST | `/api/processes/auto-po-from-so` |

### PurchaseReportsController

| Method | Path |
|--------|------|
| GET | `/api/reports/purchase/{reportKey}` |

### PurchaseReturnsController

| Method | Path |
|--------|------|
| GET | `/api/inbound/purchase-returns` |
| GET | `/api/inbound/purchase-returns/{id}` |
| POST | `/api/inbound/purchase-returns` |
| PUT | `/api/inbound/purchase-returns/{id}` |
| POST | `/api/inbound/purchase-returns/{id}/post` |

### ReferenceDataController

| Method | Path |
|--------|------|
| GET | `/api/master/brands` |
| GET | `/api/master/banks` |
| GET | `/api/master/salesmen` |
| GET | `/api/master/collectors` |
| GET | `/api/master/areas` |
| GET | `/api/master/warehouse-types` |
| GET | `/api/master/outlet-types` |
| GET | `/api/master/outlet-groups` |
| GET | `/api/master/outlet-group-types` |
| GET | `/api/master/trade-types` |
| GET | `/api/master/sub-trade-types` |
| GET | `/api/master/distribution-types` |
| GET | `/api/master/class-outlets` |
| GET | `/api/master/cost-types` |
| GET | `/api/master/manufacturers` |
| GET | `/api/master/tax-registrations` |
| GET | `/api/master/price-tiers` |
| GET | `/api/master/discount-codes` |
| GET | `/api/master/payment-terms` |
| GET | `/api/master/sub-categories` |
| GET | `/api/master/customer-addresses` |
| GET | `/api/master/item-prices` |
| GET | `/api/master/item-prices/{id}` |
| GET | `/api/master/item-discounts` |
| GET | `/api/master/item-discounts/{id}` |

### ReportsController

| Method | Path |
|--------|------|
| GET | `/api/reports/stock-card` |
| GET | `/api/reports/low-stock` |
| GET | `/api/reports/daily-movements` |
| GET | `/api/reports/financial-summary` |

### SalesReportsController

| Method | Path |
|--------|------|
| GET | `/api/reports/sales/{reportKey}` |

### SalesReturnsController

| Method | Path |
|--------|------|
| GET | `/api/outbound/sales-returns` |
| GET | `/api/outbound/sales-returns/{id}` |
| POST | `/api/outbound/sales-returns` |
| PUT | `/api/outbound/sales-returns/{id}` |
| POST | `/api/outbound/sales-returns/{id}/post` |

### SettingsController

| Method | Path |
|--------|------|
| GET | `/api/settings/company` |
| PUT | `/api/settings/company` |
| GET | `/api/settings/fiscal-periods` |
| GET | `/api/settings/fiscal-periods/{id}` |
| POST | `/api/settings/fiscal-periods` |
| PUT | `/api/settings/fiscal-periods/{id}` |
| DELETE | `/api/settings/fiscal-periods/{id}` |
| GET | `/api/settings/order-codes` |
| GET | `/api/settings/order-codes/{id}` |
| POST | `/api/settings/order-codes` |
| PUT | `/api/settings/order-codes/{id}` |
| DELETE | `/api/settings/order-codes/{id}` |
| GET | `/api/settings/return-codes` |
| GET | `/api/settings/return-codes/{id}` |
| POST | `/api/settings/return-codes` |
| PUT | `/api/settings/return-codes/{id}` |
| DELETE | `/api/settings/return-codes/{id}` |

### StockController

| Method | Path |
|--------|------|
| GET | `/api/stock/on-hand` |
| POST | `/api/stock/adjustments` |

### StockTakeController

| Method | Path |
|--------|------|
| GET | `/api/inventory/stock-takes` |
| GET | `/api/inventory/stock-takes/{id}` |
| POST | `/api/inventory/stock-takes/prep` |
| PUT | `/api/inventory/stock-takes/{id}/lines` |
| POST | `/api/inventory/stock-takes/{id}/post` |

### SystemController

| Method | Path |
|--------|------|
| POST | `/api/system/monthly-process` |
| POST | `/api/system/day-end` |
| POST | `/api/system/delete-cancelled-document` |
| POST | `/api/system/backup` |
| POST | `/api/system/restore` |

### TaxSerialsController

| Method | Path |
|--------|------|
| GET | `/api/tax/serials` |
| GET | `/api/tax/serials/{id}` |
| POST | `/api/tax/serials` |
| PUT | `/api/tax/serials/{id}` |
| DELETE | `/api/tax/serials/{id}` |

### UsersController

| Method | Path |
|--------|------|
| GET | `/api/users` |
| GET | `/api/users/{id}` |
| POST | `/api/users` |
| PUT | `/api/users/{id}` |
| DELETE | `/api/users/{id}` |
| POST | `/api/users/{id}/reset-password` |

---

## OpenAPI

When the API is running locally in Development:

```bash
curl -sk https://localhost:5001/openapi/v1.json -o docs/api/generated/openapi-v1.json
```

Scalar UI is mapped in Development via `MapScalarApiReference()` on the API origin.

---

## Regenerate

```powershell
./backend/scripts/export-api-docs.ps1
```
