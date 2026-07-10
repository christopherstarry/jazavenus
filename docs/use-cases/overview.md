# Use Cases â€” Jaza Venus

**Source:** Legacy `docs/10-use-cases.md`, aligned to new permission model in `Jaza.Application.Auth.PermissionResolver`.

**Actors:**

| Actor | Role | Typical permissions |
|-------|------|---------------------|
| Sales Operator | Operator / Sales | Sales module (edit) |
| Purchase Operator | Operator | Purchase module |
| Warehouse Operator | Operator | Inventory module |
| Collector | Operator | A/R module |
| Module Admin | Admin | Assigned modules + delete |
| SuperAdmin | SuperAdmin | All modules + reports + user management |
| Developer | Developer | All + error logs |

**Permission modules:** `master`, `purchase`, `sales`, `inventory`, `ar`  
**Report types:** `sales`, `inventory`, `purchase`, `ar`

---

## UC-M01: Maintain customer master

| Field | Value |
|-------|-------|
| Actor | Sales Operator (master permission) |
| Precondition | User authenticated; `master` module access |
| Flow | 1. Navigate to Master â†’ Customer â†’ Master Customer. 2. Create/edit customer with codes, credit limit, salesman, payment term. 3. Save. |
| Postcondition | Customer available for sales documents |
| Legacy | `frmCustomer` |
| Status | **Implemented** |

---

## UC-M02: Maintain product and pricing

| Field | Value |
|-------|-------|
| Actor | Module Admin |
| Precondition | `master` module access |
| Flow | 1. Master â†’ Product â†’ Master Product. 2. Create item with brand, category, UOM. 3. Set price tier and discounts. |
| Postcondition | Item available for transactions |
| Legacy | `frmProduct`, `frmProductPrice`, `frmProductDiscount` |
| Status | **Partial** â€” item CRUD yes; per-item price/discount UI missing |

---

## UC-P01: Create and post purchase order

| Field | Value |
|-------|-------|
| Actor | Purchase Operator |
| Precondition | `purchase` module; supplier and items exist |
| Flow | 1. Purchase â†’ Purchase Order. 2. Select supplier, add lines. 3. Save draft. 4. Post. |
| Postcondition | PO locked for receiving |
| Legacy | `frmPurchaseOrder` |
| Status | **Partial** â€” API yes; UI not wired |

---

## UC-P02: Receive goods against PO

| Field | Value |
|-------|-------|
| Actor | Purchase Operator |
| Precondition | Posted PO with open lines |
| Flow | 1. Purchase â†’ Receiving Entry. 2. Pull PO lines. 3. Enter received qty. 4. Post. |
| Postcondition | Stock IN; PO line received_qty updated |
| Legacy | `frmPurchaseReceive` |
| Status | **Partial** |

---

## UC-S01: Create sales order with credit check

| Field | Value |
|-------|-------|
| Actor | Sales Operator |
| Precondition | `sales` module; customer within credit limit |
| Flow | 1. Sales â†’ Sales Order. 2. Select customer. 3. System checks credit (OrdersBal) and overdue. 4. Add lines with P1/P2/P3. 5. Post. |
| Postcondition | Stock committed; order open for delivery |
| Legacy | `frmOrderEntry`, `CheckCreditLimit`, `CheckOverDue` |
| Status | **Partial** â€” no credit/overdue/stock commitment |

---

## UC-S02: Confirm delivery (Sales Confirmation)

| Field | Value |
|-------|-------|
| Actor | Warehouse Operator |
| Precondition | Posted SO with open lines |
| Flow | 1. Sales â†’ Sales Confirmation. 2. Pull SO lines. 3. Post delivery. |
| Postcondition | Stock OUT; commitment released |
| Legacy | `frmDelivery` |
| Status | **Partial** |

---

## UC-S03: Invoice customer with Faktur Pajak

| Field | Value |
|-------|-------|
| Actor | Sales Operator |
| Precondition | Posted delivery; PKP customer for tax serial |
| Flow | 1. Sales â†’ Invoicing Process. 2. Pull delivery. 3. Post invoice. 4. System assigns Faktur serial. 5. Print PDF. |
| Postcondition | Customer balance increased; tax serial recorded |
| Legacy | `frmInvoice`, `SeriFaktur.bas` |
| Status | **Partial** â€” no Faktur serial |

---

## UC-S04: Process sales return

