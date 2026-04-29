using ClosedXML.Excel;
using Jaza.Application.Common;
using Jaza.Domain.MasterData;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.RequireAdmin)]
[Route("api/io")]
public sealed class ImportExportController(AppDbContext db) : ControllerBase
{
    [HttpGet("items.xlsx")]
    public async Task<IActionResult> ExportItems(CancellationToken ct)
    {
        var items = await db.Items.AsNoTracking().Include(x => x.Category).Include(x => x.Unit)
            .OrderBy(x => x.Sku).ToListAsync(ct);

        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("Items");
        var headers = new[] { "Sku", "Name", "Barcode", "Category", "Unit", "StandardCost", "StandardPrice", "Currency", "ReorderLevel", "ReorderQty", "Active" };
        for (var i = 0; i < headers.Length; i++) ws.Cell(1, i + 1).Value = headers[i];

        for (var r = 0; r < items.Count; r++)
        {
            var x = items[r];
            ws.Cell(r + 2, 1).Value = x.Sku;
            ws.Cell(r + 2, 2).Value = x.Name;
            ws.Cell(r + 2, 3).Value = x.Barcode;
            ws.Cell(r + 2, 4).Value = x.Category?.Code;
            ws.Cell(r + 2, 5).Value = x.Unit?.Code;
            ws.Cell(r + 2, 6).Value = x.StandardCost;
            ws.Cell(r + 2, 7).Value = x.StandardPrice;
            ws.Cell(r + 2, 8).Value = x.Currency;
            ws.Cell(r + 2, 9).Value = x.ReorderLevel;
            ws.Cell(r + 2, 10).Value = x.ReorderQuantity;
            ws.Cell(r + 2, 11).Value = x.IsActive;
        }
        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return File(ms.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "items.xlsx");
    }

    public sealed record ImportSummary(int Created, int Updated, IReadOnlyList<string> Errors);

    [HttpPost("items.xlsx")]
    [RequestSizeLimit(20_000_000)]
    public async Task<ActionResult<ImportSummary>> ImportItems([FromForm] IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0) return BadRequest(new { error = "no_file" });
        var errors = new List<string>(); int created = 0, updated = 0;

        using var stream = file.OpenReadStream();
        using var wb = new XLWorkbook(stream);
        var ws = wb.Worksheets.First();

        var categories = await db.Categories.ToDictionaryAsync(c => c.Code, ct);
        var units = await db.Units.ToDictionaryAsync(u => u.Code, ct);
        var existing = await db.Items.ToDictionaryAsync(i => i.Sku, ct);

        var rowIndex = 1;
        foreach (var row in ws.RowsUsed().Skip(1))
        {
            rowIndex++;
            try
            {
                var sku = row.Cell(1).GetString().Trim().ToUpperInvariant();
                if (string.IsNullOrEmpty(sku)) continue;
                var catCode = row.Cell(4).GetString().Trim();
                var uomCode = row.Cell(5).GetString().Trim();
                if (!categories.TryGetValue(catCode, out var cat)) { errors.Add($"Row {rowIndex}: unknown category '{catCode}'"); continue; }
                if (!units.TryGetValue(uomCode, out var unit)) { errors.Add($"Row {rowIndex}: unknown unit '{uomCode}'"); continue; }

                if (existing.TryGetValue(sku, out var item))
                {
                    item.Name = row.Cell(2).GetString();
                    item.Barcode = row.Cell(3).GetString();
                    item.CategoryId = cat.Id;
                    item.UnitId = unit.Id;
                    item.StandardCost = (decimal)row.Cell(6).GetDouble();
                    item.StandardPrice = (decimal)row.Cell(7).GetDouble();
                    item.Currency = row.Cell(8).GetString();
                    item.ReorderLevel = row.Cell(9).IsEmpty() ? null : (decimal?)row.Cell(9).GetDouble();
                    item.ReorderQuantity = row.Cell(10).IsEmpty() ? null : (decimal?)row.Cell(10).GetDouble();
                    item.IsActive = row.Cell(11).GetBoolean();
                    updated++;
                }
                else
                {
                    db.Items.Add(new Item
                    {
                        Sku = sku,
                        Name = row.Cell(2).GetString(),
                        Barcode = row.Cell(3).GetString(),
                        CategoryId = cat.Id, UnitId = unit.Id,
                        StandardCost = (decimal)row.Cell(6).GetDouble(),
                        StandardPrice = (decimal)row.Cell(7).GetDouble(),
                        Currency = row.Cell(8).GetString(),
                        ReorderLevel = row.Cell(9).IsEmpty() ? null : (decimal?)row.Cell(9).GetDouble(),
                        ReorderQuantity = row.Cell(10).IsEmpty() ? null : (decimal?)row.Cell(10).GetDouble(),
                        IsActive = row.Cell(11).GetBoolean(),
                    });
                    created++;
                }
            }
            catch (Exception ex) { errors.Add($"Row {rowIndex}: {ex.Message}"); }
        }
        await db.SaveChangesAsync(ct);
        return new ImportSummary(created, updated, errors);
    }
}
