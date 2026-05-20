-- Run this in the Neon SQL Editor to check what data is in the tables
SELECT 'Categories' AS tbl, COUNT(*) AS rows FROM "Categories"
UNION ALL SELECT 'Units', COUNT(*) FROM "Units"
UNION ALL SELECT 'Items', COUNT(*) FROM "Items"
UNION ALL SELECT 'Customers', COUNT(*) FROM "Customers"
UNION ALL SELECT 'Brands', COUNT(*) FROM "Brands"
UNION ALL SELECT 'Suppliers', COUNT(*) FROM "Suppliers"
UNION ALL SELECT 'Warehouses', COUNT(*) FROM "Warehouses"
UNION ALL SELECT 'PaymentTerms', COUNT(*) FROM "PaymentTerms"
ORDER BY tbl;
