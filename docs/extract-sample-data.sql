-- =============================================================================
-- Jaza Venus — Sample Data Extraction Script (SQL Server)
-- =============================================================================
-- Run this against the OLD database to extract a few rows per table for testing.
-- Results will include column headers so they export cleanly as CSV.
--
-- Usage in SSMS:  Query → Results to File  (Ctrl+Shift+F)
--         or:     Query → Results to Grid, then right-click → Save Results As → CSV
-- =============================================================================

PRINT '=== SIMPLE REFERENCE DATA (3-5 rows each) ===';

-- Brands
SELECT TOP 5 'Brands' AS TableName, Code, Name FROM Brand ORDER BY Code;

-- Banks
SELECT TOP 5 'Banks' AS TableName, Code, Name FROM Bank ORDER BY Code;

-- Areas
SELECT TOP 5 'Areas' AS TableName, Code, Name FROM Area ORDER BY Code;

-- Salesmen
SELECT TOP 5 'Salesmen' AS TableName, Code, Name FROM Salesman ORDER BY Code;

-- Collectors
SELECT TOP 5 'Collectors' AS TableName, Code, Name FROM Collector ORDER BY Code;

-- Warehouse Types
SELECT TOP 5 'WarehouseTypes' AS TableName, Code, Name FROM WarehouseType ORDER BY Code;

-- Outlet Types
SELECT TOP 5 'OutletTypes' AS TableName, Code, Name FROM OutletType ORDER BY Code;

-- Outlet Groups
SELECT TOP 5 'OutletGroups' AS TableName, Code, Name FROM GroupOutlet ORDER BY Code;

-- Trade Types
SELECT TOP 5 'TradeTypes' AS TableName, Code, Name FROM TradeType ORDER BY Code;

-- Distribution Types
SELECT TOP 5 'DistributionTypes' AS TableName, Code, Name FROM DistributionType ORDER BY Code;

-- Cost Types
SELECT TOP 5 'CostTypes' AS TableName, Code, Name FROM CostType ORDER BY Code;

-- Manufacturers
SELECT TOP 5 'Manufacturers' AS TableName, Code, Name FROM Manufacturing ORDER BY Code;

-- Tax Registrations
SELECT TOP 5 'TaxRegistrations' AS TableName, Code, Name FROM TaxRegistration ORDER BY Code;

-- Payment Terms
SELECT TOP 5 'PaymentTerms' AS TableName, Code, Name, NetDays FROM PaymentTerm ORDER BY Code;

-- Price Tiers
SELECT TOP 5 'PriceTiers' AS TableName, Code, Name, MarkupPercent FROM PriceTier ORDER BY Code;

-- Discount Codes
SELECT TOP 5 'DiscountCodes' AS TableName, Code, Name, DiscountPercent FROM DiscountCode ORDER BY Code;

-- =============================================================================
-- MASTER RECORDS (10 rows each)
-- =============================================================================
PRINT '=== MASTER RECORDS ===';

-- Units of Measure
SELECT TOP 10 'Units' AS TableName, Code, Name FROM Uom ORDER BY Code;

-- Item Categories (with parent)
SELECT TOP 10 'Categories' AS TableName,
    c.Code, c.Name, p.Code AS ParentCode
FROM ItemCategory c
LEFT JOIN ItemCategory p ON c.ParentId = p.Id
ORDER BY c.Code;

-- Items / Products
SELECT TOP 10 'Items' AS TableName,
    i.Sku, i.Name, i.Barcode, i.Description,
    c.Code AS CategoryCode, u.Code AS UnitCode,
    i.StandardCost, i.StandardPrice, i.Currency,
    i.ReorderLevel, i.ReorderQuantity
FROM Item i
LEFT JOIN ItemCategory c ON i.CategoryId = c.Id
LEFT JOIN Uom u ON i.UnitId = u.Id
ORDER BY i.Sku;

-- Customers
SELECT TOP 10 'Customers' AS TableName,
    Code, Name, TaxId, Email, Phone,
    BillingAddress, ShippingAddress, City, Country,
    CreditLimit, PaymentTermsDays
FROM Customer ORDER BY Code;

-- Suppliers
SELECT TOP 10 'Suppliers' AS TableName,
    Code, Name, TaxId, Email, Phone,
    Address, City, Country, PaymentTermsDays
FROM Supplier ORDER BY Code;

-- Warehouses
SELECT TOP 10 'Warehouses' AS TableName,
    Code, Name, Address
FROM Warehouse ORDER BY Code;

-- Locations (bins / shelves within warehouses)
SELECT TOP 10 'Locations' AS TableName,
    w.Code AS WarehouseCode, l.Code, l.Name
FROM Location l
JOIN Warehouse w ON l.WarehouseId = w.Id
ORDER BY w.Code, l.Code;

-- =============================================================================
-- TRANSACTIONAL / RELATIONAL DATA (5 rows each)
-- =============================================================================
PRINT '=== RELATIONAL DATA ===';

-- Customer Addresses
SELECT TOP 5 'CustomerAddresses' AS TableName,
    c.Code AS CustomerCode, a.Label, a.Address, a.City, a.Country, a.IsDefault
FROM CustomerAddress a
JOIN Customer c ON a.CustomerId = c.Id
ORDER BY c.Code, a.Label;

-- Item Prices (per price tier)
SELECT TOP 5 'ItemPrices' AS TableName,
    i.Sku AS ItemSku, pt.Code AS PriceTierCode, ip.Price
FROM ItemPrice ip
JOIN Item i ON ip.ItemId = i.Id
JOIN PriceTier pt ON ip.PriceTierId = pt.Id
ORDER BY i.Sku, pt.Code;

-- Item Discounts
SELECT TOP 5 'ItemDiscounts' AS TableName,
    i.Sku AS ItemSku, dc.Code AS DiscountCode,
    id.DiscountPercent, id.StartDate, id.EndDate
FROM ItemDiscount id
JOIN Item i ON id.ItemId = i.Id
JOIN DiscountCode dc ON id.DiscountCodeId = dc.Id
ORDER BY i.Sku, dc.Code;

-- Sub Categories (child of category)
SELECT TOP 5 'SubCategories' AS TableName,
    s.Code, s.Name, c.Code AS CategoryCode
FROM SubCategory s
JOIN ItemCategory c ON s.CategoryId = c.Id
ORDER BY s.Code;

-- =============================================================================
-- CHECK: TABLE NAME MAPPING (rename if your old DB uses different names)
-- =============================================================================
-- If any SELECT above fails with "Invalid object name", your old DB likely uses
-- different table names.  Common renames:
--
--   ItemCategory   → ProductCategory / Category
--   Item           → Product / StockItem
--   Uom            → UnitOfMeasure / Unit
--   Customer       → CustomerMaster / Cust
--   Supplier       → Vendor / SupplierMaster
--   Warehouse      → Whse / Store
--   PriceTier      → PriceLevel / PriceGroup
--   DiscountCode   → DiscCode / Promotion
--   Salesman       → SalesRep / Agent
--   Collector      → CollectionAgent
--   PaymentTerm    → Term / PayTerm
--   TaxRegistration → TaxNo / NPWP (Indonesia)
--
-- Just replace the table names above and re-run.
-- =============================================================================

PRINT '=== DONE ===';
