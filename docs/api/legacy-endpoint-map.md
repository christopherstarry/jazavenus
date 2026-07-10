# Legacy endpoint map — VB6 `siOBJECT_TYPE` → REST

This table maps legacy VB6 `DataSystem.siOBJECT_TYPE` enum values (from `BusinessObject/Class Modules/DataSystem.cls`) to the Jaza Venus REST API introduced in the 2026-07-10 parity release.

**Legend:** ✅ Implemented · ⚠️ Partial · ❌ Not yet exposed · 🚫 Intentionally dropped

---

## Master data and reference

| Enum | Value | Legacy form / concept | REST API | Status |
|------|-------|----------------------|----------|--------|
| `siPreferences` | 1 | Company preferences | `GET/PUT /api/settings/company`, `GET/PUT /api/auth/preferences` | ✅ |
| `siEmployee` | 2 | Employee / user | `GET/POST /api/users`, `GET /api/auth/me` | ✅ |
| `siModule` | 3 | Module ACL | `GET/PUT /api/users/{userId}/permissions` | ✅ |
| `siClassParameter` | 4 | Class parameters | — | ❌ |
| `siManufacturing` | 5 | Manufacturer | `GET/POST /api/master/manufacturers` | ✅ |
| `siItem` | 6 | Product / SKU | `GET/POST /api/master/items` | ✅ |
| `siBrand` | 7 | Brand | `GET/POST /api/master/brands` | ✅ |
| `siCategory` | 8 | Category | `GET/POST /api/master/categories` | ✅ |
| `siSubCategory` | 9 | Sub-category | `GET/POST /api/master/sub-categories` | ✅ |
| `siPrice` | 10 | Price tier / item price | `GET/POST /api/master/price-tiers`, `/item-prices` | ✅ |
| `siDiscount` | 11 | Discount codes | `GET/POST /api/master/discount-codes`, `/item-discounts` | ✅ |
| `siSupplier` | 12 | Supplier | `GET/POST /api/master/suppliers` | ✅ |
| `siCustomer` | 13 | Customer / outlet | `GET/POST /api/master/customers` | ✅ |
| `siDistributionType` | 14 | Distribution type | `GET/POST /api/master/distribution-types` | ✅ |
| `siGroupOutlet` | 15 | Outlet group | `GET/POST /api/master/outlet-groups` | ✅ |
| `siOutletType` | 16 | Outlet type | `GET/POST /api/master/outlet-types` | ✅ |
| `siTradeType` | 17 | Trade type | `GET/POST /api/master/trade-types` | ✅ |
| `siArea` | 18 | Sales area | `GET/POST /api/master/areas` | ✅ |
| `siSalesman` | 19 | Salesman | `GET/POST /api/master/salesmen` | ✅ |
| `siCollector` | 20 | Collector | `GET/POST /api/master/collectors` | ✅ |
| `siExtraDiscount` | 21 | P2/P3 extra discount | `GET/POST /api/master/extra-discounts` | ✅ |
| `siWarehouse` | 22 | Warehouse | `GET/POST /api/master/warehouses` | ✅ |
| `siBank` | 23 | Bank | `GET/POST /api/master/banks` | ✅ |
| `siPaymentTerm` | 24 | Term of payment | `GET/POST /api/master/payment-terms` | ✅ |
| `siWarehouseType` | 25 | Warehouse type | `GET/POST /api/master/warehouse-types` | ✅ |
| `siModuleList` | 26 | Module list (metadata) | `GET /api/lookup/types` | ⚠️ |
| `siUom` | 105 | Unit of measure | `GET/POST /api/master/units` | ✅ |
| `siGroupOutletType` | 43 | Outlet group type | `GET/POST /api/master/outlet-group-types` | ✅ |
| `siSubTradeType` | 53 | Sub trade type | `GET/POST /api/master/sub-trade-types` | ✅ |
| `siItemFunction` | 54 | Item function | — | ❌ |
| `siTaxNo` | 49 | Tax registration / Faktur | `GET/POST /api/master/tax-registrations`, `/api/tax/serials` | ✅ |
| `siOrderCode` | 57 | Order code | `GET/POST /api/settings/order-codes` | ✅ |
| `siReturnCode` | 56 | Return code | `GET/POST /api/settings/return-codes` | ✅ |

---

## Sales and outbound

| Enum | Value | Legacy concept | REST API | Status |
|------|-------|----------------|----------|--------|
| `siOrder` | 27 | Sales order | `GET/POST /api/outbound/sales-orders` | ✅ |
| `siDelivery` | 28 | Delivery order | `GET/POST /api/outbound/delivery-orders` | ✅ |
| `siReturn` | 29 | Sales return | `GET/POST /api/outbound/sales-returns` | ✅ |
| `siInvoice` | 30 | Tax invoice | `GET/POST /api/invoices` | ✅ |
| `siCreditMemo` | 37 | Credit memo | `GET/POST /api/invoices/credit-memos` | ✅ |
| `siOrderSMS` | 41 | SMS order intake | `POST /api/integrations/sms-orders` | ⚠️ stub |
| `siConsignment` | 44 | Consignment | — | ❌ |
| `siPenetration` | 51 | Penetration tracking | — | ❌ |
| `siDeliveryLogServices` | 52 | Delivery log | — | ❌ |

