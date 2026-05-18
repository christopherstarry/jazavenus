# Jaza Venus — Database Architecture

This document replaces the legacy VB+SQL Server schema with a clean, fast PostgreSQL design.

---

## 1. Source Analysis Summary

### Which databases matter

| Database | Tables | What It Is | Action |
|----------|--------|------------|--------|
| `sales` | ~159 | **The active warehouse/distribution system** | Analyze & redesign |
| `insys-common` | 13 | Access control + employees + company | Already replaced by our auth system |
| `northwind` | 14 | Microsoft sample database | Ignore |
| `pubs` | ~3 | Microsoft sample database | Ignore |
| `master` / `msdb` | — | SQL Server system | Ignore |

### The sales database — table categories

I analyzed all 159 tables and 592 stored procedures. Here's the breakdown:

| Category | Count | Examples | Row Range |
|----------|-------|----------|-----------|
| Transaction Headers | 17 | Order, Delivery, Invoice, Return, PurchaseOrder, GoodsReceipt, Transfer | 1—401,727 |
| Transaction Details | 15 | OrderDetail1, DeliveryDetail1, InvoiceDetail1, ReturnDetail1 | 1—4,935,034 |
| Master Data | 22 | Customer, Item, Supplier, Salesman, Brand, Area, Warehouse | 1—17,539 |
| Inventory | 2 | Inventory, StockTracking | 7,470—106,826 |
| AR / Payments | 8 | Receipt, ReceiptDetail1, ReceiptDetail2, Giro, GiroHistory, SaldoInvoice | 0—2,996 |
| Price System | 6 | ItemPrice, ItemDiscount, PriceHistory, TStockPrice, Price, PriceCust | 3—147,708 |
| Reporting / Temp | 30+ | Penjualan1temp, vStockCard*, PerPeriod | 0—4,836 |
| Log / Audit | 1 | SistemLog | 2,326,073 |
| Backup / Old Tables | 15+ | *bkp, *old, *temp, *New | 0—1,352,433 |
| Config / Settings | 3 | Preferences, ClosingAR, Periode | 1—6,696 |
| Obsolete / Empty | 25+ | DummyTrans, VariantHarga, 0-row tables | 0 |

---

## 2. Redundancy Report — What to Keep, Merge, or Drop

### 🗑️ DROP — Tables we ignore completely

| Legacy Table | Reason |
|-------------|--------|
| `*bkp`, `*backup`, `*Backup` | Backup/restore copies — not part of live schema |
| `*old`, `*Old`, `*OldPriceSystem` | Old data snapshots |
| `*temp`, `*Temp` | Temporary/reporting intermediates |
| `ItemPrice02042022`, `ItemPricebkp2`, `Pricebkp2`, `PriceCustbkp2`, `TStockPricebkp` | Duplicate price tables |
| `Penjualan1temp`, `Penjualan1tempx` | Temporary report data |
| `SaldoInvoiceTemp` | Temporary A/R calculation |
| `Customerold1`, `CustomerOldPriceSystem`, `MasterCustomer` | Old/duplicate customer data |
| `Plafond`, `Plafond2` | Credit limit analysis (5 rows) |
| `MSTBRG1`, `Idku`, `itemsupp` | Import/staging tables |
| `Collectorku`, `Areaku12` | Duplicate lookup |
| `InvoiceH`, `InvoiceH2`, `invoiceh1`, `ReceiptH` | Denormalized monthly summaries (now live-computed) |
| `SeriFaktur`, `SeriFakturold`, `SeriFakturCN` | Tax serial tracking (simplified) |
| `DumpDeliveryToClipper`, `LPBFaktur`, `CekExportXml*` | Export helpers |
| `CaseStock*`, `StockTrackingreport`, `StockTracking` | Reporting snapshots |
| All `vStock*` prefixed tables | Materialized views |
| `DummyTrans`, `SMSORDERH`, `SMSORDERD` | Unused |
| `PromoCust`, `ExtraDiscount`, `ExtraDiscountDetail` | Unused/moved to promotions module |
| `TVariant`, `TVarHeader`, `TVarDetail`, `VariantHarga`, `VariantPenjualan` | Price variant analysis |
| `LHPP`, `LHPPDetail1`, `LHPPDetail2` | Payment allocation (merged into receipts) |
| `FakturPjk_Print`, `alamatkirim`, `MasterCustomer`, `MSTBRG1` | Staging/import/export |
| `DeletedFiles` | Deleted record log (use proper audit_log) |
| `ParameterXml`, `DefaultParameterXml`, `AddInfoData` | XML config (not needed) |
| `ppn_*`, `Consignment`, `ConsignmentDetail1` | Unused modules |
| `AdjusmentAR`, `AdjustmentARDetail1` | AR adjustment (replaced by receipt adjustments) |

### 🔄 MERGE — Tables that should be consolidated

| Category | Legacy Tables | New Table |
|----------|-------------|-----------|
| **Customer** | Customer, CustomerAddress, CustomerInfo, Customerold1, CustomerOldPriceSystem | `customers` + `customer_addresses` |
| **Item/Product** | Item, ItemDiscount, ItemFunction, ItemSupplier, BPItem | `products` + `product_discounts` |
| **Price** | ItemPrice, ItemPriceNew, PriceHistory, Price, PriceNew, PriceCust | `product_prices` + `price_tiers` |
| **AR Invoice** | InvoiceH (monthly denorm), SaldoInvoice (monthly denorm) | Remove — compute live from `invoices` + `receipts` |
| **Giro/PDC** | Giro, GiroH, GiroHistory, ReceiptDetail2 | `post_dated_checks` |
| **Document Status** | DocStatus, ForDocument | `document_statuses` (lookup) |

### ✅ KEEP — Core business tables (clean naming)

