using System.Text.Json;
using Jaza.Domain.Ar;
using Jaza.Domain.Common;
using Jaza.Domain.Inbound;
using Jaza.Domain.Invoicing;
using Jaza.Domain.MasterData;
using Jaza.Domain.Outbound;
using Jaza.Infrastructure.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Jaza.Migration;

/// <summary>
/// One-off ETL runner: legacy SQL Server → new PostgreSQL schema.
/// Each entity migration is a discrete method so they can be re-run individually with --only=.
/// </summary>
public sealed class EtlRunner(EtlOptions opts, ILogger<EtlRunner> log)
{
    private readonly LegacyIdMap _idMap = new();

    public async Task RunAsync()
    {
        Validate();
        Directory.CreateDirectory(opts.ErrorsDirectory);
        log.LogInformation("ETL starting. DryRun={DryRun} Division={Division} Only=[{Only}] Since={Since}",
            opts.DryRun, opts.Division, string.Join(",", opts.Only), opts.Since);

        var optsB = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(opts.TargetConnectionString).Options;
        await using var target = new AppDbContext(optsB);
        await LegacyIdMapHydrator.HydrateAsync(target, _idMap);

        var report = new Dictionary<string, MigrationReport>();
        foreach (var entity in opts.Only)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var r = entity.ToLowerInvariant() switch
            {
                "units" => await MigrateUnitsAsync(target),
                "categories" => await MigrateCategoriesAsync(target),
                "brands" => await MigrateBrandsAsync(target),
                "suppliers" => await MigrateSuppliersAsync(target),
                "customers" => await MigrateCustomersAsync(target),
                "warehouses" => await MigrateWarehousesAsync(target),
                "items" => await MigrateItemsAsync(target),
                "purchaseorders" => await MigratePurchaseOrdersAsync(target),
                "salesorders" => await MigrateSalesOrdersAsync(target),
                "invoices" => await MigrateInvoicesAsync(target),
                "payments" => await MigratePaymentsAsync(target),
                _ => new MigrationReport(entity, 0, 0, 0, [$"Unknown entity '{entity}' — add a method in EtlRunner."])
            };
            sw.Stop();
            report[entity] = r;
            log.LogInformation("{Entity}: read={Read} written={Written} skipped={Skipped} errors={Errors} ({Ms} ms)",
                r.Entity, r.Read, r.Written, r.Skipped, r.Errors.Count, sw.ElapsedMilliseconds);
            await DumpErrorsAsync(r);
        }

        log.LogInformation("IdMap: masters={M} documents={D} lines={L}",
            _idMap.MasterCount, _idMap.DocumentCount, _idMap.LineCount);

