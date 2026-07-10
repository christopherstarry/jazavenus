using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Inventory;
using Jaza.Domain.Common;
using Jaza.Domain.Inventory;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers.Inventory;

[ApiController]
[Tags("Inventory")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Inventory)]
[Route("api/inventory")]
public sealed class InventoryDocumentsController(
    AppDbContext db,
    IDivisionScopeService division,
    IDocumentNumberGenerator numberGen,
    IInventoryDocumentService inventory,
    IValidator<StockReceiptUpsertDto> receiptVal,
    IValidator<StockIssueUpsertDto> issueVal,
    IValidator<StockTransferUpsertDto> transferVal) : ControllerBase
{
    // ---------- Stock Receipts ----------
    [HttpGet("stock-receipts")]
    public async Task<PagedResult<StockReceiptDto>> ListReceipts([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.StockReceipts.AsNoTracking()
            .Include(x => x.Warehouse).Include(x => x.Lines).ThenInclude(l => l.Item), x => x.Division)
            .OrderByDescending(x => x.ReceiptDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<StockReceiptDto>(items.Select(MapReceipt).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("stock-receipts/{id:guid}")]
    public async Task<ActionResult<StockReceiptDto>> GetReceipt(Guid id, CancellationToken ct)
    {
        var doc = await LoadReceipt(id, ct);
        division.EnsureDivisionAccess(doc.Division);
        return MapReceipt(doc);
    }

    [HttpPost("stock-receipts")]
    public async Task<ActionResult<StockReceiptDto>> CreateReceipt([FromBody] StockReceiptUpsertDto dto, CancellationToken ct)
    {
        await receiptVal.ValidateAndThrowAsync(dto, ct);
        var doc = new StockReceipt
        {
            Number = await numberGen.NextAsync("SREC", ct),
            Division = division.RequireDivisionForWrite(),
            WarehouseId = dto.WarehouseId,
            ReceiptDate = dto.ReceiptDate,
            ReasonCode = dto.ReasonCode,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new StockReceiptLine
            {
                LineNumber = l.LineNumber,
                ItemId = l.ItemId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
                UnitCost = l.UnitCost,
                BatchOrSerial = l.BatchOrSerial,
            }).ToList(),
        };
        db.StockReceipts.Add(doc);
        await db.SaveChangesAsync(ct);
        return await GetReceipt(doc.Id, ct);
    }

    [HttpPut("stock-receipts/{id:guid}")]
    public async Task<IActionResult> UpdateReceipt(Guid id, [FromBody] StockReceiptUpsertDto dto, CancellationToken ct)
    {
        await receiptVal.ValidateAndThrowAsync(dto, ct);
        var doc = await db.StockReceipts.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Only draft stock receipts can be updated.");
        ApplyReceipt(doc, dto);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("stock-receipts/{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> PostReceipt(Guid id, CancellationToken ct)
    {
        var doc = await db.StockReceipts.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        await inventory.PostStockReceiptAsync(id, ct);
        return NoContent();
    }

    // ---------- Stock Issues ----------
    [HttpGet("stock-issues")]
    public async Task<PagedResult<StockIssueDto>> ListIssues([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.StockIssues.AsNoTracking()
            .Include(x => x.Warehouse).Include(x => x.Lines).ThenInclude(l => l.Item), x => x.Division)
            .OrderByDescending(x => x.IssueDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<StockIssueDto>(items.Select(MapIssue).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("stock-issues/{id:guid}")]
    public async Task<ActionResult<StockIssueDto>> GetIssue(Guid id, CancellationToken ct)
    {
        var doc = await LoadIssue(id, ct);
        division.EnsureDivisionAccess(doc.Division);
        return MapIssue(doc);
    }

    [HttpPost("stock-issues")]
    public async Task<ActionResult<StockIssueDto>> CreateIssue([FromBody] StockIssueUpsertDto dto, CancellationToken ct)
    {
        await issueVal.ValidateAndThrowAsync(dto, ct);
        var doc = new StockIssue
        {
            Number = await numberGen.NextAsync("SISS", ct),
            Division = division.RequireDivisionForWrite(),
            WarehouseId = dto.WarehouseId,
            IssueDate = dto.IssueDate,
            ReasonCode = dto.ReasonCode,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new StockIssueLine
            {
                LineNumber = l.LineNumber,
                ItemId = l.ItemId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
                UnitCost = l.UnitCost,
            }).ToList(),
        };
        db.StockIssues.Add(doc);
        await db.SaveChangesAsync(ct);
        return await GetIssue(doc.Id, ct);
    }

    [HttpPut("stock-issues/{id:guid}")]
    public async Task<IActionResult> UpdateIssue(Guid id, [FromBody] StockIssueUpsertDto dto, CancellationToken ct)
    {
        await issueVal.ValidateAndThrowAsync(dto, ct);
        var doc = await db.StockIssues.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Only draft stock issues can be updated.");
        ApplyIssue(doc, dto);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("stock-issues/{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> PostIssue(Guid id, CancellationToken ct)
    {
        var doc = await db.StockIssues.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        await inventory.PostStockIssueAsync(id, ct);
        return NoContent();
    }

    // ---------- Stock Transfers ----------
    [HttpGet("stock-transfers")]
    public async Task<PagedResult<StockTransferDto>> ListTransfers([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.StockTransfers.AsNoTracking()
            .Include(x => x.FromWarehouse).Include(x => x.ToWarehouse)
            .Include(x => x.Lines).ThenInclude(l => l.Item), x => x.Division)
            .OrderByDescending(x => x.TransferDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<StockTransferDto>(items.Select(MapTransfer).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("stock-transfers/{id:guid}")]
    public async Task<ActionResult<StockTransferDto>> GetTransfer(Guid id, CancellationToken ct)
    {
        var doc = await LoadTransfer(id, ct);
        division.EnsureDivisionAccess(doc.Division);
        return MapTransfer(doc);
    }

    [HttpPost("stock-transfers")]
    public async Task<ActionResult<StockTransferDto>> CreateTransfer([FromBody] StockTransferUpsertDto dto, CancellationToken ct)
    {
        await transferVal.ValidateAndThrowAsync(dto, ct);
        var doc = new StockTransfer
        {
            Number = await numberGen.NextAsync("XFER", ct),
            Division = division.RequireDivisionForWrite(),
            FromWarehouseId = dto.FromWarehouseId,
            ToWarehouseId = dto.ToWarehouseId,
            TransferDate = dto.TransferDate,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new StockTransferLine
            {
                LineNumber = l.LineNumber,
                ItemId = l.ItemId,
                FromLocationId = l.FromLocationId,
                ToLocationId = l.ToLocationId,
                Quantity = l.Quantity,
            }).ToList(),
        };
        db.StockTransfers.Add(doc);
        await db.SaveChangesAsync(ct);
        return await GetTransfer(doc.Id, ct);
    }

    [HttpPut("stock-transfers/{id:guid}")]
    public async Task<IActionResult> UpdateTransfer(Guid id, [FromBody] StockTransferUpsertDto dto, CancellationToken ct)
    {
        await transferVal.ValidateAndThrowAsync(dto, ct);
        var doc = await db.StockTransfers.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Only draft stock transfers can be updated.");
        ApplyTransfer(doc, dto);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("stock-transfers/{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> PostTransfer(Guid id, CancellationToken ct)
    {
        var doc = await db.StockTransfers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        await inventory.PostStockTransferAsync(id, ct);
        return NoContent();
    }

    private static void ApplyReceipt(StockReceipt doc, StockReceiptUpsertDto dto)
    {
        doc.WarehouseId = dto.WarehouseId;
        doc.ReceiptDate = dto.ReceiptDate;
        doc.ReasonCode = dto.ReasonCode;
        doc.Notes = dto.Notes;
        doc.Lines.Clear();
        foreach (var l in dto.Lines)
            doc.Lines.Add(new StockReceiptLine
            {
                LineNumber = l.LineNumber,
                ItemId = l.ItemId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
                UnitCost = l.UnitCost,
                BatchOrSerial = l.BatchOrSerial,
            });
    }

    private static void ApplyIssue(StockIssue doc, StockIssueUpsertDto dto)
    {
        doc.WarehouseId = dto.WarehouseId;
        doc.IssueDate = dto.IssueDate;
        doc.ReasonCode = dto.ReasonCode;
        doc.Notes = dto.Notes;
        doc.Lines.Clear();
        foreach (var l in dto.Lines)
            doc.Lines.Add(new StockIssueLine
            {
                LineNumber = l.LineNumber,
                ItemId = l.ItemId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
                UnitCost = l.UnitCost,
            });
    }

    private static void ApplyTransfer(StockTransfer doc, StockTransferUpsertDto dto)
    {
        doc.FromWarehouseId = dto.FromWarehouseId;
        doc.ToWarehouseId = dto.ToWarehouseId;
        doc.TransferDate = dto.TransferDate;
        doc.Notes = dto.Notes;
        doc.Lines.Clear();
        foreach (var l in dto.Lines)
            doc.Lines.Add(new StockTransferLine
            {
                LineNumber = l.LineNumber,
                ItemId = l.ItemId,
                FromLocationId = l.FromLocationId,
                ToLocationId = l.ToLocationId,
                Quantity = l.Quantity,
            });
    }

    private async Task<StockReceipt> LoadReceipt(Guid id, CancellationToken ct) =>
        await db.StockReceipts.AsNoTracking().Include(x => x.Warehouse).Include(x => x.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();

    private async Task<StockIssue> LoadIssue(Guid id, CancellationToken ct) =>
        await db.StockIssues.AsNoTracking().Include(x => x.Warehouse).Include(x => x.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();

    private async Task<StockTransfer> LoadTransfer(Guid id, CancellationToken ct) =>
        await db.StockTransfers.AsNoTracking()
            .Include(x => x.FromWarehouse).Include(x => x.ToWarehouse)
            .Include(x => x.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();

    private static StockReceiptDto MapReceipt(StockReceipt x) => new(
        x.Id, x.Number, x.Division, x.Status, x.WarehouseId, x.Warehouse?.Code,
        x.ReceiptDate, x.ReasonCode, x.Notes,
        x.Lines.Select(l => new StockReceiptLineDto(
            l.Id, l.LineNumber, l.ItemId, l.Item?.Sku, l.Item?.Name,
            l.LocationId, l.Quantity, l.UnitCost, l.BatchOrSerial)).ToList());

    private static StockIssueDto MapIssue(StockIssue x) => new(
        x.Id, x.Number, x.Division, x.Status, x.WarehouseId, x.Warehouse?.Code,
        x.IssueDate, x.ReasonCode, x.Notes,
        x.Lines.Select(l => new StockIssueLineDto(
            l.Id, l.LineNumber, l.ItemId, l.Item?.Sku, l.Item?.Name,
            l.LocationId, l.Quantity, l.UnitCost)).ToList());

    private static StockTransferDto MapTransfer(StockTransfer x) => new(
        x.Id, x.Number, x.Division, x.Status,
        x.FromWarehouseId, x.FromWarehouse?.Code, x.ToWarehouseId, x.ToWarehouse?.Code,
        x.TransferDate, x.Notes,
        x.Lines.Select(l => new StockTransferLineDto(
            l.Id, l.LineNumber, l.ItemId, l.Item?.Sku, l.Item?.Name,
            l.FromLocationId, l.ToLocationId, l.Quantity)).ToList());
}
