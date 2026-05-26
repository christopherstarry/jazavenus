-- =============================================================================
-- Quick Fix: Update Class Outlet and Group Outlet values in live DB
-- Run in Neon SQL Editor
-- =============================================================================

-- 1. DistributionTypes → Class Outlet (financial ranges)
DELETE FROM "DistributionTypes";

INSERT INTO "DistributionTypes" ("Id", "Code", "Name", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
  (gen_random_uuid(), '01', '< 250.000', true, false, now()),
  (gen_random_uuid(), '02', '>= 250.000 - 500.000', true, false, now()),
  (gen_random_uuid(), '03', '> 500.000 - 1 JT', true, false, now()),
  (gen_random_uuid(), '04', '>= 1 JT - < 5 JT', true, false, now()),
  (gen_random_uuid(), '05', '> 5 JT', true, false, now());

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

PRINT 'Done. Refresh the page to see updated values.';
