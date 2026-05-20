-- =============================================================================
-- Jaza Venus — Sample Data Extraction Script (SQL Server)
-- =============================================================================
-- Run this against the OLD `sales` database.
-- Column names verified against INFORMATION_SCHEMA (2026-05-19).
-- =============================================================================

USE sales;
GO

PRINT '=== SALES database — Sample Data ===';
PRINT '';

-- =============================================================================
-- 1.  SIMPLE LOOKUP TABLES  (3-5 rows each)
-- =============================================================================

-- Brand (589 rows)
SELECT TOP 5 'Brand' AS Tbl, BrandCode AS Code, Dscription AS Name FROM Brand ORDER BY BrandCode;

-- Bank (35 rows)
SELECT TOP 5 'Bank' AS Tbl, BankCode AS Code, BankName AS Name FROM Bank ORDER BY BankCode;

-- Area (16 rows)
SELECT TOP 5 'Area' AS Tbl, AreaCode AS Code, Dscription AS Name FROM Area ORDER BY AreaCode;

-- Salesman (256 rows)
SELECT TOP 5 'Salesman' AS Tbl, SlPrsnCode AS Code, SlPrsnName AS Name, SlTarget, SlAmount FROM Salesman ORDER BY SlPrsnCode;

-- Collector (1 row)
SELECT 'Collector' AS Tbl, ClctrCode AS Code, ClctrName AS Name FROM Collector;

-- WarehouseType (3 rows)
SELECT TOP 3 'WarehouseType' AS Tbl, WhsType AS Code, Dscription AS Name, CHECKONHAND FROM WarehouseType ORDER BY WhsType;

-- OutletType (22 rows)
SELECT TOP 5 'OutletType' AS Tbl, OutletType AS Code, Dscription AS Name FROM OutletType ORDER BY OutletType;

-- GroupOutlet (4 rows)
SELECT TOP 4 'GroupOutlet' AS Tbl, GrpOltCode AS Code, Dscription AS Name FROM GroupOutlet ORDER BY GrpOltCode;

-- GroupOutletType (10 rows)
SELECT TOP 5 'GroupOutletType' AS Tbl, GrpOltTypeCode AS Code, Dscription AS Name FROM GroupOutletType ORDER BY GrpOltTypeCode;

-- TradeType (4 rows)
SELECT TOP 4 'TradeType' AS Tbl, TradeType AS Code, Dscription AS Name FROM TradeType ORDER BY TradeType;

-- SubTradeType (4 rows)
SELECT TOP 4 'SubTradeType' AS Tbl, SubTradeType AS Code, Dscription AS Name FROM SubTradeType ORDER BY SubTradeType;

-- DistributionType (3 rows)
SELECT TOP 3 'DistributionType' AS Tbl, DstrbnType AS Code, Dscription AS Name FROM DistributionType ORDER BY DstrbnType;

-- Category (8 rows)
SELECT TOP 5 'Category' AS Tbl, CatgryCode AS Code, Dscription AS Name FROM Category ORDER BY CatgryCode;

-- SubCategory (7 rows)
SELECT TOP 5 'SubCategory' AS Tbl, SubCatCode AS Code, Dscription AS Name FROM SubCategory ORDER BY SubCatCode;

-- Manufacturing (4 rows)
SELECT TOP 4 'Manufacturing' AS Tbl, MnfctrCode AS Code, Dscription AS Name FROM Manufacturing ORDER BY MnfctrCode;

-- PaymentTerm (6 rows)
SELECT TOP 5 'PaymentTerm' AS Tbl, TermCode AS Code, Dscription AS Name, DueDay AS NetDays FROM PaymentTerm ORDER BY TermCode;

-- Price / PriceTier (22 rows)
SELECT TOP 5 'Price' AS Tbl, PriceCode AS Code, Dscription AS Name, Factor FROM Price ORDER BY PriceCode;

-- Discount / DiscountCode (3 rows)
SELECT TOP 3 'Discount' AS Tbl, DiscCode AS Code, Dscription AS Name FROM Discount ORDER BY DiscCode;

