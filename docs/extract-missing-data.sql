-- =============================================================================
-- Jaza Venus — Extract Missing Sample Data (SQL Server → sales database)
-- =============================================================================
-- Run this against the old `sales` database.
-- Copy the results and share them with the developer.
-- =============================================================================

USE sales;
GO

PRINT '=== MISSING DATA ===';
PRINT '';

-- 1. Items / Products (10 rows, all fields)
SELECT TOP 10 'Item' AS Tbl,
    ItemCode, Dscription AS Name, CodeBars AS Barcode, Aliasku AS Alias,
    BrandCode, CatgryCode AS CategoryCode, SubCatCode,
    MnfctrCode AS ManufacturerCode, ClassCode, UOM,
    SalesItem, PurchItem, ReturnItem,
    ReorderQty, MinLevel, MaxLevel, OnHand,
    Locked AS IsLocked
FROM Item ORDER BY ItemCode;

-- 2. Customers (10 rows, all key fields)
SELECT TOP 10 'Customer' AS Tbl,
    CustmrCode, CustmrName AS Name, Address, City,
    Phone1, Phone2, Email, NPWPNumber AS TaxId,
    CredLimit AS CreditLimit, TermCode AS PaymentTerm,
    SlPrsnCode AS SalesmanCode, ClctrCode AS CollectorCode,
    TradeType, SubTradeType, OutletType,
    DstrbnType AS DistributionType,
    GrpOltCode AS OutletGroupCode, GrpOltTypeCode,
    PriceCode, DiscCode, WhsCode,
    Locked AS IsLocked
FROM Customer ORDER BY CustmrCode;

-- 3. Customer Addresses (5 rows)
SELECT TOP 5 'CustomerAddress' AS Tbl,
    CustmrCode AS CustomerCode, AddrCode, AddrName AS Label,
    Address, City, Phone1
FROM CustomerAddress ORDER BY CustmrCode, AddrCode;

-- 4. Item Prices (5 rows)
SELECT TOP 5 'ItemPrice' AS Tbl,
    ItemCode, PriceCode, Price, CurrentPrice, StartDate, EndDate
FROM ItemPrice ORDER BY ItemCode, PriceCode;

-- 5. Item Discounts (5 rows)
SELECT TOP 5 'ItemDiscount' AS Tbl,
    ItemCode, DiscCode, Discount
FROM ItemDiscount ORDER BY ItemCode, DiscCode;

-- 6. Locations (warehouse bins — if table exists)
SELECT TOP 5 'Location' AS Tbl,
    w.WhsCode AS WarehouseCode, l.Code, l.Name
FROM Location l
JOIN Warehouse w ON l.WarehouseId = w.Id
ORDER BY w.WhsCode, l.Code;

PRINT '';
PRINT '=== DONE ===';