| Legacy Name | New PostgreSQL Name | Module | Rows |
|------------|-------------------|--------|------|
| `Customer` | `customers` | Master | 17,539 |
| `CustomerAddress` | `customer_addresses` | Master | 17,576 |
| `Supplier` | `suppliers` | Master | 173 |
| `Item` | `products` | Master | 6,714 |
| `ItemPrice` | `product_prices` | Master | 147,708 |
| `ItemDiscount` | `product_discounts` | Master | 22,437 |
| `Brand` | `brands` | Master | 589 |
| `Category` | `product_categories` | Master | 8 |
| `SubCategory` | `product_sub_categories` | Master | 7 |
| `Manufacturing` | `manufacturers` | Master | 4 |
| `Salesman` | `salesmen` | Master | 256 |
| `Collector` | `collectors` | Master | 1 |
| `Area` | `areas` | Master | 16 |
| `Warehouse` | `warehouses` | Master | 15 |
| `WarehouseType` | `warehouse_types` | Master | 3 |
| `Bank` | `banks` | Master | 35 |
| `TradeType` | `trade_types` | Master | 4 |
| `SubTradeType` | `sub_trade_types` | Master | 4 |
| `DistributionType` | `distribution_types` | Master | 3 |
| `OutletType` | `outlet_types` | Master | 22 |
| `GroupOutlet` | `outlet_groups` | Master | 4 |
| `GroupOutletType` | `outlet_group_types` | Master | 10 |
| `PaymentTerm` | `payment_terms` | Master | 6 |
| `Discount` | `discount_codes` | Master | 3 |
| `Price` | `price_tiers` | Master | 22 |
| `TaxNo` | `tax_registrations` | Master | 7 |
| `Uom` | `units_of_measure` | Master | 43 |
| `Order` | `sales_orders` | Sales | 369,946 |
| `OrderDetail1` | `sales_order_lines` | Sales | 4,046,551 |
| `Delivery` | `deliveries` | Sales | 405,470 |
| `DeliveryDetail1` | `delivery_lines` | Sales | 4,935,034 |
| `Invoice` | `invoices` | Sales | 401,727 |
| `InvoiceDetail1` | `invoice_lines` | Sales | 4,896,885 |
| `Return` | `sales_returns` | Sales | 58,441 |
| `ReturnDetail1` | `sales_return_lines` | Sales | 173,520 |
| `CreditMemo` | `credit_memos` | Sales | 0 |
| `CreditMemoDetail1` | `credit_memo_lines` | Sales | 0 |
| `PurchaseOrder` | `purchase_orders` | Purchase | 849 |
| `PurchaseOrderDetail1` | `purchase_order_lines` | Purchase | 31,455 |
| `PurchaseReceive` | `goods_receipts` (GRN) | Purchase | 13,715 |
| `PurchaseReceiveDetail1` | `goods_receipt_lines` | Purchase | 240,382 |
| `PurchaseReturn` | `purchase_returns` | Purchase | 1,296 |
| `PurchaseReturnDetail1` | `purchase_return_lines` | Purchase | 29,916 |
| `GoodsReceipt` | `stock_receipts` | Inventory | 3,591 |
| `GoodsReceiptDetail1` | `stock_receipt_lines` | Inventory | 18,554 |
| `GoodsIssue` | `stock_issues` | Inventory | 1,509 |
| `GoodsIssueDetail1` | `stock_issue_lines` | Inventory | 12,393 |
| `Transfer` | `stock_transfers` | Inventory | 1,868 |
| `TransferDetail1` | `stock_transfer_lines` | Inventory | 26,831 |
| `Inventory` | `inventory_balances` | Inventory | 106,826 |
| `Receipt` | `payments` (AR) | A/R | 333,374 |
| `ReceiptDetail1` | `payment_allocations` | A/R | 412,950 |
| `Giro` | `post_dated_checks` | A/R | 2,996 |
| `Preferences` | `company_settings` | System | 5 |
| `ClosingAR` | `ar_period_closings` | System | 4 |
| `Periode` | `fiscal_periods` | System | 6,696 |
| `SistemLog` | `legacy_audit_log` | System | 2,326,073 |

---

## 3. Clean PostgreSQL Schema

### 3.1 Master Data

