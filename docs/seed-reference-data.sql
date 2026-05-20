-- =============================================================================
-- Jaza Venus — Reference Data Seed Script (PostgreSQL)
-- =============================================================================
-- Run this AFTER the migration to populate reference tables with sample data.
-- Order matters — parents before children.
-- =============================================================================

-- =============================================================================
-- 1. SIMPLE REFERENCE (no FK dependencies)
-- =============================================================================

-- Brands
INSERT INTO "Brands" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '0001', 'HOME SNOW', true, false, now()),
  (gen_random_uuid(), 'A0', 'ABC', true, false, now()),
  (gen_random_uuid(), 'A2', 'ADEM SARI', true, false, now()),
  (gen_random_uuid(), 'A6', 'HENNA', true, false, now()),
  (gen_random_uuid(), 'A7', 'ALADINA', true, false, now())
ON CONFLICT DO NOTHING;

-- Banks
INSERT INTO "Banks" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '001', 'BANK NUSANTARA PARAHYANGAN', true, false, now()),
  (gen_random_uuid(), '002', 'PANIN BANK', true, false, now()),
  (gen_random_uuid(), '003', 'Lippo Bank', true, false, now()),
  (gen_random_uuid(), '004', 'Bank Jabar banten', true, false, now()),
  (gen_random_uuid(), '005', 'Bank Danamon', true, false, now())
ON CONFLICT DO NOTHING;

-- Areas
INSERT INTO "Areas" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '01', 'BANDUNG TIMUR', true, false, now()),
  (gen_random_uuid(), '02', 'BANDUNG UTARA', true, false, now()),
  (gen_random_uuid(), '03', 'BANDUNG BARAT', true, false, now()),
  (gen_random_uuid(), '04', 'BANDUNG SELATAN', true, false, now()),
  (gen_random_uuid(), '05', 'BANDUNG TENGAH', true, false, now())
ON CONFLICT DO NOTHING;

-- Salesmen
INSERT INTO "Salesmen" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '', 'HERIYANTO (083115006288)', true, false, now()),
  (gen_random_uuid(), '01', 'OFFICE', true, false, now()),
  (gen_random_uuid(), '02', 'AMEL-MDMG', true, false, now()),
  (gen_random_uuid(), '03', 'HERMAN', true, false, now()),
  (gen_random_uuid(), '04', 'FERI-SPV SUPREME', true, false, now())
ON CONFLICT DO NOTHING;

-- Collectors
INSERT INTO "Collectors" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '', 'OFFICE', true, false, now())
ON CONFLICT DO NOTHING;

-- Warehouse Types
INSERT INTO "WarehouseTypes" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '0', 'Main', true, false, now()),
  (gen_random_uuid(), '1', 'Return', true, false, now()),
  (gen_random_uuid(), '3', 'Consignment', true, false, now())
ON CONFLICT DO NOTHING;

-- Outlet Types
INSERT INTO "OutletTypes" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '01', 'HYPERMARKET', true, false, now()),
  (gen_random_uuid(), '02', 'SUPERMARKET', true, false, now()),
  (gen_random_uuid(), '03', 'MINIMARKET', true, false, now()),
  (gen_random_uuid(), '04', 'SUPER STORE', true, false, now()),
  (gen_random_uuid(), '05', 'DEPARTMENT STOR', true, false, now())
ON CONFLICT DO NOTHING;

-- Outlet Groups
INSERT INTO "GroupOutlets" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '01', '>= 1 JT - < 5 JT', true, false, now()),
  (gen_random_uuid(), '02', '>= 500.000 - < 1 JT', true, false, now()),
  (gen_random_uuid(), '03', '>= 250.000 - < 500.000', true, false, now()),
  (gen_random_uuid(), '04', '< 250.000', true, false, now())
ON CONFLICT DO NOTHING;

-- Outlet Group Types
INSERT INTO "GroupOutletTypes" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), 'A', 'YOGYA GROUP', true, false, now()),
  (gen_random_uuid(), 'B', 'CAREFFOUR GROUP', true, false, now()),
  (gen_random_uuid(), 'C', 'MATAHARI GROUP', true, false, now()),
  (gen_random_uuid(), 'D', 'UNDEFINE GROUP', true, false, now()),
  (gen_random_uuid(), 'E', 'BORMA GROUP', true, false, now())
ON CONFLICT DO NOTHING;

-- Trade Types
INSERT INTO "TradeTypes" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '01', 'MODERN TRADE', true, false, now()),
  (gen_random_uuid(), '02', 'GENERAL TRADE', true, false, now()),
  (gen_random_uuid(), '03', 'OTHERS TRADE', true, false, now()),
  (gen_random_uuid(), '04', 'SALON', true, false, now())
ON CONFLICT DO NOTHING;

-- Sub Trade Types
INSERT INTO "SubTradeTypes" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '', 'YENS GROUP', true, false, now()),
  (gen_random_uuid(), '01', 'RETAILER', true, false, now()),
  (gen_random_uuid(), '02', 'WHOLESALER', true, false, now()),
  (gen_random_uuid(), '03', 'STAR OUTLET', true, false, now())
