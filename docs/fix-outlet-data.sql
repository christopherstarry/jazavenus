-- =============================================================================
-- Quick Fix: Separate Class Outlet from Location Outlet + update values
-- Run in Neon SQL Editor
-- =============================================================================

-- 1. Revert DistributionTypes → Location Outlet (location descriptions)
DELETE FROM "DistributionTypes";

INSERT INTO "DistributionTypes" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '01', 'LOKASI TOKO DI JALAN UTAMA', true, false, now()),
  (gen_random_uuid(), '02', 'LOKASI TOKO BUKAN DI JALAN UTAMA', true, false, now()),
  (gen_random_uuid(), '03', 'LOKASI TOKO DI DALAM PASAR', true, false, now());

-- 2. GroupOutlets → company group names
DELETE FROM "GroupOutlets";

INSERT INTO "GroupOutlets" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '01', 'Borma Group', true, false, now()),
  (gen_random_uuid(), '02', 'Sat Group', true, false, now()),
  (gen_random_uuid(), '03', 'Idm Group', true, false, now()),
  (gen_random_uuid(), '04', 'Yogya Group', true, false, now());

-- 3. GroupOutletTypes → match group names
DELETE FROM "GroupOutletTypes";

INSERT INTO "GroupOutletTypes" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), 'A', 'Yogya Group', true, false, now()),
  (gen_random_uuid(), 'B', 'Borma Group', true, false, now()),
  (gen_random_uuid(), 'C', 'Idm Group', true, false, now()),
  (gen_random_uuid(), 'D', 'Sat Group', true, false, now()),
  (gen_random_uuid(), 'E', 'Undefine Group', true, false, now());

-- 4. Class Outlets → financial ranges (NEW table)
INSERT INTO "ClassOutlets" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '01', '< 250.000', true, false, now()),
  (gen_random_uuid(), '02', '>= 250.000 - 500.000', true, false, now()),
  (gen_random_uuid(), '03', '> 500.000 - 1 JT', true, false, now()),
  (gen_random_uuid(), '04', '>= 1 JT - < 5 JT', true, false, now()),
  (gen_random_uuid(), '05', '> 5 JT', true, false, now());

PRINT 'Done. Refresh to see updated values.';