```sql
-- ── Customers ──

CREATE TABLE customers (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code           VARCHAR(15) NOT NULL UNIQUE,          -- CustmrCode
    name           VARCHAR(100) NOT NULL,                -- CustmrName
    address        VARCHAR(254),
    city           VARCHAR(100),
    state          VARCHAR(100),
    zip_code       VARCHAR(8),                           -- ZipCode
    area_code      CHAR(2),                              -- AreaCode
    phone1         VARCHAR(20),
    phone2         VARCHAR(20),
    fax            VARCHAR(20),
    email          VARCHAR(50),
    contact_person VARCHAR(90),                          -- CntctPrsn
    npwp_number    VARCHAR(20),                          -- NPWPNumber (tax ID)
    npwp_date      DATE,                                 -- NPWPDate
    pkp_number     VARCHAR(20),                          -- PKPNumber
    pkp_date       DATE,                                 -- PKPDate
    notes          VARCHAR(100),
    balance        NUMERIC(19,6) DEFAULT 0,              -- current AR balance
    credit_limit   NUMERIC(19,6) DEFAULT 0,              -- CredLimit
    salesman_code  CHAR(2),                              -- SlPrsnCode
    collector_code CHAR(2),                              -- ClctrCode
    distribution_type CHAR(2),                           -- DstrbnType
    trade_type     CHAR(2),                              -- TradeType
    outlet_type    CHAR(2),                              -- OutletType
    outlet_group_code CHAR(3),                           -- GrpOltCode
    outlet_group_type CHAR(2),                           -- GrpOltTypeCode
    payment_term   CHAR(3),                              -- TermCode
    discount_code  CHAR(2),                              -- DiscCode
    warehouse_code VARCHAR(8),                           -- WhsCode (default warehouse)
    price_tier     VARCHAR(8),                           -- PriceCode (default price tier)
    is_locked      BOOLEAN DEFAULT FALSE,                -- Locked
    is_active      BOOLEAN DEFAULT TRUE,
    registered_at  DATE,                                 -- Regdate
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customers_code ON customers(code);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_salesman ON customers(salesman_code);
CREATE INDEX idx_customers_collector ON customers(collector_code);
CREATE INDEX idx_customers_area ON customers(area_code);

CREATE TABLE customer_addresses (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_code   CHAR(8) NOT NULL,                     -- AddrCode
    address_name   VARCHAR(100) NOT NULL,                -- AddrName
    address        VARCHAR(254) NOT NULL,
    city           VARCHAR(100),
    state          VARCHAR(100),
    zip_code       VARCHAR(8),
    area_code      CHAR(2),
    phone1         VARCHAR(20),
    phone2         VARCHAR(20),
    fax            VARCHAR(20),
    email          VARCHAR(50),
    contact_person VARCHAR(90),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, address_code)
);

CREATE INDEX idx_customer_addresses_code ON customer_addresses(address_code);

-- ── Products ──

CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) NOT NULL UNIQUE,         -- ItemCode
    description     VARCHAR(100) NOT NULL,                -- Dscription
    alias           VARCHAR(500),                         -- Aliasku
    barcode         VARCHAR(20),                          -- CodeBars
    manufacturer_id UUID REFERENCES manufacturers(id),    -- MnfctrCode
    brand_id        UUID NOT NULL REFERENCES brands(id),  -- BrandCode
    category_id     UUID REFERENCES product_categories(id), -- CatgryCode
    sub_category_id UUID REFERENCES product_sub_categories(id), -- SubCatCode
    class_code      CHAR(2),                              -- ClassCode (pricing class)
    uom             VARCHAR(100),                         -- primary unit of measure
    uom_conversion1 NUMERIC(19,6) DEFAULT 1,             -- UOM1
    uom_conversion2 NUMERIC(19,6),                       -- UOM2
    uom_conversion3 NUMERIC(19,6),                       -- UOM3
    length          NUMERIC(19,6),
    width           NUMERIC(19,6),
    height          NUMERIC(19,6),
    weight1         NUMERIC(19,6),
    weight2         NUMERIC(19,6),
    is_salable      BOOLEAN DEFAULT TRUE,                -- SalesItem
    is_purchasable  BOOLEAN DEFAULT TRUE,                -- PurchItem
    is_returnable   BOOLEAN DEFAULT TRUE,                -- ReturnItem
    reorder_qty     NUMERIC(19,6) DEFAULT 0,             -- ReorderQty
    min_level       NUMERIC(19,6) DEFAULT 0,             -- MinLevel
    max_level       NUMERIC(19,6) DEFAULT 0,             -- MaxLevel
    item_function   CHAR(2),                              -- ItemFunction
    is_locked       BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    last_sale_date  DATE,                                 -- LstSalDate
    last_purchase_date DATE,                              -- LstPurDate
    registered_at   DATE,                                 -- RegDate
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode);

-- ── Product Prices (Merged ItemPrice + PriceHistory) ──

CREATE TABLE product_prices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price_tier  VARCHAR(8) NOT NULL,                     -- PriceCode (HJP, HPD, HET, HPP, HPDMOP, HETMOP, COST)
    price       NUMERIC(19,6) NOT NULL,
    is_current  BOOLEAN DEFAULT FALSE,                   -- CurrentPrice
    start_date  DATE NOT NULL,
    end_date    DATE,                                    -- NULL = still active
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_prices_product ON product_prices(product_id);
CREATE INDEX idx_product_prices_tier_current ON product_prices(product_id, price_tier, is_current) WHERE is_current = TRUE;

-- ── Product Discounts ──

CREATE TABLE product_discounts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    discount_type CHAR(1) NOT NULL,                      -- DiscCode ('A' = level A, etc.)
    discount    NUMERIC(19,6) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, discount_type)
);

-- ── Brand ──

CREATE TABLE brands (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(10) NOT NULL UNIQUE,             -- BrandCode
    name        VARCHAR(50) NOT NULL,                    -- Dscription
    sku_code    VARCHAR(10),                              -- SKUCode
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Product Categories ──

CREATE TABLE product_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,                 -- CatgryCode
    name        VARCHAR(50) NOT NULL,                    -- Dscription
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_sub_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,                 -- SubCatCode
    name        VARCHAR(50) NOT NULL,                    -- Dscription
    category_id UUID REFERENCES product_categories(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Manufacturers ──

CREATE TABLE manufacturers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,                 -- MnfctrCode
    name        VARCHAR(50) NOT NULL,                    -- Dscription
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Suppliers ──

CREATE TABLE suppliers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(15) NOT NULL UNIQUE,         -- SuppCode
    name            VARCHAR(100) NOT NULL,                -- SuppName
    address         VARCHAR(254),
    city            VARCHAR(100),
    state           VARCHAR(100),
    zip_code        VARCHAR(8),
    area_code       CHAR(2),
    phone1          VARCHAR(20),
    phone2          VARCHAR(20),
    fax             VARCHAR(20),
    email           VARCHAR(50),
    payment_term    CHAR(3),                             -- TermCode
    price_tier      VARCHAR(8),                           -- PriceCode
    notes           VARCHAR(100),
    salesman        VARCHAR(50),
    hp1             VARCHAR(20),
    hp2             VARCHAR(20),
    supervisor      VARCHAR(50),                         -- Atasan
    position        VARCHAR(50),                         -- Jabatan
    supervisor_hp   VARCHAR(50),                         -- HPAtasan
    npwp_number     VARCHAR(20),
    npwp_date       DATE,
    pkp_number      VARCHAR(20),
    pkp_date        DATE,
    discount_retail INT,                                 -- DiscRetail
    discount_wholesale INT,                              -- DiscJV
    payment_days_retail INT,                              -- TOPRetail
    payment_days_wholesale INT,                           -- TOPJV
    is_returnable   BOOLEAN DEFAULT TRUE,                -- Returnable
    visit_day       VARCHAR(50),                         -- HariKunjungan
    note            VARCHAR(250),
    product_line1   VARCHAR(200),                        -- ProdukJual1
    product_line2   VARCHAR(200),                        -- ProdukJual2
    is_locked       BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_name ON suppliers(name);

-- ── Salesmen / Collectors / Areas ──

CREATE TABLE salesmen (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,                 -- SlPrsnCode
    name        VARCHAR(100) NOT NULL,                   -- SlPrsnName
    target      NUMERIC(19,6) DEFAULT 0,                  -- SlTarget
    amount      NUMERIC(19,6) DEFAULT 0,                  -- SlAmount
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE collectors (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,                 -- ClctrCode
    name        VARCHAR(100) NOT NULL,                   -- ClctrName
    target_01   NUMERIC(19,6) DEFAULT 0,
    target_02   NUMERIC(19,6) DEFAULT 0,
    target_03   NUMERIC(19,6) DEFAULT 0,
    target_04   NUMERIC(19,6) DEFAULT 0,
    target_05   NUMERIC(19,6) DEFAULT 0,
    target_06   NUMERIC(19,6) DEFAULT 0,
    target_07   NUMERIC(19,6) DEFAULT 0,
    target_08   NUMERIC(19,6) DEFAULT 0,
    target_09   NUMERIC(19,6) DEFAULT 0,
    target_10   NUMERIC(19,6) DEFAULT 0,
    target_11   NUMERIC(19,6) DEFAULT 0,
    target_12   NUMERIC(19,6) DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE areas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,                 -- AreaCode
    name        VARCHAR(50) NOT NULL,                    -- Dscription
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Warehouses ──

CREATE TABLE warehouses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(8) NOT NULL UNIQUE,              -- WhsCode
    name        VARCHAR(100) NOT NULL,                   -- Dscription
    address     VARCHAR(254),
    city        VARCHAR(100),
    state       VARCHAR(100),
    zip_code    VARCHAR(8),
    type        CHAR(1),                                 -- WhsType
    is_locked   BOOLEAN DEFAULT FALSE,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE warehouse_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            CHAR(1) NOT NULL UNIQUE,             -- WhsType
    name            VARCHAR(50) NOT NULL,                -- Dscription
    check_on_hand   BOOLEAN DEFAULT TRUE,                -- CHECKONHAND
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Lookup Tables ──

CREATE TABLE banks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(4) NOT NULL UNIQUE,
    name        VARCHAR(50) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trade_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,
    name        VARCHAR(50) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sub_trade_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,
    name        VARCHAR(50) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE distribution_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,
    name        VARCHAR(50) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE outlet_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,
    name        VARCHAR(50) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE outlet_groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            CHAR(3) NOT NULL UNIQUE,
    name            VARCHAR(50) NOT NULL,
    group_type_code CHAR(2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE outlet_group_types (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,
    name        VARCHAR(50) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_terms (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(3) NOT NULL UNIQUE,
    name        VARCHAR(30),
    credit_limit NUMERIC(19,6),
    due_days    INT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE discount_codes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        CHAR(2) NOT NULL UNIQUE,
    name        VARCHAR(50),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE price_tiers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(8) NOT NULL UNIQUE,
    name        VARCHAR(50) NOT NULL,
    factor      NUMERIC(19,6) NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tax_registrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_no INT NOT NULL UNIQUE,
    register_date   DATE NOT NULL,
    ref1            VARCHAR(50),
    ref2            VARCHAR(50),
    comments        VARCHAR(50),
    from_no         INT NOT NULL,
    to_no           INT NOT NULL,
    no_counted      INT DEFAULT 0,
    no_used         INT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE units_of_measure (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        INT NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2 Transaction Tables (Sales)

```sql
-- ── Sales Orders ──

