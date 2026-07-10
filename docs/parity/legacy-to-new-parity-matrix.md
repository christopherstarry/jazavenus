# Legacy-to-New Parity Matrix

**Purpose:** Track every legacy VB6 Sales Inventory feature against the new Jaza Venus app so nothing is missed at deployment.

**Status legend:**

| Status | Meaning |
|--------|---------|
| **Implemented** | Backend entity + API + frontend wired and usable |
| **Partial** | Some layers exist (e.g. API only, or UI shell only) |
| **Missing** | Not implemented in new app |
| **Dropped** | Intentionally excluded from new design (document reason) |
| **Planned** | Documented as required for parity; not yet built |

**Sources:** Legacy `docs/` + VB6 source inventory; new app `modules.tsx`, `Jaza.Domain`, controllers.

---

## Summary

| Domain | Legacy items | Implemented | Partial | Missing | Dropped |
|--------|-------------|-------------|---------|---------|---------|
| Master | 35+ forms | 28 | 4 | 3 | 0 |
| Purchase | 3 core + 8 auto | 2 | 1 | 1 | 8 auto |
| Sales | 5 core + 15 auto | 3 | 2 | 2 | 15 auto |
| Inventory | 8 core | 0 | 3 | 5 | 0 |
| A/R | 8 core | 1 | 2 | 5 | 0 |
| Reports | 90+ | 4 | 3 | 83+ | 0 |
| System | 12 | 3 | 0 | 9 | 0 |
| **Total (approx.)** | **170+** | **41** | **15** | **108+** | **23 auto** |

**Deployment readiness:** Core procure-to-cash skeleton exists on backend (PO → GRN → SO → DO → Invoice → Payment). Most transaction UIs and reports are **not API-connected**. Full legacy parity requires Phase 2–3 work documented in [brd-parity-and-changes.md](../brds/brd-parity-and-changes.md).

---

## Master Maintenance

| Legacy form / feature | New route | Backend | Frontend | Status | Gap notes |
|----------------------|-----------|---------|----------|--------|-----------|
| Customer (`frmCustomer`) | `/master/customer/master-customer` | `Customer`, `CustomerAddress` | `CustomerPage` | **Implemented** | AR balance computed, not stored |
| Class Outlet | `/master/customer/class-outlet` | `ClassOutlet` | `ClassOutletPage` | **Implemented** | |
| Group Outlet | `/master/customer/group-outlet` | `GroupOutlet` | `GroupOutletPage` | **Implemented** | |
| Location Outlet | `/master/customer/location-outlet` | `DistributionType` | `LocationOutletPage` | **Partial** | Label mismatch: uses distribution-types |
| Market Type | `/master/customer/market-type` | `TradeType` | `MarketTypePage` | **Partial** | Label mismatch: uses trade-types |
| Channel Outlet | `/master/customer/channel-outlet` | `SubTradeType` | `ChannelOutletPage` | **Partial** | Label mismatch |
| Outlet Type | `/master/customer/outlet-type` | `OutletType` | `OutletTypePage` | **Implemented** | |
| Salesman | `/master/customer/salesman` | `Salesman` | `SalesmanPage` | **Implemented** | |
| Collector | `/master/customer/collector` | `Collector` | `CollectorPage` | **Implemented** | |
| Sales Area | `/master/customer/sales-area` | `Area` | `SalesAreaPage` | **Implemented** | |
| Extra Discount | — | — | — | **Missing** | P2/P3 customer discounts; legacy `ExtraDiscount` table |
| BP Item | — | — | — | **Missing** | Business partner item cross-ref for B2B |
| Penetration | — | — | — | **Missing** | Customer penetration tracking |
| Product (`frmProduct`) | `/master/product/master-product` | `Item` | `ItemPage` | **Implemented** | |
| Brand | `/master/product/brand` | `Brand` | `BrandPage` | **Implemented** | |
| Category | `/master/product/category` | `ItemCategory` | `CategoryPage` | **Implemented** | |
| Sub Category | `/master/product/sub-category` | `SubCategory` | `SubCategoryPage` | **Implemented** | |
| Price | `/master/product/price` | `PriceTier`, `ItemPrice` | `PriceTierPage` | **Partial** | `ItemPrice` API exists; no per-product price UI |
| Discount | `/master/product/discount` | `DiscountCode`, `ItemDiscount` | `DiscountCodePage` | **Partial** | P1 product discounts; no per-item discount UI |
| Warehouse Location | `/master/product/warehouse-location` | `Warehouse`, `Location` | `WarehousePage` | **Implemented** | |
| Warehouse Type | `/master/product/warehouse-type` | `WarehouseType` | `WarehouseTypePage` | **Implemented** | |
| UOM | `/master/product/unit-of-measure` | `Unit` | `UnitOfMeasurePage` | **Implemented** | |
| Manufacturing / Principle | `/master/principle` | `Manufacturing`, `Supplier` | `SupplierPage` | **Partial** | Principle maps to Supplier page |
| Bank | `/master/bank` | `Bank` | `BankPage` | **Implemented** | |
| Term of Payment | `/master/term-of-payment` | `PaymentTerm` | `PaymentTermPage` | **Implemented** | |
| Tax No Registration | `/master/tax-no-registration` | `TaxRegistration` | `TaxRegistrationPage` | **Partial** | No serial allocation/tracking (Faktur Pajak) |
| Type of Costs | `/master/type-of-costs` | `CostType` | `CostTypePage` | **Implemented** | |
| Order Code | — | — | — | **Missing** | Sales order reason codes |
| Return Code | — | — | — | **Missing** | Return reason codes |
| Item Function | — | — | — | **Missing** | Product function classification |
| Class Parameter | — | — | — | **Missing** | Pricing class parameters |
| Update Price (batch) | — | — | — | **Missing** | Admin batch price update |

