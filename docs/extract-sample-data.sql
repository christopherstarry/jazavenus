-- =============================================================================
-- Jaza Venus — Sample Data Extraction Script (SQL Server)
-- =============================================================================
-- Run this against the OLD `sales` database.
--
-- STEP 1: Run the DIAGNOSTIC section below to see actual column names.
-- STEP 2: Then run the DATA section.
-- =============================================================================

USE sales;
GO

-- =============================================================================
-- STEP 1 — DIAGNOSTIC: List actual columns for each legacy table
-- =============================================================================
-- Run this first to see the REAL column names. Copy the output and send it
-- to the developer so they can fix the script below.
-- =============================================================================

SELECT '=== All tables found in sales ===' AS Info;
SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME;

PRINT '';
PRINT '--- Column details for each expected table ---';
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN (
    'Brand', 'Bank', 'Area', 'Salesman', 'Collector',
    'WarehouseType', 'OutletType', 'GroupOutlet', 'GroupOutletType',
    'TradeType', 'SubTradeType', 'DistributionType',
    'CostType', 'Manufacturing', 'Category', 'SubCategory',
    'Uom', 'PaymentTerm', 'Price', 'Discount', 'TaxNo',
    'Customer', 'CustomerAddress', 'Supplier', 'Item', 'Warehouse',
    'ItemPrice', 'ItemDiscount'
)
ORDER BY TABLE_NAME, ORDINAL_POSITION;

PRINT '';
PRINT '=== END OF DIAGNOSTIC ===';
PRINT '=== Copy the output above and share it ===';
GO

-- =============================================================================
-- STEP 2 — DATA EXTRACTION
-- =============================================================================
-- After the diagnostic shows the real column names, fix any column references
-- below that threw errors, then run this section.
-- =============================================================================

/*
PRINT '--- SAMPLE DATA ---';

-- ========================
--  LOOKUP TABLES
-- ========================

-- Brand
SELECT TOP 5 'Brand' AS Tbl, BrandCode AS Code, Dscription AS Name FROM Brand ORDER BY BrandCode;

-- Bank
SELECT TOP 5 'Bank' AS Tbl, BankCode AS Code, BankName AS Name FROM Bank ORDER BY BankCode;

-- Area
SELECT TOP 5 'Area' AS Tbl, AreaCode AS Code, Dscription AS Name FROM Area ORDER BY AreaCode;

-- Salesman
SELECT TOP 5 'Salesman' AS Tbl, SlPrsnCode AS Code, SlPrsnName AS Name FROM Salesman ORDER BY SlPrsnCode;

-- Collector
SELECT TOP 5 'Collector' AS Tbl, ClctrCode AS Code, ClctrName AS Name FROM Collector ORDER BY ClctrCode;

-- PaymentTerm
SELECT TOP 5 'PaymentTerm' AS Tbl, TermCode AS Code, Dscription AS Name, DueDays FROM PaymentTerm ORDER BY TermCode;

-- Price / PriceTier
SELECT TOP 5 'Price' AS Tbl, PriceCode AS Code, Dscription AS Name, Factor FROM Price ORDER BY PriceCode;

-- Discount / DiscountCode
SELECT TOP 5 'Discount' AS Tbl, DiscCode AS Code, Dscription AS Name FROM Discount ORDER BY DiscCode;

-- Uom
SELECT TOP 5 'Uom' AS Tbl, Code, Dscription AS Name FROM Uom ORDER BY Code;

-- Category
SELECT TOP 5 'Category' AS Tbl, CatgryCode AS Code, Dscription AS Name FROM Category ORDER BY CatgryCode;

-- Manufacturing
SELECT TOP 5 'Manufacturing' AS Tbl, MnfctrCode AS Code, Dscription AS Name FROM Manufacturing ORDER BY MnfctrCode;

-- TaxNo
SELECT TOP 5 'TaxNo' AS Tbl, RegisterNo, RegisterDate FROM TaxNo ORDER BY RegisterNo;

-- ========================
--  MASTER RECORDS
-- ========================

-- Customer
SELECT TOP 10 'Customer' AS Tbl,
    CustmrCode AS Code, CustmrName AS Name, Address, City, CredLimit AS CreditLimit
FROM Customer ORDER BY CustmrCode;

-- Supplier
SELECT TOP 10 'Supplier' AS Tbl,
    SuppCode AS Code, SuppName AS Name, Address, City
FROM Supplier ORDER BY SuppCode;

-- Item / Product
SELECT TOP 10 'Item' AS Tbl,
    ItemCode AS Code, Dscription AS Name, CodeBars AS Barcode, Aliasku AS Alias
FROM Item ORDER BY ItemCode;

-- Warehouse
SELECT TOP 10 'Warehouse' AS Tbl,
    WhsCode AS Code, Dscription AS Name, Address
FROM Warehouse ORDER BY WhsCode;

-- WarehouseType
SELECT TOP 3 'WarehouseType' AS Tbl, WhsType AS Code, Dscription AS Name FROM WarehouseType ORDER BY WhsType;

-- ========================
--  RELATIONAL
-- ========================

-- CustomerAddress
SELECT TOP 10 'CustomerAddress' AS Tbl,
    c.CustmrCode AS CustomerCode, a.AddrCode AS AddressCode, a.AddrName AS Label, a.Address
FROM CustomerAddress a
JOIN Customer c ON a.CustomerId = c.Id
ORDER BY c.CustmrCode;

-- ItemPrice
SELECT TOP 5 'ItemPrice' AS Tbl,
    i.ItemCode, ip.PriceCode, ip.Price
FROM ItemPrice ip
JOIN Item i ON ip.ItemId = i.Id
ORDER BY i.ItemCode;

-- ItemDiscount
SELECT TOP 5 'ItemDiscount' AS Tbl,
    i.ItemCode, id.DiscCode, id.Disc
FROM ItemDiscount id
JOIN Item i ON id.ItemId = i.Id
ORDER BY i.ItemCode;
*/