ON CONFLICT DO NOTHING;

-- Distribution Types
INSERT INTO "DistributionTypes" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '01', 'LOKASI TOKO DI JALAN UTAMA', true, false, now()),
  (gen_random_uuid(), '02', 'LOKASI TOKO BUKAN DI JALAN UTAMA', true, false, now()),
  (gen_random_uuid(), '03', 'LOKASI TOKO DI DALAM PASAR', true, false, now())
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO "Categories" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '01', 'SALON', true, false, now()),
  (gen_random_uuid(), '02', 'OTHERS', true, false, now()),
  (gen_random_uuid(), '03', 'COSMETIC', true, false, now()),
  (gen_random_uuid(), '04', 'TOILETRIES', true, false, now()),
  (gen_random_uuid(), '05', 'FARMASI', true, false, now())
ON CONFLICT DO NOTHING;

-- Sub Categories
INSERT INTO "SubCategories" ("Id", "Code", "Name", "CategoryId", "IsActive", "IsDeleted", "CreatedAtUtc")
SELECT gen_random_uuid(), '01', 'SALON', c."Id", true, false, now() FROM "Categories" c WHERE c."Code" = '01'
UNION ALL
SELECT gen_random_uuid(), '02', 'OTHERS', c."Id", true, false, now() FROM "Categories" c WHERE c."Code" = '02'
UNION ALL
SELECT gen_random_uuid(), '03', 'COSMETIC', c."Id", true, false, now() FROM "Categories" c WHERE c."Code" = '03'
UNION ALL
SELECT gen_random_uuid(), '04', 'TOILETRIES', c."Id", true, false, now() FROM "Categories" c WHERE c."Code" = '04'
UNION ALL
SELECT gen_random_uuid(), '05', 'FARMASI', c."Id", true, false, now() FROM "Categories" c WHERE c."Code" = '05'
ON CONFLICT DO NOTHING;

-- Manufacturers
INSERT INTO "Manufacturings" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '', 'tes', true, false, now()),
  (gen_random_uuid(), '01', 'TES1', true, false, now()),
  (gen_random_uuid(), '02', 'TES2', true, false, now()),
  (gen_random_uuid(), '03', 'TES AJA', true, false, now())
ON CONFLICT DO NOTHING;

-- Payment Terms
INSERT INTO "PaymentTerms" ("Id", "Code", "Name", "NetDays", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '00', '0 Hari', 0, true, false, now()),
  (gen_random_uuid(), '07', '7 hari', 7, true, false, now()),
  (gen_random_uuid(), '12', '12 Hari', 12, true, false, now()),
  (gen_random_uuid(), '14', '14 Hari', 14, true, false, now()),
  (gen_random_uuid(), '21', '21 Hari', 21, true, false, now())
ON CONFLICT DO NOTHING;

-- Price Tiers
INSERT INTO "PriceTiers" ("Id", "Code", "Name", "MarkupPercent", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), 'HETOLD', 'Harga HET1 Lama', 0, true, false, now()),
  (gen_random_uuid(), 'HETOLD2', 'Harga HET2 Lama', 0, true, false, now()),
  (gen_random_uuid(), 'HETOLD3', 'Harga HET3 Lama', 0, true, false, now()),
  (gen_random_uuid(), 'HETOLD4', 'Harga HET4 Lama', 0, true, false, now()),
  (gen_random_uuid(), 'HETOLD5', 'Harga HET5 Lama', 0, true, false, now())
ON CONFLICT DO NOTHING;

-- Discount Codes
INSERT INTO "DiscountCodes" ("Id", "Code", "Name", "DiscountPercent", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), 'A', 'Discount Standart 1', 0, true, false, now()),
  (gen_random_uuid(), 'B', 'Discount Standart 2', 0, true, false, now()),
  (gen_random_uuid(), 'C', 'Discount Permata', 0, true, false, now())
ON CONFLICT DO NOTHING;

-- Units of Measure
INSERT INTO "Units" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), 'PCS', 'PCS', true, false, now()),
  (gen_random_uuid(), 'BOX', 'BOX', true, false, now()),
  (gen_random_uuid(), 'DUS', 'DUS', true, false, now()),
  (gen_random_uuid(), 'PACK', 'PACK', true, false, now()),
  (gen_random_uuid(), 'LUSIN', 'LUSIN', true, false, now())
ON CONFLICT DO NOTHING;

-- Tax Registrations
INSERT INTO "TaxRegistrations" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '1', 'LANJUTAN NO PAJAK', true, false, now()),
  (gen_random_uuid(), '2', 'No Thn 2009', true, false, now()),
  (gen_random_uuid(), '3', 'Penomoran Faktur Pajak Thn 2010', true, false, now())
ON CONFLICT DO NOTHING;

-- Cost Types
INSERT INTO "CostTypes" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '01', 'Operational', true, false, now()),
  (gen_random_uuid(), '02', 'Transport', true, false, now()),
  (gen_random_uuid(), '03', 'Warehouse', true, false, now())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 2. MASTER RECORDS