CREATE TABLE sales_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_num         INT NOT NULL UNIQUE,
    doc_date        DATE NOT NULL,
    doc_due_date    DATE,
    doc_status      CHAR(1) NOT NULL DEFAULT 'O',        -- O=Open, C=Closed, B=Cancelled
    is_printed      BOOLEAN DEFAULT FALSE,
    warehouse_id    UUID REFERENCES warehouses(id),
    price_tier      VARCHAR(8),
    customer_id     UUID NOT NULL REFERENCES customers(id),
    customer_name   VARCHAR(100) NOT NULL,
    address         VARCHAR(254),
    address_code    CHAR(8),
    ship_to_address VARCHAR(254),
    salesman_id     UUID REFERENCES salesmen(id),
    collector_id    UUID REFERENCES collectors(id),
    vat_percent     NUMERIC(19,6) DEFAULT 0,
    vat_amount      NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    extra_discount  NUMERIC(19,6) DEFAULT 0,
    total_amount    NUMERIC(19,6) DEFAULT 0,
    paid_amount     NUMERIC(19,6) DEFAULT 0,
    payment_term_id UUID REFERENCES payment_terms(id),
    ref1            VARCHAR(30),
    ref2            VARCHAR(30),
    comments        VARCHAR(254),
    division        VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_date ON sales_orders(doc_date);
CREATE INDEX idx_sales_orders_status ON sales_orders(doc_status);
CREATE INDEX idx_sales_orders_created ON sales_orders(created_at);

CREATE TABLE sales_order_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    line_num        INT NOT NULL,
    product_id      UUID NOT NULL REFERENCES products(id),
    product_desc    VARCHAR(100) NOT NULL,
    quantity        NUMERIC(19,6) NOT NULL,
    shipped_qty     NUMERIC(19,6) DEFAULT 0,
    price           NUMERIC(19,6) NOT NULL,
    cost            NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    is_bonus        BOOLEAN DEFAULT FALSE,
    line_total      NUMERIC(19,6) NOT NULL,
    line_status     CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    ship_date       DATE,
    base_ref        VARCHAR(30),
    base_type       INT,
    base_entry      INT,
    base_line       INT,
    base_qty        NUMERIC(19,6),
    vis_order       INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(order_id, line_num)
);

-- ── Deliveries ──

CREATE TABLE deliveries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_num         INT NOT NULL UNIQUE,
    doc_date        DATE NOT NULL,
    doc_due_date    DATE,
    doc_status      CHAR(1) NOT NULL DEFAULT 'O',
    is_printed      BOOLEAN DEFAULT FALSE,
    warehouse_id    UUID REFERENCES warehouses(id),
    price_tier      VARCHAR(8),
    customer_id     UUID NOT NULL REFERENCES customers(id),
    customer_name   VARCHAR(100) NOT NULL,
    address         VARCHAR(254),
    address_code    CHAR(8),
    ship_to_address VARCHAR(254),
    salesman_id     UUID REFERENCES salesmen(id),
    collector_id    UUID REFERENCES collectors(id),
    vat_percent     NUMERIC(19,6) DEFAULT 0,
    vat_amount      NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    extra_discount  NUMERIC(19,6) DEFAULT 0,
    total_amount    NUMERIC(19,6) DEFAULT 0,
    paid_amount     NUMERIC(19,6) DEFAULT 0,
    payment_term_id UUID REFERENCES payment_terms(id),
    ref1            VARCHAR(30),
    ref2            VARCHAR(30),
    comments        VARCHAR(254),
    division        VARCHAR(50),
    print_counter   INT DEFAULT 0,
    register_no     INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deliveries_customer ON deliveries(customer_id);
CREATE INDEX idx_deliveries_date ON deliveries(doc_date);