---

## Purchase and inbound

| Enum | Value | Legacy concept | REST API | Status |
|------|-------|----------------|----------|--------|
| `siPurchaseOrder` | 31 | Purchase order | `GET/POST /api/inbound/purchase-orders` | ✅ |
| `siPurchaseReceive` | 32 | GRN / receive | `GET/POST /api/inbound/grns` | ✅ |
| `siPurchaseReturn` | 33 | Purchase return | `GET/POST /api/inbound/purchase-returns` | ✅ |

---

## Inventory

| Enum | Value | Legacy concept | REST API | Status |
|------|-------|----------------|----------|--------|
| `siTransfer` | 34 | Inter-warehouse transfer | `GET/POST /api/inventory/stock-transfers` | ✅ |
| `siGoodsShipment` | 35 | BBK / stock issue | `GET/POST /api/inventory/stock-issues` | ✅ |
| `siGoodReceive` | 36 | BPB / stock receipt | `GET/POST /api/inventory/stock-receipts` | ✅ |
| `siStockTracking` | 40 | Stock tracking | `GET /api/stock/on-hand`, `/api/reports/stock-card` | ⚠️ |
| `siInvTracking` | 50 | Invoice tracking | Report keys under `sales:check-order-vs-invoice` | ⚠️ |

Stock take (legacy opname): `GET/POST /api/inventory/stock-takes`.

Manual adjustment: `POST /api/stock/adjustments`.

---

## Accounts receivable

| Enum | Value | Legacy concept | REST API | Status |
|------|-------|----------------|----------|--------|
| `siPaymentReceipt` | 38 | Payment receipt | `POST /api/ar/payments`, `POST /api/invoices/{id}/payments` | ✅ |
| `siGiro` | 46 | Post-dated cheque (PDC) | `GET/POST /api/ar/pdc` | ✅ |
| `siGiroClearing` | 39 | PDC clearance | `POST /api/ar/pdc/{id}/clear` | ✅ |
| `siGiroClearingCanceled` | 45 | Cancel clearance | `POST /api/ar/pdc/{id}/cancel-clearance` | ✅ |
| `siGiroTracking` | 55 | Giro tracking report | `GET /api/reports/ar/giro-due` | ✅ |
| `siAdjustmentAR` | 42 | AR adjustment | `GET/POST /api/ar/adjustments` | ✅ |
| `siClosingAR` | 47 | AR period close | `POST /api/ar/close-period`, `/recalculate-balance` | ✅ |
| `siLHPP` | 48 | LHPP costing | — | ❌ |

---

## System, batch, and integrations

| Enum | Value | Legacy concept | REST API | Status |
|------|-------|----------------|----------|--------|
| Legacy auto-delivery | — | Batch DO generation | `POST /api/processes/auto-delivery` | ⚠️ stub |
| Legacy auto-invoice | — | Batch invoicing | `POST /api/processes/auto-invoice` | ⚠️ stub |
| Legacy auto-delete | — | Purge cancelled docs | `POST /api/processes/auto-delete`, `/api/system/delete-cancelled-document` | ⚠️ stub |
| Legacy auto-PO-from-SO | — | PO generation | `POST /api/processes/auto-po-from-so` | ⚠️ stub |
| Monthly / day-end | — | Period processing | `POST /api/system/monthly-process`, `/day-end` | ⚠️ stub |
| Semblog / Clipper | — | External integrations | `POST /api/integrations/semblog`, `/clipper` | ⚠️ stub |
| Backup / restore | — | DB backup | `POST /api/system/backup`, `/restore` | ⚠️ stub |

---

## Reports

Legacy Crystal/report forms map to dynamic report keys:

| Domain | REST prefix | Example legacy report |
|--------|-------------|----------------------|
| Sales | `GET /api/reports/sales/{reportKey}` | Register book → `register-book` |
| Inventory | `GET /api/reports/inventory/{reportKey}` | Stock card → `stock-card` |
| Purchase | `GET /api/reports/purchase/{reportKey}` | Purchase recap → `purchase-recapitulation` |
| A/R | `GET /api/reports/ar/{reportKey}` | Aging → `aging` |

Built-in shortcuts on `ReportsController`: `/api/reports/stock-card`, `/low-stock`, `/daily-movements`, `/financial-summary`.

Full key catalog: `Jaza.Infrastructure.Reports.ReportCatalog`.

---

## Audit and diagnostics

| Legacy concept | REST API |
|----------------|----------|
| Activity history | `GET /api/audit-logs` |
| Error log (developer) | `GET /api/error-logs` |

---

## Related

- [../parity/legacy-to-new-parity-matrix.md](../parity/legacy-to-new-parity-matrix.md) — feature status matrix
- [../schema-mapping.md](../schema-mapping.md) — SQL Server → PostgreSQL ETL
- [README.md](README.md) — API index