-- =============================================================================

-- Suppliers
INSERT INTO "Suppliers" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '103', 'DEVA INDUSTRIES PT', true, false, now()),
  (gen_random_uuid(), '104', 'CITRA ALAM AROMINDO PT', true, false, now()),
  (gen_random_uuid(), '105', 'WICAKSANA OVERSEAS INTERNATIONAL Tbk (AWAL)', true, false, now()),
  (gen_random_uuid(), '106', 'PESONA AMARANTHINE COSMETIQUES PT', true, false, now()),
  (gen_random_uuid(), '107', 'PT SAI / COTY', true, false, now()),
  (gen_random_uuid(), '108', 'JAYA BAKTI RAHARJA PT', true, false, now()),
  (gen_random_uuid(), '110', 'SUKSES MAKMUR JAYA', true, false, now()),
  (gen_random_uuid(), '111', 'JAVINCI COSMETICS CV', true, false, now()),
  (gen_random_uuid(), '112', 'AURA CANTIK PT (VLCC)', true, false, now()),
  (gen_random_uuid(), '113', 'PT. KHARISMA SUKSES PERSADA', true, false, now())
ON CONFLICT DO NOTHING;

-- Warehouses
INSERT INTO "Warehouses" ("Id", "Code", "Name", "Address", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '001', 'MAIN WAREHOUSE', 'BANDUNG', true, false, now()),
  (gen_random_uuid(), '002', 'Gudang Utama Cirebon', NULL, true, false, now()),
  (gen_random_uuid(), '101', 'GUDANG RETUR', 'BANDUNG', true, false, now()),
  (gen_random_uuid(), '102', 'Gudang Retur Cirebon', NULL, true, false, now()),
  (gen_random_uuid(), '301', 'KONSINYASI YOGYA RIAU', NULL, true, false, now()),
  (gen_random_uuid(), '302', 'KONSINYASI YOGYA TASIK', 'JL. HZ. MUSTAFA NO.124', true, false, now()),
  (gen_random_uuid(), '303', 'KONSINYASI GRIYA BUAH BATU', NULL, true, false, now()),
  (gen_random_uuid(), '317', 'KONSINYASI YOGYA KEPATIHAN', 'JL.KEPATIHAN NO.18', true, false, now()),
  (gen_random_uuid(), '322', 'KONSINYASI YOGYA MEKAR WANGI', 'JL. MEKAR UTAMA, MEKAR WANGI BOJONGLOA KIDUL', true, false, now()),
  (gen_random_uuid(), '328', 'KONSINYASI YOGYA SUNDA', 'JL.SUNDA NO.56-62', true, false, now())
ON CONFLICT DO NOTHING;

-- Customers
INSERT INTO "Customers" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '00000000100', 'DIDIN TK (P7/BL-KASUS IRA)', true, false, now()),
  (gen_random_uuid(), '000000001000', 'AZZAKI SALON (P/BL)', true, false, now()),
  (gen_random_uuid(), '0000000010000', 'BANDI TK (P4/PRG=0.5) (SUCI)', true, false, now()),
  (gen_random_uuid(), '0000000010001', 'ASEP SOPYAN (PDLRNG)', true, false, now()),
  (gen_random_uuid(), '0000000010002', 'IBIS BRAGA (BRAGA) (P3/GF)', true, false, now())
ON CONFLICT DO NOTHING;

-- Items
INSERT INTO "Items" ("Id", "Sku", "Name", "CategoryId", "UnitId", "IsActive", "IsDeleted", "CreatedAtUtc")
SELECT gen_random_uuid(), '02-7', 'GATSBY STYLING POMADE 75 GR SILVER/SUPREME GREASE',
  c."Id", u."Id", true, false, now()
FROM "Categories" c, "Units" u
WHERE c."Code" = '03' AND u."Code" = 'PCS'
UNION ALL
SELECT gen_random_uuid(), '02-8', 'GATSBY STYLING POMADE 75 GR COKLAT /HOLD',
  c."Id", u."Id", true, false, now()
FROM "Categories" c, "Units" u
WHERE c."Code" = '03' AND u."Code" = 'PCS'
UNION ALL
SELECT gen_random_uuid(), 'AA0-10', 'CASABLANCA ROLL ON BIRU AQUA / WOMEN',
  c."Id", u."Id", true, false, now()
FROM "Categories" c, "Units" u
WHERE c."Code" = '04' AND u."Code" = 'PCS'
UNION ALL
SELECT gen_random_uuid(), 'AA0-11', 'CASABLANCA ROLL ON MERAH',
  c."Id", u."Id", true, false, now()
FROM "Categories" c, "Units" u
WHERE c."Code" = '03' AND u."Code" = 'PCS'
UNION ALL
SELECT gen_random_uuid(), 'AC-2', 'NATURE EKSTRAK TTO & LIME 140ML',
  c."Id", u."Id", true, false, now()
FROM "Categories" c, "Units" u
WHERE c."Code" = '03' AND u."Code" = 'PCS'
ON CONFLICT DO NOTHING;

PRINT 'Seed data inserted successfully.';