CREATE TABLE delivery_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id     UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    line_num        INT NOT NULL,
    product_id      UUID NOT NULL REFERENCES products(id),
    product_desc    VARCHAR(100) NOT NULL,
    quantity        NUMERIC(19,6) NOT NULL,
    shipped_qty     NUMERIC(19,6) DEFAULT 0,
    price           NUMERIC(19,6) NOT NULL,
    cost            NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    is_bonus        BOOLEAN DEFAULT FALSE,
    line_total      NUMERIC(19,6) NOT NULL,
    line_status     CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    ship_date       DATE,
    base_ref        VARCHAR(30),
    base_type       INT,
    base_entry      INT,
    base_line       INT,
    base_qty        NUMERIC(19,6),
    pick_status     CHAR(1),
    pick_id         INT,
    pick_qty        NUMERIC(19,6),
    vis_order       INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(delivery_id, line_num)
);

-- ── Invoices ──

CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_num         INT NOT NULL UNIQUE,
    doc_date        DATE NOT NULL,
    doc_due_date    DATE,
    doc_status      CHAR(1) NOT NULL DEFAULT 'O',
    is_printed      BOOLEAN DEFAULT FALSE,
    warehouse_id    UUID REFERENCES warehouses(id),
    price_tier      VARCHAR(8),
    customer_id     UUID NOT NULL REFERENCES customers(id),
    customer_name   VARCHAR(100) NOT NULL,
    address         VARCHAR(254),
    address_code    CHAR(8),
    ship_to_address VARCHAR(254),
    salesman_id     UUID REFERENCES salesmen(id),
    collector_id    UUID REFERENCES collectors(id),
    vat_percent     NUMERIC(19,6) DEFAULT 0,
    vat_amount      NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    extra_discount  NUMERIC(19,6) DEFAULT 0,
    total_amount    NUMERIC(19,6) DEFAULT 0,
    paid_amount     NUMERIC(19,6) DEFAULT 0,
    payment_term_id UUID REFERENCES payment_terms(id),
    ref1            VARCHAR(30),
    ref2            VARCHAR(30),
    comments        VARCHAR(254),
    division        VARCHAR(50),
    tax_serial      CHAR(10),                            -- NoSeri
    print_counter   INT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_date ON invoices(doc_date);
CREATE INDEX idx_invoices_status ON invoices(doc_status);
CREATE INDEX idx_invoices_created ON invoices(created_at);

CREATE TABLE invoice_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    line_num        INT NOT NULL,
    product_id      UUID NOT NULL REFERENCES products(id),
    product_desc    VARCHAR(100) NOT NULL,
    quantity        NUMERIC(19,6) NOT NULL,
    price           NUMERIC(19,6) NOT NULL,
    cost            NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    is_bonus        BOOLEAN DEFAULT FALSE,
    line_total      NUMERIC(19,6) NOT NULL,
    line_status     CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    ship_date       DATE,
    base_ref        VARCHAR(30),
    base_type       INT,
    base_entry      INT,
    base_line       INT,
    base_qty        NUMERIC(19,6),
    pick_status     CHAR(1),
    pick_id         INT,
    pick_qty        NUMERIC(19,6),
    vis_order       INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(invoice_id, line_num)
);

-- ── Sales Returns ──

CREATE TABLE sales_returns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_num         INT NOT NULL UNIQUE,
    doc_date        DATE NOT NULL,
    doc_due_date    DATE,
    doc_status      CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    price_tier      VARCHAR(8),
    customer_id     UUID NOT NULL REFERENCES customers(id),
    customer_name   VARCHAR(100) NOT NULL,
    address         VARCHAR(254),
    address_code    CHAR(8),
    ship_to_address VARCHAR(254),
    salesman_id     UUID REFERENCES salesmen(id),
    collector_id    UUID REFERENCES collectors(id),
    vat_percent     NUMERIC(19,6) DEFAULT 0,
    vat_amount      NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    extra_discount  NUMERIC(19,6) DEFAULT 0,
    total_amount    NUMERIC(19,6) DEFAULT 0,
    paid_amount     NUMERIC(19,6) DEFAULT 0,
    payment_term_id UUID REFERENCES payment_terms(id),
    ref1            VARCHAR(30),
    ref2            VARCHAR(30),
    comments        VARCHAR(254),
    division        VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sales_return_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id       UUID NOT NULL REFERENCES sales_returns(id) ON DELETE CASCADE,
    line_num        INT NOT NULL,
    product_id      UUID NOT NULL REFERENCES products(id),
    product_desc    VARCHAR(100) NOT NULL,
    quantity        NUMERIC(19,6) NOT NULL,
    price           NUMERIC(19,6),
    cost            NUMERIC(19,6),
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    is_bonus        BOOLEAN DEFAULT FALSE,
    line_total      NUMERIC(19,6),
    line_status     CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    base_ref        VARCHAR(30),
    base_type       INT,
    base_entry      INT,
    base_line       INT,
    base_qty        NUMERIC(19,6),
    pick_status     CHAR(1),
    pick_qty        NUMERIC(19,6),
    vis_order       INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(return_id, line_num)
);

-- ── Credit Memos (CN) ──

CREATE TABLE credit_memos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_num         INT NOT NULL UNIQUE,
    doc_date        DATE NOT NULL,
    doc_due_date    DATE,
    doc_status      CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    price_tier      VARCHAR(8),
    customer_id     UUID NOT NULL REFERENCES customers(id),
    customer_name   VARCHAR(100) NOT NULL,
    address         VARCHAR(254),
    address_code    CHAR(8),
    ship_to_address VARCHAR(254),
    salesman_id     UUID REFERENCES salesmen(id),
    collector_id    UUID REFERENCES collectors(id),
    vat_percent     NUMERIC(19,6) DEFAULT 0,
    vat_amount      NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    extra_discount  NUMERIC(19,6) DEFAULT 0,
    total_amount    NUMERIC(19,6) DEFAULT 0,
    paid_amount     NUMERIC(19,6) DEFAULT 0,
    payment_term_id UUID REFERENCES payment_terms(id),
    ref1            VARCHAR(30),
    ref2            VARCHAR(30),
    comments        VARCHAR(254),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE credit_memo_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_memo_id  UUID NOT NULL REFERENCES credit_memos(id) ON DELETE CASCADE,
    line_num        INT NOT NULL,
    product_id      UUID NOT NULL REFERENCES products(id),
    product_desc    VARCHAR(100) NOT NULL,
    quantity        NUMERIC(19,6) NOT NULL,
    price           NUMERIC(19,6) NOT NULL,
    cost            NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    is_bonus        BOOLEAN DEFAULT FALSE,
    line_total      NUMERIC(19,6) NOT NULL,
    line_status     CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    ship_date       DATE,
    base_ref        VARCHAR(30),
    base_type       INT,
    base_entry      INT,
    base_line       INT,
    base_qty        NUMERIC(19,6),
    pick_status     CHAR(1),
    pick_qty        NUMERIC(19,6),
    vis_order       INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(credit_memo_id, line_num)
);
```

### 3.3 Purchase Transactions

```sql
-- ── Purchase Orders ──