---

## Purchase Transaction

| Legacy form / feature | New route | Backend | Frontend | Status | Gap notes |
|----------------------|-----------|---------|----------|--------|-----------|
| Purchase Order (`frmPurchaseOrder`) | `/purchase/purchase-order` | `PurchaseOrder` | `PurchaseOrderPage` | **Partial** | API exists; UI not wired |
| Receiving Entry (`frmPurchaseReceive`) | `/purchase/receiving-entry` | `GoodsReceiptNote` | `ReceivingEntryPage` | **Partial** | API exists; `GrnsPage` (wired) not routed |
| Purchase Return (`frmPurchaseReturn`) | `/purchase/purchase-return` | — | `PurchaseReturnPage` | **Missing** | UI shell only |
| Auto PO / Auto Receive / Semblog | — | — | — | **Dropped** | Replace with API integrations in Phase 3 |

---

## Sales Transaction

| Legacy form / feature | New route | Backend | Frontend | Status | Gap notes |
|----------------------|-----------|---------|----------|--------|-----------|
| Sales Order (`frmOrderEntry`) | `/sales/sales-order` | `SalesOrder` | `SalesOrderPage` | **Partial** | API exists; UI not wired; no credit/overdue check |
| Sales Confirmation (`frmDelivery`) | `/sales/sales-confirmation` | `DeliveryOrder` | `SalesConfirmationPage` | **Partial** | Maps to DeliveryOrder; UI not wired |
| Sales Return (`frmReturn`) | `/sales/sales-return` | — | `SalesReturnPage` | **Missing** | UI shell only |
| Invoicing Process (`frmInvoice`) | `/sales/invoicing-process` | `Invoice`, `Payment` | `InvoicingProcessPage` | **Partial** | API exists; `InvoicesPage` (wired) not routed |
| Credit Memo (`frmCreditMemo`) | — | — | — | **Missing** | Not in module tree |
| Consignment (`frmConsignment`) | — | — | — | **Missing** | Consignment stock module |
| Auto Order/Delivery/Invoice | — | — | — | **Dropped** | Batch automation Phase 3 |
| Faktur Pajak serial (`SeriFaktur.bas`) | — | — | — | **Missing** | Tax compliance critical |

---

## Inventory Transaction

| Legacy form / feature | New route | Backend | Frontend | Status | Gap notes |
|----------------------|-----------|---------|----------|--------|-----------|
| Incoming BPB (`frmGoodReceipt`) | `/inventory/incoming-transaction-bpb` | `StockMovement` (AdjustmentIn) | `IncomingTransactionBpbPage` | **Partial** | No first-class BPB document |
| Outgoing BBK (`frmGoodIssue`) | `/inventory/outgoing-transaction-bbk` | `StockMovement` (AdjustmentOut) | `OutgoingTransactionBbkPage` | **Partial** | No first-class BBK document |
| Inter Warehouse (`frmTransfer`) | `/inventory/inter-warehouse-transaction` | enum only | `InterWarehouseTransactionPage` | **Missing** | TransferIn/Out enum; no API |
| Stock Taking Prep | `/inventory/stock-taking-preparation` | — | `StockTakingPreparationPage` | **Missing** | UI shell only |
| Stock Taking Record | `/inventory/stock-taking-record` | — | `StockTakingRecordPage` | **Missing** | UI shell only |
| Inventory Planning | `/inventory/inventory-planning` | — | `InventoryPlanningPage` | **Missing** | UI shell only |
| Stock Tracking Entry/Process | — | — | — | **Missing** | Legacy stock card posting |
| Inventory Posting | — | `StockOnHand`, `StockMovement` | — | **Partial** | Ledger exists; no posting process UI |