| Field | Value |
|-------|-------|
| Actor | Sales Operator |
| Precondition | Prior delivery/invoice exists |
| Flow | 1. Sales â†’ Sales Return. 2. Link source doc. 3. Post. |
| Postcondition | Stock IN; return amount for payment offset |
| Legacy | `frmReturn` |
| Status | **Missing** |

---

## UC-I01: Transfer stock between warehouses

| Field | Value |
|-------|-------|
| Actor | Warehouse Operator |
| Precondition | `inventory` module; stock in source WH |
| Flow | 1. Inventory â†’ Inter Warehouse Transaction. 2. Select from/to WH. 3. Add lines. 4. Post. |
| Postcondition | Both warehouses updated atomically |
| Legacy | `frmTransfer` |
| Status | **Missing** |

---

## UC-I02: Stock opname (physical count)

| Field | Value |
|-------|-------|
| Actor | Warehouse Operator |
| Precondition | `inventory` module |
| Flow | 1. Stock Taking Preparation. 2. Stock Taking Record. 3. Post variances. |
| Postcondition | Ledger matches physical count |
| Legacy | Stock opname process |
| Status | **Missing** |

---

## UC-A01: Record payment receipt

| Field | Value |
|-------|-------|
| Actor | Collector |
| Precondition | `ar` module; open invoices |
| Flow | 1. Select customer. 2. Allocate cash/transfer/check/return to invoices. 3. Save receipt. |
| Postcondition | Invoice paid amounts updated; balance reduced |
| Legacy | `frmPaymentReceipt` |
| Status | **Partial** â€” invoice-level payment only |

---

## UC-A02: Clear post-dated cheque

| Field | Value |
|-------|-------|
| Actor | Collector |
| Precondition | Outstanding giro on customer |
| Flow | 1. A/R â†’ PDC Clearance. 2. Select giro. 3. Clear against invoices. |
| Postcondition | Giro status Cleared |
| Legacy | `frmCheckGiroClearing` |
| Status | **Missing** |

---

## UC-A03: Close A/R period

| Field | Value |
|-------|-------|
| Actor | SuperAdmin |
| Precondition | Month-end complete |
| Flow | 1. System â†’ Closing A/R Entry. 2. Select period. 3. Close. |
| Postcondition | Period locked; no back-dated AR |
| Legacy | `frmClosingAR` |
| Status | **Missing** |

---

## UC-R01: Run stock position report

| Field | Value |
|-------|-------|
| Actor | Any user with `inventory` report permission |
| Precondition | Stock data exists |
| Flow | 1. Report â†’ Inventory â†’ Stock Position. 2. Set date/warehouse filters. 3. Generate. |
| Postcondition | On-hand and committed displayed |
| Legacy | Stock position Crystal report |
| Status | **Partial** â€” UI shell |

---

## UC-SYS01: Manage user permissions

| Field | Value |
|-------|-------|
| Actor | SuperAdmin |
| Precondition | SuperAdmin role |
| Flow | 1. System â†’ Manage Users. 2. Select user. 3. Tick modules and reports. 4. Save. |
| Postcondition | User sees only permitted screens |
| Legacy | `frmEmployee`, `frmModule`, `frmUserAuthentification` |
| Status | **Implemented** |

---

## UC-SYS02: View audit history

| Field | Value |
|-------|-------|
| Actor | SuperAdmin |
| Precondition | SuperAdmin role |
| Flow | 1. System â†’ Activity History. 2. Filter by user/action/date. |
| Postcondition | Audit trail visible |
| Legacy | `SistemLog` |
| Status | **Implemented** |

---

## Permission matrix (summary)

| Use case | master | purchase | sales | inventory | ar | reports |
|----------|--------|----------|-------|-----------|-----|---------|
| UC-M01, UC-M02 | âœ“ | | | | | |
| UC-P01, UC-P02 | | âœ“ | | | | |
| UC-S01â€“S04 | | | âœ“ | | | |
| UC-I01, UC-I02 | | | | âœ“ | | |
| UC-A01â€“A03 | | | | | âœ“ | |
| UC-R01 | | | | | | inventory |
| UC-SYS01, UC-SYS02 | SuperAdmin | | | | | |

Custom permissions override role defaults per [modules/auth/flow/permissions.md](../modules/auth/flow/permissions.md).

---

## Related

- [Parity matrix](../parity/legacy-to-new-parity-matrix.md)
- [Auth overview](../modules/auth/flow/overview.md)