CREATE TABLE purchase_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_num         INT NOT NULL UNIQUE,
    doc_date        DATE NOT NULL,
    doc_due_date    DATE,
    doc_status      CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    price_tier      VARCHAR(8),
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    supplier_name   VARCHAR(100) NOT NULL,
    address         VARCHAR(254),
    address_code    CHAR(8),
    ship_to_address VARCHAR(254),
    salesman_id     UUID REFERENCES salesmen(id),
    collector_id    UUID REFERENCES collectors(id),
    vat_percent     NUMERIC(19,6) DEFAULT 0,
    vat_amount      NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    extra_discount  NUMERIC(19,6) DEFAULT 0,
    total_amount    NUMERIC(19,6) DEFAULT 0,
    paid_amount     NUMERIC(19,6) DEFAULT 0,
    payment_term_id UUID REFERENCES payment_terms(id),
    ref1            VARCHAR(30),
    ref2            VARCHAR(30),
    comments        VARCHAR(254),
    division        VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE purchase_order_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    line_num        INT NOT NULL,
    product_id      UUID NOT NULL REFERENCES products(id),
    product_desc    VARCHAR(100) NOT NULL,
    quantity        NUMERIC(19,6) NOT NULL,
    received_qty    NUMERIC(19,6) DEFAULT 0,
    price           NUMERIC(19,6) NOT NULL,
    cost            NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    is_bonus        BOOLEAN DEFAULT FALSE,
    line_total      NUMERIC(19,6) NOT NULL,
    line_status     CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    ship_date       DATE,
    base_ref        VARCHAR(30),
    base_type       INT,
    base_entry      INT,
    base_line       INT,
    base_qty        NUMERIC(19,6),
    vis_order       INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(order_id, line_num)
);

-- ── Goods Receipts (GRN / BPB) ──

CREATE TABLE goods_receipts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_num         INT NOT NULL UNIQUE,
    doc_date        DATE NOT NULL,
    doc_due_date    DATE,
    doc_status      CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    price_tier      VARCHAR(8),
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    supplier_name   VARCHAR(100) NOT NULL,
    address         VARCHAR(254),
    address_code    CHAR(8),
    ship_to_address VARCHAR(254),
    salesman_id     UUID REFERENCES salesmen(id),
    collector_id    UUID REFERENCES collectors(id),
    vat_percent     NUMERIC(19,6) DEFAULT 0,
    vat_amount      NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    extra_discount  NUMERIC(19,6) DEFAULT 0,
    total_amount    NUMERIC(19,6) DEFAULT 0,
    paid_amount     NUMERIC(19,6) DEFAULT 0,
    payment_term_id UUID REFERENCES payment_terms(id),
    ref1            VARCHAR(30),
    ref2            VARCHAR(30),
    comments        VARCHAR(254),
    division        VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE goods_receipt_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id      UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    line_num        INT NOT NULL,
    product_id      UUID NOT NULL REFERENCES products(id),
    product_desc    VARCHAR(100) NOT NULL,
    quantity        NUMERIC(19,6) NOT NULL,
    price           NUMERIC(19,6) NOT NULL,
    cost            NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    is_bonus        BOOLEAN DEFAULT FALSE,
    line_total      NUMERIC(19,6) NOT NULL,
    line_status     CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    ship_date       DATE,
    base_ref        VARCHAR(30),
    base_type       INT,
    base_entry      INT,
    base_line       INT,
    base_qty        NUMERIC(19,6),
    vis_order       INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(receipt_id, line_num)
);

-- ── Purchase Returns ──

CREATE TABLE purchase_returns (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_num         INT NOT NULL UNIQUE,
    doc_date        DATE NOT NULL,
    doc_due_date    DATE,
    doc_status      CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    price_tier      VARCHAR(8),
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    supplier_name   VARCHAR(100) NOT NULL,
    address         VARCHAR(254),
    address_code    CHAR(8),
    ship_to_address VARCHAR(254),
    salesman_id     UUID REFERENCES salesmen(id),
    collector_id    UUID REFERENCES collectors(id),
    vat_percent     NUMERIC(19,6) DEFAULT 0,
    vat_amount      NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    extra_discount  NUMERIC(19,6) DEFAULT 0,
    total_amount    NUMERIC(19,6) DEFAULT 0,
    paid_amount     NUMERIC(19,6) DEFAULT 0,
    payment_term_id UUID REFERENCES payment_terms(id),
    ref1            VARCHAR(30),
    ref2            VARCHAR(30),
    comments        VARCHAR(254),
    division        VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE purchase_return_lines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id       UUID NOT NULL REFERENCES purchase_returns(id) ON DELETE CASCADE,
    line_num        INT NOT NULL,
    product_id      UUID NOT NULL REFERENCES products(id),
    product_desc    VARCHAR(100) NOT NULL,
    quantity        NUMERIC(19,6) NOT NULL,
    price           NUMERIC(19,6) NOT NULL,
    cost            NUMERIC(19,6) DEFAULT 0,
    discount1       NUMERIC(19,6) DEFAULT 0,
    discount2       NUMERIC(19,6) DEFAULT 0,
    discount3       NUMERIC(19,6) DEFAULT 0,
    is_bonus        BOOLEAN DEFAULT FALSE,
    line_total      NUMERIC(19,6) NOT NULL,
    line_status     CHAR(1) NOT NULL DEFAULT 'O',
    warehouse_id    UUID REFERENCES warehouses(id),
    ship_date       DATE,
    base_ref        VARCHAR(30),
    base_type       INT,
    base_entry      INT,
    base_line       INT,
    base_qty        NUMERIC(19,6),
    vis_order       INT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(return_id, line_num)
);
```

### 3.4 Inventory

```sql
-- ── Inventory Balances ──

