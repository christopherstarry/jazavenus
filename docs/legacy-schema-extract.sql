-- ============================================================
-- Legacy SQL Server schema & data extract
-- Run with a READ-ONLY login. Save the entire output to a file:
--   sqlcmd -S <server> -U <readonly_user> -P <pwd> -d <legacy_db> -i legacy-schema-extract.sql -o ../docs/legacy-schema.txt
-- ============================================================

PRINT '== Tables and row counts =='
SELECT
    s.name  AS [Schema],
    t.name  AS [Table],
    SUM(p.rows) AS [Rows]
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0,1)
GROUP BY s.name, t.name
ORDER BY [Rows] DESC;

PRINT '== Columns =='
SELECT
    s.name  AS [Schema],
    t.name  AS [Table],
    c.name  AS [Column],
    ty.name AS [Type],
    c.max_length, c.precision, c.scale, c.is_nullable, c.is_identity
FROM sys.columns c
JOIN sys.tables t  ON t.object_id = c.object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.types  ty ON ty.user_type_id = c.user_type_id
ORDER BY s.name, t.name, c.column_id;

PRINT '== Primary keys =='
SELECT
    s.name AS [Schema], t.name AS [Table], i.name AS [PK], c.name AS [Column]
FROM sys.indexes i
JOIN sys.tables t  ON t.object_id = i.object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE i.is_primary_key = 1
ORDER BY s.name, t.name, ic.key_ordinal;

PRINT '== Foreign keys =='
SELECT
    fk.name        AS [FK],
    OBJECT_NAME(fk.parent_object_id)            AS [Table],
    cp.name        AS [Column],
    OBJECT_NAME(fk.referenced_object_id)         AS [RefTable],
    cr.name        AS [RefColumn]
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.columns cp ON cp.object_id = fk.parent_object_id      AND cp.column_id = fkc.parent_column_id
JOIN sys.columns cr ON cr.object_id = fk.referenced_object_id  AND cr.column_id = fkc.referenced_column_id
ORDER BY [Table], [FK];

PRINT '== Indexes (non-PK) =='
SELECT
    s.name AS [Schema], t.name AS [Table], i.name AS [Index], i.is_unique,
    STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS [Columns]
FROM sys.indexes i
JOIN sys.tables t  ON t.object_id = i.object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
JOIN sys.columns c  ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE i.is_primary_key = 0 AND i.type > 0
GROUP BY s.name, t.name, i.name, i.is_unique
ORDER BY s.name, t.name, i.name;

PRINT '== Views =='
SELECT s.name AS [Schema], v.name AS [View], OBJECT_DEFINITION(v.object_id) AS [Definition]
FROM sys.views v JOIN sys.schemas s ON s.schema_id = v.schema_id
ORDER BY s.name, v.name;

PRINT '== Stored procedures =='
SELECT s.name AS [Schema], p.name AS [Proc], OBJECT_DEFINITION(p.object_id) AS [Definition]
FROM sys.procedures p JOIN sys.schemas s ON s.schema_id = p.schema_id
ORDER BY s.name, p.name;
