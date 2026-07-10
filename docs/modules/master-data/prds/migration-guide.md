# Master Data — Migration Export Guide

Which tables to export from the old `sales` database for testing/import.

---

## Export These Tables

Run this on the old SQL Server (Query Analyzer) to export test data. Export to CSV if possible, or copy result grids.

### 1. Customer-Related

```sql
-- Customers (17,539 rows)
SELECT * FROM Customer;

-- Customer Addresses (17,576 rows)
SELECT * FROM CustomerAddress;

-- Salesmen (256 rows)
SELECT * FROM Salesman;

-- Collectors
SELECT * FROM Collector;

-- Areas
SELECT * FROM Area;
```

### 2. Product-Related

```sql
-- Products (6,714 rows)
SELECT * FROM Item;

-- Brands (589 rows)
SELECT * FROM Brand;

-- Categories (8 rows)
SELECT * FROM Category;

-- Sub Categories (7 rows)
SELECT * FROM SubCategory;

-- Manufacturers
SELECT * FROM Manufacturing;

-- Item Prices (147,708 rows — large, export top 5000 for testing)
SELECT TOP 5000 * FROM ItemPrice WHERE CurrentPrice = 'Y';

-- Item Discounts
SELECT * FROM ItemDiscount;

-- Item Functions
SELECT * FROM ItemFunction;

-- Units of Measure
SELECT * FROM Uom;

-- Price Tiers
SELECT * FROM Price;
```

### 3. Lookup Tables (Small — Export All)

```sql
-- Banks (35 rows)
SELECT * FROM Bank;

-- Payment Terms (6 rows)
SELECT * FROM PaymentTerm;

-- Tax Registrations (7 rows)
SELECT * FROM TaxNo;

-- Trade Types (4 rows)
SELECT * FROM TradeType;

-- Sub Trade Types (4 rows)
SELECT * FROM SubTradeType;

-- Distribution Types (3 rows)
SELECT * FROM DistributionType;

-- Outlet Types (22 rows)
SELECT * FROM OutletType;

-- Outlet Groups (4 rows)
SELECT * FROM GroupOutlet;

-- Outlet Group Types (10 rows)
SELECT * FROM GroupOutletType;

-- Discount Codes (3 rows)
SELECT * FROM Discount;
```

### 4. Warehouse-Related

```sql
-- Warehouses (15 rows)
SELECT * FROM Warehouse;

-- Warehouse Types (3 rows)
SELECT * FROM WarehouseType;
```

### 5. Company Settings

```sql
-- Company Preferences (5 rows)
SELECT * FROM Preferences;
```

---

## Export Priority

| Priority | Tables | Why |
|----------|--------|-----|
| 🔴 **Critical** | Customer, Item, Brand, Category, SubCategory, Salesman, Area, Warehouse | Core master data — app won't work without them |
| 🟡 **Important** | ItemPrice, ItemDiscount, CustomerAddress, Supplier, Bank, PaymentTerm | Frequently used in transactions |
| 🟢 **Nice to have** | Collectors, TradeType, SubTradeType, DistributionType, OutletType, GroupOutlet, GroupOutletType, Discount, Price, Uom, TaxNo, WarehouseType, Preferences, Manufacturers, ItemFunction | Small lookup tables |

---

## Export Method (Query Analyzer on Windows XP)

1. Open Query Analyzer → connect to `sales` database
2. Press **Ctrl+T** (Results to Text)
3. Run each query above
4. Copy results → paste to Notepad → save as CSV with `|` separator
5. Or use the "Save Results As" feature (if available)

For large tables (ItemPrice = 147k rows), export only the first 5,000 for testing.