CREATE TABLE inventory_balances (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID NOT NULL REFERENCES products(id),
    warehouse_id  UUID NOT NULL REFERENCES warehouses(id),
    location      VARCHAR(8),
    on_hand       NUMERIC(19,6) NOT NULL DEFAULT 0,
    committed     NUMERIC(19,6) NOT NULL DEFAULT 0,
    consignment   NUMERIC(19,6) NOT NULL DEFAULT 0,
    on_order      NUMERIC(19,6) NOT NULL DEFAULT 0,
    counted       NUMERIC(19,6) DEFAULT 0,
    was_counted   BOOLEAN DEFAULT FALSE,
    min_stock     NUMERIC(19,6) DEFAULT 0,
    max_stock     NUMERIC(19,6) DEFAULT 0,
    min_order     NUMERIC(19,6) DEFAULT 0,
    is_locked     BOOLEAN DEFAULT FALSE,
    track_date    DATE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, warehouse_id)
);

CREATE INDEX idx_inventory_product ON inventory_balances(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory_balances(warehouse_id);
CREATE INDEX idx_inventory_onhand ON inventory_balances(warehouse_id, on_hand) WHERE on_hand > 0;

-- ── Stock Movements (unified goods receipt/issue/transfer) ──

CREATE TABLE stock_receipts (
    -- same structure as goods_receipts
    LIKE goods_receipts INCLUDING ALL
);

CREATE TABLE stock_receipt_lines (
    LIKE goods_receipt_lines INCLUDING ALL
);

CREATE TABLE stock_issues (
    LIKE sales_orders INCLUDING ALL  -- same header structure
);

CREATE TABLE stock_issue_lines (
    LIKE sales_order_lines INCLUDING ALL
);

CREATE TABLE stock_transfers (
    LIKE sales_orders INCLUDING ALL
);

CREATE TABLE stock_transfer_lines (
    LIKE sales_order_lines INCLUDING ALL
);
```

### 3.5 Accounts Receivable (A/R)

```sql
-- ── Payments (Receipts) ──

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_num         INT NOT NULL UNIQUE,
    doc_date        DATE NOT NULL,
    doc_due_date    DATE,
    customer_id     UUID NOT NULL REFERENCES customers(id),
    customer_name   VARCHAR(100) NOT NULL,
    address         VARCHAR(254),
    collector_id    UUID REFERENCES collectors(id),
    cash_amount     NUMERIC(19,6) DEFAULT 0,
    transfer_amount NUMERIC(19,6) DEFAULT 0,
    other_amount    NUMERIC(19,6) DEFAULT 0,
    return_amount   NUMERIC(19,6) DEFAULT 0,
    check_amount    NUMERIC(19,6) DEFAULT 0,
    total_amount    NUMERIC(19,6) DEFAULT 0,
    ref1            VARCHAR(30),
    ref2            VARCHAR(30),
    comments        VARCHAR(254),
    division        VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_date ON payments(doc_date);

CREATE TABLE payment_allocations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id      UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    line_num        INT NOT NULL,
    invoice_num     INT NOT NULL,
    invoice_date    DATE NOT NULL,
    invoice_amount  NUMERIC(19,6) NOT NULL,
    cash_applied    NUMERIC(19,6) DEFAULT 0,
    transfer_applied NUMERIC(19,6) DEFAULT 0,
    other_applied   NUMERIC(19,6) DEFAULT 0,
    return_applied  NUMERIC(19,6) DEFAULT 0,
    adjust_applied  NUMERIC(19,6) DEFAULT 0,
    check_applied   NUMERIC(19,6) DEFAULT 0,
    check_number    VARCHAR(20),
    comments        VARCHAR(250),
    division        VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(payment_id, line_num)
);

-- ── Post-Dated Checks (Giro) ──

CREATE TABLE post_dated_checks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customers(id),
    check_number    VARCHAR(20) NOT NULL,
    check_date      DATE NOT NULL,
    bank_id         UUID NOT NULL REFERENCES banks(id),
    amount          NUMERIC(19,6) NOT NULL,
    amount_used     NUMERIC(19,6) DEFAULT 0,
    clear_date      DATE,
    status          CHAR(1) NOT NULL DEFAULT 'O',       -- O=Outstanding, C=Cleared, X=Cancelled
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(check_number, bank_id)
);

CREATE INDEX idx_pdc_customer ON post_dated_checks(customer_id);
CREATE INDEX idx_pdc_status ON post_dated_checks(status);

-- ── AR Period Closing ──

CREATE TABLE ar_period_closings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year            INT NOT NULL,
    month           INT NOT NULL,
    last_closing    DATE,
    closing_date    DATE NOT NULL,
    next_period     DATE,
    is_closed       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(year, month)
);
```

### 3.6 System / Settings

```sql
-- ── Company Settings ──

CREATE TABLE company_settings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          VARCHAR(20) NOT NULL UNIQUE,
    company_name        VARCHAR(100) NOT NULL,
    address             VARCHAR(254),
    city                VARCHAR(100),
    state               VARCHAR(100),
    zip_code            VARCHAR(8),
    phone1              VARCHAR(20),
    phone2              VARCHAR(20),
    fax                 VARCHAR(20),
    email               VARCHAR(50),
    manager             VARCHAR(50),
    finance_supervisor  VARCHAR(50),
    edp_officer         VARCHAR(50),
    npwp_number         VARCHAR(50),
    pkp_date            DATE,
    next_order_num      INT DEFAULT 1,
    next_delivery_num   INT DEFAULT 1,
    next_return_num     INT DEFAULT 1,
    next_invoice_num    INT DEFAULT 1,
    next_po_num         INT DEFAULT 1,
    next_grn_num        INT DEFAULT 1,
    next_prn_num        INT DEFAULT 1,
    next_transfer_num   INT DEFAULT 1,
    next_stock_issue_num INT DEFAULT 1,
    next_stock_receipt_num INT DEFAULT 1,
    next_credit_memo_num INT DEFAULT 1,
    next_receipt_num    INT DEFAULT 1,
    next_register_num   INT DEFAULT 1,
    serial_prefix1      CHAR(5),
    serial_prefix2      CHAR(3),
    last_monthly_price  DATE,
    last_monthly_ar     DATE,
    tax_date_1month     BOOLEAN DEFAULT FALSE,
    log_services        BOOLEAN DEFAULT FALSE,
    is_head_office      BOOLEAN DEFAULT TRUE,
    back_order_enabled  BOOLEAN DEFAULT FALSE,
    division            VARCHAR(50),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Fiscal Periods ──