-- TaxNo / TaxRegistration (7 rows)
SELECT TOP 5 'TaxNo' AS Tbl, RegistrationNo, RegisterDate, Ref1, Ref2, FromNo, ToNo, NoCounted, NoUsed FROM TaxNo ORDER BY RegistrationNo;

-- Uom / Unit of Measure (43 rows)  -- ⚠ UOM is int, DSCRIPTION is char(100)
SELECT TOP 5 'Uom' AS Tbl, UOM AS Code, DSCRIPTION AS Name FROM Uom ORDER BY UOM;

-- =============================================================================
-- 2.  MASTER RECORDS  (10 rows each)
-- =============================================================================

-- Customer (17,539 rows)
SELECT TOP 10 'Customer' AS Tbl,
    CustmrCode AS Code, CustmrName AS Name, NPWPNumber AS TaxId, Email, Phone1,
    Address, City, CredLimit AS CreditLimit, TermCode AS PaymentTermCode,
    SlPrsnCode AS SalesmanCode, ClctrCode AS CollectorCode,
    TradeType, SubTradeType, OutletType, DstrbnType AS DistributionType,
    GrpOltCode AS OutletGroupCode, GrpOltTypeCode AS OutletGroupTypeCode,
    PriceCode, DiscCode, WhsCode, Locked AS IsLocked
FROM Customer ORDER BY CustmrCode;

-- CustomerAddress (17,576 rows)   -- ⚠ No Id column; FK is CustmrCode
SELECT TOP 10 'CustomerAddress' AS Tbl,
    CustmrCode AS CustomerCode, AddrCode AS AddressCode, AddrName AS Label,
    Address, City, Phone1, Email
FROM CustomerAddress ORDER BY CustmrCode, AddrCode;

-- Supplier (173 rows)
SELECT TOP 10 'Supplier' AS Tbl,
    SuppCode AS Code, SuppName AS Name, NPWPNumber AS TaxId, Email, Phone1,
    Address, City, TermCode AS PaymentTermCode, PriceCode
FROM Supplier ORDER BY SuppCode;

-- Item / Product (6,714 rows)
SELECT TOP 10 'Item' AS Tbl,
    ItemCode AS Code, Dscription AS Name, CodeBars AS Barcode, Aliasku AS Alias,
    BrandCode, CatgryCode AS CategoryCode, SubCatCode AS SubCategoryCode,
    MnfctrCode AS ManufacturerCode, ClassCode, UOM AS UnitOfMeasure,
    SalesItem AS IsSalable, PurchItem AS IsPurchasable, ReturnItem AS IsReturnable,
    ReorderQty, MinLevel, MaxLevel, OnHand, Locked AS IsLocked
FROM Item ORDER BY ItemCode;

-- Warehouse (15 rows)
SELECT TOP 10 'Warehouse' AS Tbl,
    WhsCode AS Code, Dscription AS Name, Address, City, WhsType, Locked AS IsLocked
FROM Warehouse ORDER BY WhsCode;

-- =============================================================================
-- 3.  PRICING TABLES  (5 rows each — these are LARGE)
-- =============================================================================

-- ItemPrice (147,708 rows)   -- ⚠ No Id column; FK is ItemCode (varchar)
SELECT TOP 5 'ItemPrice' AS Tbl,
    ItemCode, PriceCode, Price, CurrentPrice, StartDate, EndDate
FROM ItemPrice ORDER BY ItemCode, PriceCode;

-- ItemDiscount (22,437 rows) -- ⚠ No Id column; FK is ItemCode (varchar)
SELECT TOP 5 'ItemDiscount' AS Tbl,
    ItemCode, DiscCode, Discount
FROM ItemDiscount ORDER BY ItemCode, DiscCode;

-- =============================================================================
-- 4.  TABLES FROM OTHER schemas  (check if they exist)
-- =============================================================================

-- ⚠ CostType table does NOT exist in the sales database.
-- It was listed in the audit-log entity map but no legacy table was found.

-- ⚠ SubCategory has NO CategoryId FK column — it's a standalone lookup.
-- The relationship to Category is by matching SubCatCode pattern only.

PRINT '';
PRINT '=== DONE ===';