        await File.WriteAllTextAsync(Path.Combine(opts.ErrorsDirectory, "summary.json"),
            JsonSerializer.Serialize(report, new JsonSerializerOptions { WriteIndented = true }));
        log.LogInformation("ETL complete.");
    }

    private void Validate()
    {
        if (string.IsNullOrWhiteSpace(opts.LegacyConnectionString))
            throw new InvalidOperationException("Legacy connection string missing. Pass --legacy-cs=... or set Etl:LegacyConnectionString in config.");
        if (string.IsNullOrWhiteSpace(opts.TargetConnectionString))
            throw new InvalidOperationException("Target connection string missing.");
    }

    private async IAsyncEnumerable<Dictionary<string, object?>> ReadLegacyAsync(string sql,
        Action<SqlCommand>? configure = null)
    {
        await using var cn = new SqlConnection(opts.LegacyConnectionString);
        await cn.OpenAsync();
        await using var cmd = cn.CreateCommand();
        cmd.CommandText = sql;
        configure?.Invoke(cmd);
        await using var reader = await cmd.ExecuteReaderAsync();
        var cols = Enumerable.Range(0, reader.FieldCount).Select(reader.GetName).ToArray();
        while (await reader.ReadAsync())
        {
            var row = new Dictionary<string, object?>(cols.Length, StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < cols.Length; i++)
                row[cols[i]] = reader.IsDBNull(i) ? null : reader.GetValue(i);
            yield return row;
        }
    }

    private string DivisionForRow(Dictionary<string, object?> row) =>
        LegacyEtlHelpers.ResolveDivision(
            LegacyEtlHelpers.GetString(row, "CompanyIDKu", "Division"),
            opts.Division);

  // ---------- Tier 0–1: Master data ----------

    private async Task<MigrationReport> MigrateUnitsAsync(AppDbContext target)
    {
        var report = new MigrationReport("Units");
        var sql = LegacyEtlHelpers.AppendSinceFilter("SELECT UOM, DSCRIPTION FROM dbo.Uom", opts.Since);
        await foreach (var row in ReadLegacyAsync(sql, c => LegacyEtlHelpers.BindSince(c, opts.Since)))
        {
            report.Read++;
            try
            {
                var code = LegacyEtlHelpers.GetString(row, "UOM", "UoMCode")?.ToUpperInvariant();
                var name = LegacyEtlHelpers.GetString(row, "DSCRIPTION", "UoMName");
                if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(name))
                { report.Errors.Add($"Empty Uom row: {JsonSerializer.Serialize(row)}"); continue; }

                if (_idMap.TryGetMaster("Unit", code, out _)) { report.Skipped++; continue; }

                var unit = new Unit { Code = code, Name = name };
                if (!opts.DryRun) target.Units.Add(unit);
                _idMap.RegisterMaster("Unit", code, unit.Id);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add($"{ex.Message}: {JsonSerializer.Serialize(row)}"); }
        }
        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

    private async Task<MigrationReport> MigrateCategoriesAsync(AppDbContext target)
    {
        var report = new MigrationReport("Categories");
        var sql = LegacyEtlHelpers.AppendSinceFilter(
            "SELECT CatgryCode, Dscription FROM dbo.Category", opts.Since, "CatgryCode");
        await foreach (var row in ReadLegacyAsync(sql))
        {
            report.Read++;
            try
            {
                var code = LegacyEtlHelpers.GetString(row, "CatgryCode");
                var name = LegacyEtlHelpers.GetString(row, "Dscription");
                if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(name)) continue;
                if (_idMap.TryGetMaster("Category", code, out _)) { report.Skipped++; continue; }

                var cat = new ItemCategory { Code = code, Name = name };
                if (!opts.DryRun) target.Categories.Add(cat);
                _idMap.RegisterMaster("Category", code, cat.Id);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add(ex.Message); }
        }
        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

    private async Task<MigrationReport> MigrateBrandsAsync(AppDbContext target)
    {
        var report = new MigrationReport("Brands");
        await foreach (var row in ReadLegacyAsync("SELECT BrandCode, Dscription FROM dbo.Brand"))
        {
            report.Read++;
            try
            {
                var code = LegacyEtlHelpers.GetString(row, "BrandCode");
                var name = LegacyEtlHelpers.GetString(row, "Dscription");
                if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(name)) continue;
                if (_idMap.TryGetMaster("Brand", code, out _)) { report.Skipped++; continue; }

                var brand = new Brand { Code = code, Name = name };
                if (!opts.DryRun) target.Brands.Add(brand);
                _idMap.RegisterMaster("Brand", code, brand.Id);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add(ex.Message); }
        }
        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

    private async Task<MigrationReport> MigrateSuppliersAsync(AppDbContext target)
    {
        var report = new MigrationReport("Suppliers");
        var sql = LegacyEtlHelpers.AppendSinceFilter(
            "SELECT SuppCode, SuppName, NPWPNumber, Email, Phone1, Address, City FROM dbo.Supplier", opts.Since);
        await foreach (var row in ReadLegacyAsync(sql, c => LegacyEtlHelpers.BindSince(c, opts.Since)))
        {
            report.Read++;
            try
            {
                var code = LegacyEtlHelpers.GetString(row, "SuppCode");
                var name = LegacyEtlHelpers.GetString(row, "SuppName");
                if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(name)) continue;
                if (_idMap.TryGetMaster("Supplier", code, out _)) { report.Skipped++; continue; }

                var sup = new Supplier
                {
                    Code = code,
                    Name = name,
                    TaxId = LegacyEtlHelpers.GetString(row, "NPWPNumber"),
                    Email = LegacyEtlHelpers.GetString(row, "Email"),
                    Phone = LegacyEtlHelpers.GetString(row, "Phone1"),
                    Address = LegacyEtlHelpers.GetString(row, "Address"),
                    City = LegacyEtlHelpers.GetString(row, "City"),
                };
                if (!opts.DryRun) target.Suppliers.Add(sup);
                _idMap.RegisterMaster("Supplier", code, sup.Id);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add(ex.Message); }
        }
        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

    private async Task<MigrationReport> MigrateCustomersAsync(AppDbContext target)
    {
        var report = new MigrationReport("Customers");
        var sql = LegacyEtlHelpers.AppendSinceFilter(
            "SELECT CustmrCode, CustmrName, NPWPNumber, Email, Phone1, Address, City, CredLimit FROM dbo.Customer", opts.Since);
        await foreach (var row in ReadLegacyAsync(sql, c => LegacyEtlHelpers.BindSince(c, opts.Since)))
        {
            report.Read++;
            try
            {
                var code = LegacyEtlHelpers.GetString(row, "CustmrCode");
                var name = LegacyEtlHelpers.GetString(row, "CustmrName");
                if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(name)) continue;
                if (_idMap.TryGetMaster("Customer", code, out _)) { report.Skipped++; continue; }

                var cust = new Customer
                {
                    Code = code,
                    Name = name,
                    TaxId = LegacyEtlHelpers.GetString(row, "NPWPNumber"),
                    Email = LegacyEtlHelpers.GetString(row, "Email"),
                    Phone = LegacyEtlHelpers.GetString(row, "Phone1"),
                    BillingAddress = LegacyEtlHelpers.GetString(row, "Address"),
                    City = LegacyEtlHelpers.GetString(row, "City"),
                    CreditLimit = LegacyEtlHelpers.GetDecimal(row, "CredLimit"),
                };
                if (!opts.DryRun) target.Customers.Add(cust);
                _idMap.RegisterMaster("Customer", code, cust.Id);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add(ex.Message); }
        }
        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

    private async Task<MigrationReport> MigrateWarehousesAsync(AppDbContext target)
    {
        var report = new MigrationReport("Warehouses");
        await foreach (var row in ReadLegacyAsync("SELECT WhsCode, Dscription, Address, City FROM dbo.Warehouse"))
        {
            report.Read++;
            try
            {
                var code = LegacyEtlHelpers.GetString(row, "WhsCode");
                var name = LegacyEtlHelpers.GetString(row, "Dscription");
                if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(name)) continue;
                if (_idMap.TryGetMaster("Warehouse", code, out _)) { report.Skipped++; continue; }

                var wh = new Warehouse { Code = code, Name = name, Address = LegacyEtlHelpers.GetString(row, "Address") };
                if (!opts.DryRun) target.Warehouses.Add(wh);
                _idMap.RegisterMaster("Warehouse", code, wh.Id);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add(ex.Message); }
        }
        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

    private async Task<MigrationReport> MigrateItemsAsync(AppDbContext target)
    {
        var report = new MigrationReport("Items");
        // Seed default category if legacy SubCategory has no CategoryId
        if (!_idMap.TryGetMaster("Category", "DEF", out _))
        {
            var def = new ItemCategory { Code = "DEF", Name = "Default" };
            if (!opts.DryRun) target.Categories.Add(def);
            _idMap.RegisterMaster("Category", "DEF", def.Id);
        }
        if (!_idMap.TryGetMaster("Unit", "PCS", out _))
        {
            var pcs = new Unit { Code = "PCS", Name = "Pieces" };
            if (!opts.DryRun) target.Units.Add(pcs);
            _idMap.RegisterMaster("Unit", "PCS", pcs.Id);
        }

        var sql = LegacyEtlHelpers.AppendSinceFilter(
            "SELECT ItemCode, Dscription, CodeBars, CatgryCode, UOM FROM dbo.Item", opts.Since);
        await foreach (var row in ReadLegacyAsync(sql, c => LegacyEtlHelpers.BindSince(c, opts.Since)))
        {
            report.Read++;
            try
            {
                var sku = LegacyEtlHelpers.GetString(row, "ItemCode");
                var name = LegacyEtlHelpers.GetString(row, "Dscription");
                if (string.IsNullOrEmpty(sku) || string.IsNullOrEmpty(name)) continue;
                if (_idMap.TryGetMaster("Item", sku, out _)) { report.Skipped++; continue; }

                var catCode = LegacyEtlHelpers.GetString(row, "CatgryCode") ?? "DEF";
                if (!_idMap.TryGetMaster("Category", catCode, out var catId))
                    catId = _idMap.RequireMaster("Category", "DEF");

                var uomCode = LegacyEtlHelpers.GetString(row, "UOM") ?? "PCS";
                if (!_idMap.TryGetMaster("Unit", uomCode, out var unitId))
                {
                    report.Errors.Add($"Unresolved Unit '{uomCode}' for Item '{sku}'");
                    continue;
                }

                var item = new Item
                {
                    Sku = sku,
                    Name = name,
                    Barcode = LegacyEtlHelpers.GetString(row, "CodeBars"),
                    CategoryId = catId,
                    UnitId = unitId,
                };
                if (!opts.DryRun) target.Items.Add(item);
                _idMap.RegisterMaster("Item", sku, item.Id);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add(ex.Message); }
        }
        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

  // ---------- Tier 3–4: Transactions ----------

    private async Task<MigrationReport> MigratePurchaseOrdersAsync(AppDbContext target)
    {
        var report = new MigrationReport("PurchaseOrders");
        var sql = LegacyEtlHelpers.AppendSinceFilter(
            "SELECT DocEntry, DocNum, DocStatus, DocDate, CompanyIDKu, SuppCode, WhsCode FROM dbo.PurchaseOrder", opts.Since);
        await foreach (var row in ReadLegacyAsync(sql, c => LegacyEtlHelpers.BindSince(c, opts.Since)))
        {
            report.Read++;
            try
            {
                var docEntry = LegacyEtlHelpers.GetInt(row, "DocEntry") ?? 0;
                var division = DivisionForRow(row);
                if (_idMap.TryGetDocument(division, "PurchaseOrder", docEntry, out _)) { report.Skipped++; continue; }

                var supCode = LegacyEtlHelpers.GetString(row, "SuppCode");
                var whsCode = LegacyEtlHelpers.GetString(row, "WhsCode");
                if (supCode is null || whsCode is null)
                {
                    report.Errors.Add($"PO DocEntry={docEntry}: missing SuppCode or WhsCode");
                    continue;
                }

                var po = new PurchaseOrder
                {
                    LegacyId = docEntry,
                    Number = $"PO-{LegacyEtlHelpers.GetInt(row, "DocNum") ?? docEntry}",
                    Division = division,
                    Status = LegacyEtlHelpers.MapDocumentStatus(LegacyEtlHelpers.GetString(row, "DocStatus")),
                    SupplierId = _idMap.RequireMaster("Supplier", supCode),
                    WarehouseId = _idMap.RequireMaster("Warehouse", whsCode),
                    OrderDate = LegacyEtlHelpers.GetDate(row, "DocDate"),
                };
                if (!opts.DryRun) target.PurchaseOrders.Add(po);
                _idMap.RegisterDocument(division, "PurchaseOrder", docEntry, po.Id);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add(ex.Message); }
        }
        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

    private async Task<MigrationReport> MigrateSalesOrdersAsync(AppDbContext target)
    {
        var report = new MigrationReport("SalesOrders");
        var sql = LegacyEtlHelpers.AppendSinceFilter(
            "SELECT DocEntry, DocNum, DocStatus, DocDate, CompanyIDKu, CustmrCode, WhsCode FROM dbo.[Order]", opts.Since);
        await foreach (var row in ReadLegacyAsync(sql, c => LegacyEtlHelpers.BindSince(c, opts.Since)))
        {
            report.Read++;
            try
            {
                var docEntry = LegacyEtlHelpers.GetInt(row, "DocEntry") ?? 0;
                var division = DivisionForRow(row);
                if (_idMap.TryGetDocument(division, "SalesOrder", docEntry, out _)) { report.Skipped++; continue; }

                var custCode = LegacyEtlHelpers.GetString(row, "CustmrCode");
                var whsCode = LegacyEtlHelpers.GetString(row, "WhsCode");
                if (custCode is null || whsCode is null)
                {
                    report.Errors.Add($"SO DocEntry={docEntry}: missing CustmrCode or WhsCode");
                    continue;
                }

                var so = new SalesOrder
                {
                    LegacyId = docEntry,
                    Number = $"SO-{LegacyEtlHelpers.GetInt(row, "DocNum") ?? docEntry}",
                    Division = division,
                    Status = LegacyEtlHelpers.MapDocumentStatus(LegacyEtlHelpers.GetString(row, "DocStatus")),
                    CustomerId = _idMap.RequireMaster("Customer", custCode),
                    WarehouseId = _idMap.RequireMaster("Warehouse", whsCode),
                    OrderDate = LegacyEtlHelpers.GetDate(row, "DocDate"),
                };
                if (!opts.DryRun) target.SalesOrders.Add(so);
                _idMap.RegisterDocument(division, "SalesOrder", docEntry, so.Id);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add(ex.Message); }
        }
        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

    private async Task<MigrationReport> MigrateInvoicesAsync(AppDbContext target)
    {
        var report = new MigrationReport("Invoices");
        var sql = LegacyEtlHelpers.AppendSinceFilter(
            "SELECT DocEntry, DocNum, DocStatus, DocDate, DocDueDate, CompanyIDKu, CustmrCode FROM dbo.Invoice", opts.Since);
        await foreach (var row in ReadLegacyAsync(sql, c => LegacyEtlHelpers.BindSince(c, opts.Since)))
        {
            report.Read++;
            try
            {
                var docEntry = LegacyEtlHelpers.GetInt(row, "DocEntry") ?? 0;
                var division = DivisionForRow(row);
                if (_idMap.TryGetDocument(division, "Invoice", docEntry, out _)) { report.Skipped++; continue; }

                var custCode = LegacyEtlHelpers.GetString(row, "CustmrCode");
                if (custCode is null)
                {
                    report.Errors.Add($"Invoice DocEntry={docEntry}: missing CustmrCode");
                    continue;
                }

                var inv = new Invoice
                {
                    LegacyId = docEntry,
                    Number = $"INV-{LegacyEtlHelpers.GetInt(row, "DocNum") ?? docEntry}",
                    Division = division,
                    Status = MapInvoiceStatus(LegacyEtlHelpers.GetString(row, "DocStatus")),
                    CustomerId = _idMap.RequireMaster("Customer", custCode),
                    IssueDate = LegacyEtlHelpers.GetDate(row, "DocDate"),
                    DueDate = LegacyEtlHelpers.GetDate(row, "DocDueDate", "DocDate"),
                    Lines = [new InvoiceLine { LineNumber = 1, Description = "Migrated header placeholder", Quantity = 1, UnitPrice = 0 }],
                };
                if (!opts.DryRun) target.Invoices.Add(inv);
                _idMap.RegisterDocument(division, "Invoice", docEntry, inv.Id);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add(ex.Message); }
        }
        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

    private async Task<MigrationReport> MigratePaymentsAsync(AppDbContext target)
    {
        var report = new MigrationReport("Payments");
        // Receipt header
        var headerSql = LegacyEtlHelpers.AppendSinceFilter(
            "SELECT DocEntry, DocNum, DocDate, CompanyIDKu, CustmrCode FROM dbo.Receipt", opts.Since);
        await foreach (var row in ReadLegacyAsync(headerSql, c => LegacyEtlHelpers.BindSince(c, opts.Since)))
        {
            report.Read++;
            try
            {
                var docEntry = LegacyEtlHelpers.GetInt(row, "DocEntry") ?? 0;
                var division = DivisionForRow(row);
                if (_idMap.TryGetDocument(division, "Payment", docEntry, out _)) { report.Skipped++; continue; }

                var custCode = LegacyEtlHelpers.GetString(row, "CustmrCode");
                Guid? customerId = null;
                if (custCode is not null && _idMap.TryGetMaster("Customer", custCode, out var cid))
                    customerId = cid;

                var payment = new Payment
                {
                    LegacyId = docEntry,
                    Division = division,
                    CustomerId = customerId,
                    ReceivedAt = LegacyEtlHelpers.GetDate(row, "DocDate"),
                    Method = PaymentMethod.Cash,
                    Amount = 0,
                    Reference = $"RCP-{LegacyEtlHelpers.GetInt(row, "DocNum") ?? docEntry}",
                };
                if (!opts.DryRun) target.Payments.Add(payment);
                _idMap.RegisterDocument(division, "Payment", docEntry, payment.Id);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add($"Receipt header: {ex.Message}"); }
        }

        // ReceiptDetail1 → payment_allocations
        var detailSql = LegacyEtlHelpers.AppendSinceFilter(
            "SELECT DocEntry, LineNum, BaseEntry, BaseType, SumApplied FROM dbo.ReceiptDetail1", opts.Since);
        await foreach (var row in ReadLegacyAsync(detailSql, c => LegacyEtlHelpers.BindSince(c, opts.Since)))
        {
            report.Read++;
            try
            {
                var receiptEntry = LegacyEtlHelpers.GetInt(row, "DocEntry") ?? 0;
                var division = DivisionForRow(row);
                if (!_idMap.TryGetDocument(division, "Payment", receiptEntry, out var paymentId))
                {
                    report.Errors.Add($"ReceiptDetail1: unresolved Payment DocEntry={receiptEntry}");
                    continue;
                }

                var baseEntry = LegacyEtlHelpers.GetInt(row, "BaseEntry") ?? 0;
                if (!_idMap.TryGetDocument(division, "Invoice", baseEntry, out var invoiceId))
                {
                    report.Errors.Add($"ReceiptDetail1: unresolved Invoice BaseEntry={baseEntry}");
                    continue;
                }

                var amount = LegacyEtlHelpers.GetDecimal(row, "SumApplied", "Amount");
                var alloc = new PaymentAllocation
                {
                    PaymentId = paymentId,
                    InvoiceId = invoiceId,
                    Amount = amount,
                    AllocatedAt = DateTime.UtcNow,
                };
                if (!opts.DryRun) target.PaymentAllocations.Add(alloc);
                report.Written++;
            }
            catch (Exception ex) { report.Errors.Add($"ReceiptDetail1: {ex.Message}"); }
        }

        if (!opts.DryRun) await target.SaveChangesAsync();
        return report;
    }

    private static InvoiceStatus MapInvoiceStatus(string? legacyStatus) => legacyStatus?.Trim().ToUpperInvariant() switch
    {
        "C" => InvoiceStatus.Posted,
        "P" => InvoiceStatus.Posted,
        "B" => InvoiceStatus.Voided,
        "V" => InvoiceStatus.Voided,
        _ => InvoiceStatus.Draft,
    };

    private async Task DumpErrorsAsync(MigrationReport r)
    {
        if (r.Errors.Count == 0) return;
        var path = Path.Combine(opts.ErrorsDirectory, $"{r.Entity.ToLowerInvariant()}.errors.txt");
        await File.WriteAllLinesAsync(path, r.Errors);
    }
}

public sealed class MigrationReport(string entity, int read = 0, int written = 0, int skipped = 0, List<string>? errors = null)
{
    public string Entity { get; } = entity;
    public int Read { get; set; } = read;
    public int Written { get; set; } = written;
    public int Skipped { get; set; } = skipped;
    public List<string> Errors { get; set; } = errors ?? [];
}