CREATE TABLE fiscal_periods (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_date NUMERIC(9) NOT NULL,                     -- Tanggal (numeric date)
    month       NUMERIC(9) NOT NULL,
    year        NUMERIC(9) NOT NULL,
    UNIQUE(period_date)
);

CREATE INDEX idx_fiscal_periods_ym ON fiscal_periods(year, month);
```

---

## 4. Column Mapping Reference (Legacy → New)

### Customer columns

| Legacy Column | New Column | Type Change |
|-------------|-----------|------------|
| `CustmrCode` (varchar 15) | `code` (varchar 15) | Same |
| `CustmrName` (varchar 100) | `name` (varchar 100) | Same |
| `urut` (int) | Removed | Auto-generated sort |
| `SlPrsnCode` (char 2) | `salesman_id` (UUID FK) | Foreign key |
| `ClctrCode` (char 2) | `collector_id` (UUID FK) | Foreign key |
| `AreaCode` (char 2) | `area_code` (char 2) | Same — lookup |
| `DstrbnType` (char 2) | `distribution_type` (char 2) | Same |
| `TradeType` (char 2) | `trade_type` (char 2) | Same |
| `OutletType` (char 2) | `outlet_type` (char 2) | Same |
| `GrpOltCode` (char 3) | `outlet_group_code` (char 3) | Same |
| `GrpOltTypeCode` (char 2) | `outlet_group_type` (char 2) | Same |
| `TermCode` (char 3) | `payment_term` (char 3) | Same |
| `DiscCode` (char 2) | `discount_code` (char 2) | Same |
| `PriceCode` (varchar 8) | `price_tier` (varchar 8) | Same |

### Transaction header columns (shared pattern)

All transaction headers (Order, Delivery, Invoice, Return, PO, GRN, Transfer) share the same column structure in the legacy system. The new schema standardizes them:

| Legacy Column | New Column | Notes |
|-------------|-----------|-------|
| `DocEntry` (int identity) | `id` (UUID) | Auto-generated |
| `DocNum` (int) | `doc_num` (int) | Keep sequential for familiarity |
| `DocDate` (datetime) | `doc_date` (date) | Time part removed |
| `DocDueDate` (datetime) | `doc_due_date` (date) | |
| `DocStatus` (char 1) | `doc_status` (char 1) | O=Open, C=Closed, B=Cancelled |
| `Printed` (char 1) | `is_printed` (bool) | |
| `ObjType` (smallint) | Removed | Replaced by actual table |
| `Filler` (varchar 8) | Removed | Unused |
| `AuditDate` (datetime) | `updated_at` (timestamptz) | |
| `AuditUser` (char 8) | `updated_by` (UUID → app_users) | |
| `BackupSts` (char 1) | Removed | No sync needed |

### Item/Product columns

| Legacy Column | New Column | Notes |
|-------------|-----------|-------|
| `ItemCode` (varchar 20) | `code` (varchar 20) | |
| `Dscription` (varchar 100) | `description` (varchar 100) | Fixed typo |
| `Aliasku` (varchar 500) | `alias` (varchar 500) | |
| `CodeBars` (varchar 20) | `barcode` (varchar 20) | |
| `MnfctrCode` (varchar 50) | `manufacturer_id` (UUID FK) | FK to manufacturers |
| `BrandCode` (varchar 10) | `brand_id` (UUID FK) | FK to brands |
| `CatgryCode` (char 2) | `category_id` (UUID FK) | FK to product_categories |
| `SubCatCode` (char 2) | `sub_category_id` (UUID FK) | FK to product_sub_categories |
| `SalesItem` (char 1) | `is_salable` (bool) | |
| `PurchItem` (char 1) | `is_purchasable` (bool) | |
| `ReturnItem` (char 1) | `is_returnable` (bool) | |
| `Locked` (char 1) | `is_locked` (bool) | |

---

## 5. Index Strategy — What Made Queries Fast

### Every table gets these indexes:

1. **Primary key** → UUID (auto)
2. **Unique constraint** on `doc_num` for all transaction tables
3. **FK indexes** on ALL foreign key columns
4. **Date indexes** on `doc_date` for all transaction tables
5. **Status indexes** on `doc_status` for all transaction tables
6. **Composite indexes** for common queries discovered from stored procedures

### Critical composite indexes:

```sql
-- Most common query pattern: filter by date + customer + brand
CREATE INDEX idx_invoices_customer_date ON invoices(customer_id, doc_date);

-- Most common aggregation: monthly sales by brand
CREATE INDEX idx_invoice_lines_brand ON invoice_lines(product_id);

-- Inventory lookups
CREATE INDEX idx_inventory_available ON inventory_balances(warehouse_id, product_id, on_hand);

-- Payment lookups
CREATE INDEX idx_payment_allocations_invoice ON payment_allocations(invoice_num);
```

---

## 6. Legacy Stored Procedures — What They Tell Us

From the 592 stored procedures in the `sales` database, the key patterns are:

### Document Number Generation
- `spGetNewDocNum*` — generates sequential doc numbers per division/period
- → **New approach**: PostgreSQL SEQUENCE per document type + year

### CRUD Operations
- Every table has `spInsert*`, `spUpdate*`, `spDelete*`, `spGet*` stored procs
- → **New approach**: EF Core handles this automatically — no SPs needed

### Business Logic in SPs (must be preserved as application logic)
- `spUpdateDeliveryStatus` — cascade status updates (delivery → invoice)
- `spUpdateOrderStatus` — auto-close order when all lines delivered
- `spInsertInvoicehGiroClearing` — PDC clearing affects AR
- `spMonthlyProcess` — monthly aggregation
- `spAdjustmentARProcess` — AR adjustment calculation
- `UpdateConsignCommited` — inventory commitment update

These will become **EF Core service methods** in `Jaza.Application`, not database triggers.

---

## 7. What's Different from the Legacy

| Legacy | New |
|--------|-----|
| `DocEntry` (int identity, auto-increment) | `id` (UUID, gen_random_uuid) |
| `AuditDate` + `AuditUser` on every table | Created by `audit_log` trigger + `created_at` / `updated_at` |
| Zero foreign keys (all char codes) | Proper UUID FKs with cascading deletes |
| String-based lookups (char(2) area codes) | Reference tables with FKs |
| Monthly denormalized tables (InvoiceH) | Live queries with proper indexes |
| Price history in separate table | `product_prices` with `is_current` flag |
| Backup tables for versioning | PostgreSQL WAL + proper migrations |