---

## A/R Transaction

| Legacy form / feature | New route | Backend | Frontend | Status | Gap notes |
|----------------------|-----------|---------|----------|--------|-----------|
| Payment Receipt (`frmPaymentReceipt`) | — | `Payment` (invoice-level) | — | **Partial** | Legacy batch receipt with 6 payment types |
| Bank Transfer Transaction | `/ar/bank-transfer-transaction` | — | `BankTransferTransactionPage` | **Missing** | UI shell only |
| PDC Clearance | `/ar/pdc-clearance-transaction` | — | — | **Missing** | No Component |
| PDC Clearance Cancellation | `/ar/pdc-clearance-cancellation` | — | `PdcClearanceCancellationPage` | **Missing** | UI shell only |
| Giro master / tracking | — | — | — | **Missing** | Post-dated cheque entity |
| Closing A/R | `/system/closing-ar-entry` | — | — | **Missing** | Period-end AR close |
| Recalculate AR Balance | `/system/recalculate-ar-balance` | — | — | **Missing** | |
| AR Adjustment (`FrmAdjustmentAR`) | — | — | — | **Missing** | |
| LHPP Entry | — | — | — | **Missing** | Payment allocation form |

---

## Reports

| Report group | Legacy count | New implemented | Status |
|--------------|-------------|-----------------|--------|
| Sales reports | ~40 | 4 (Product Selling, Detail Transaksi, Recap×4, Stock Position) | **Partial** — UI shells, not API-wired |
| Inventory reports | ~20 | 1 (Stock Position) | **Partial** |
| Purchase reports | ~7 | 0 | **Missing** |
| A/R reports | ~25 | 0 | **Missing** |

See [report-catalog.md](../prds/reports/report-catalog.md) for the full report-by-report matrix.

---

## System

| Legacy form / feature | New route | Backend | Frontend | Status | Gap notes |
|----------------------|-----------|---------|----------|--------|-----------|
| Login | `/login` | Auth | `LoginPage` | **Implemented** | Cookie + refresh token |
| Change Password | `/change-password` | Auth | `ChangePasswordPage` | **Implemented** | |
| Manage Users | `/system/manage-users` | Users + Permissions | `ManageUsersPage` | **Implemented** | Replaces Employee + Module + AccessControl |
| Activity History | `/system/audit-history` | `AuditLog` | `AuditHistoryPage` | **Implemented** | Replaces SistemLog (partial) |
| Error Logs | `/system/error-logs` | `ErrorLog` | `ErrorLogsPage` | **Implemented** | Developer only |
| Preferences (system) | `/system/preferences` | — | — | **Missing** | Legacy company settings |
| Closing A/R Entry | `/system/closing-ar-entry` | — | — | **Missing** | |
| Recalculate AR Balance | `/system/recalculate-ar-balance` | — | — | **Missing** | |
| Delete Cancelled Document | `/system/delete-cancelled-document` | — | — | **Missing** | |
| Cost Operations Entry | `/system/cost-operations-entry` | — | — | **Missing** | |
| Monthly Process | — | — | — | **Missing** | Legacy month-end in SIBusinessObject.dll |
| Backup / Restore | — | — | — | **Missing** | Ops runbook covers pg_dump |
| Day End Process | — | — | — | **Missing** | |
| Multi-company login | — | — | — | **Missing** | Single-tenant design; division string only |

---

## Critical Business Rules — Parity Status

| Rule | Legacy source | New app | Status |
|------|--------------|---------|--------|
| P1/P2/P3 discounts | `RuleModule.bas`, `ExtraDiscount` | `ItemDiscount`, `BrandDiscount` | **Partial** — P2/P3 missing |
| Credit limit check | `CheckCreditLimit` | — | **Missing** |
| Overdue check | `CheckOverDue` | — | **Missing** |
| Stock commitment (IsCommited) | Order save | — | **Missing** |
| Faktur Pajak serial | `SeriFaktur.bas` | — | **Missing** |
| Document chain (BaseType/Entry/Line) | All transaction forms | Partial on SO/DO/Invoice | **Partial** |
| Payment allocation (6 types) | `frmPaymentReceipt` | Invoice-level `Payment` | **Partial** |
| Division-scoped data | `CompanyIDKu` filter | `division` string field | **Partial** |
| Document status O/B/C | All headers | `DocumentStatus` enum | **Implemented** |
| Admin override (F6) | Credit/overdue | — | **Missing** |

---

## Related documents

- [BRD parity and changes](../brds/brd-parity-and-changes.md)
- [Database review](../database/database-review.md)
- [Report catalog PRD](../prds/reports/report-catalog.md)
- [Cutover checklist](../cutover-checklist.md)
