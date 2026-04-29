using FluentValidation;
using Jaza.Application.Common;
using Jaza.Application.Inbound;
using Jaza.Application.Stock;
using Jaza.Domain.Common;
using Jaza.Domain.Inbound;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.RequireOperator)]
[Route("api/inbound")]
public sealed class InboundController(AppDbContext db,
    IDocumentNumberGenerator numberGen,
    IStockService stock,
    IValidator<PurchaseOrderUpsertDto> poVal,
    IValidator<GoodsReceiptUpsertDto> grnVal) : ControllerBase
{
    // ---------- Purchase Orders ----------
    [HttpGet("purchase-orders")]
    public async Task<PagedResult<PurchaseOrderDto>> ListPOs([FromQuery] PagedRequest q, CancellationToken ct)
    {
        var src = db.PurchaseOrders.AsNoTracking()
            .Include(p => p.Supplier).Include(p => p.Warehouse).Include(p => p.Lines).ThenInclude(l => l.Item)
            .OrderByDescending(p => p.OrderDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<PurchaseOrderDto>(items.Select(MapPo).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("purchase-orders/{id:guid}")]
    public async Task<ActionResult<PurchaseOrderDto>> GetPO(Guid id, CancellationToken ct)
    {
        var p = await db.PurchaseOrders.AsNoTracking()
            .Include(p => p.Supplier).Include(p => p.Warehouse).Include(p => p.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(p => p.Id == id, ct) ?? throw new KeyNotFoundException();
        return MapPo(p);
    }

    [HttpPost("purchase-orders")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<PurchaseOrderDto>> CreatePO([FromBody] PurchaseOrderUpsertDto dto, CancellationToken ct)
    {
        await poVal.ValidateAndThrowAsync(dto, ct);
        var po = new PurchaseOrder
        {
            Number = await numberGen.NextAsync("PO", ct),
            SupplierId = dto.SupplierId,
            WarehouseId = dto.WarehouseId,
            OrderDate = dto.OrderDate,
            ExpectedDate = dto.ExpectedDate,
            Currency = dto.Currency,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new PurchaseOrderLine
            {
                LineNumber = l.LineNumber,
                ItemId = l.ItemId,
                Quantity = l.Quantity,
                UnitPrice = l.UnitPrice,
                DiscountPercent = l.DiscountPercent,
                TaxPercent = l.TaxPercent,
            }).ToList(),
        };
        db.PurchaseOrders.Add(po);
        await db.SaveChangesAsync(ct);
        return await GetPO(po.Id, ct);
    }

    [HttpPost("purchase-orders/{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> PostPO(Guid id, CancellationToken ct)
    {
        var p = await db.PurchaseOrders.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        if (p.Status != DocumentStatus.Draft) throw new DomainException("Only draft POs can be posted.");
        p.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ---------- Goods Receipt Notes ----------
    [HttpGet("grns")]
    public async Task<PagedResult<GoodsReceiptDto>> ListGRNs([FromQuery] PagedRequest q, CancellationToken ct)
    {
        var src = db.GoodsReceiptNotes.AsNoTracking()
            .Include(g => g.Supplier).Include(g => g.Warehouse).Include(g => g.PurchaseOrder)
            .Include(g => g.Lines).ThenInclude(l => l.Item)
            .OrderByDescending(g => g.ReceivedAt);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<GoodsReceiptDto>(items.Select(MapGrn).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("grns/{id:guid}")]
    public async Task<ActionResult<GoodsReceiptDto>> GetGRN(Guid id, CancellationToken ct)
    {
        var g = await db.GoodsReceiptNotes.AsNoTracking()
            .Include(x => x.Supplier).Include(x => x.Warehouse).Include(x => x.PurchaseOrder)
            .Include(x => x.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        return MapGrn(g);
    }

    [HttpPost("grns")]
    public async Task<ActionResult<GoodsReceiptDto>> CreateGRN([FromBody] GoodsReceiptUpsertDto dto, CancellationToken ct)
    {
        await grnVal.ValidateAndThrowAsync(dto, ct);
        var grn = new GoodsReceiptNote
        {
            Number = await numberGen.NextAsync("GRN", ct),
            PurchaseOrderId = dto.PurchaseOrderId,
            SupplierId = dto.SupplierId,
            WarehouseId = dto.WarehouseId,
            ReceivedAt = dto.ReceivedAt,
            SupplierDeliveryNote = dto.SupplierDeliveryNote,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new GoodsReceiptLine
            {
                LineNumber = l.LineNumber,
                PurchaseOrderLineId = l.PurchaseOrderLineId,
                ItemId = l.ItemId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
                UnitCost = l.UnitCost,
                BatchOrSerial = l.BatchOrSerial,
                ExpiryDate = l.ExpiryDate,
            }).ToList(),
        };
        db.GoodsReceiptNotes.Add(grn);
        await db.SaveChangesAsync(ct);
        return await GetGRN(grn.Id, ct);
    }

    /// <summary>Posting a GRN is the only way to bring stock into the system.</summary>
    [HttpPost("grns/{id:guid}/post")]
    public async Task<IActionResult> PostGRN(Guid id, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var grn = await db.GoodsReceiptNotes.Include(g => g.Lines)
            .FirstOrDefaultAsync(g => g.Id == id, ct) ?? throw new KeyNotFoundException();
        if (grn.Status != DocumentStatus.Draft) throw new DomainException("GRN already posted.");

        foreach (var l in grn.Lines)
        {
            await stock.PostMovementAsync(new StockMovement
            {
                Type = StockMovementType.GoodsReceipt,
                ItemId = l.ItemId,
                WarehouseId = grn.WarehouseId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
                UnitCost = l.UnitCost,
                OccurredAtUtc = grn.ReceivedAt.ToUniversalTime(),
                SourceDocumentType = nameof(GoodsReceiptNote),
                SourceDocumentId = grn.Id,
                SourceDocumentNumber = grn.Number,
            }, ct);

            if (l.PurchaseOrderLineId is not null)
            {
                var pol = await db.PurchaseOrderLines.FindAsync([l.PurchaseOrderLineId.Value], ct);
                if (pol is not null) pol.QuantityReceived += l.Quantity;
            }
        }

        grn.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return NoContent();
    }

    // ---------- Mappers ----------
    private static PurchaseOrderDto MapPo(PurchaseOrder p) => new(
        p.Id, p.Number, p.Status,
        p.SupplierId, p.Supplier?.Name, p.WarehouseId, p.Warehouse?.Code,
        p.OrderDate, p.ExpectedDate, p.Currency, p.Notes,
        p.SubTotal, p.TaxTotal, p.GrandTotal,
        p.Lines.Select(l => new PurchaseOrderLineDto(
            l.Id, l.LineNumber, l.ItemId, l.Item?.Sku, l.Item?.Name,
            l.Quantity, l.UnitPrice, l.DiscountPercent, l.TaxPercent,
            l.QuantityReceived, l.QuantityOpen)).ToList());

    private static GoodsReceiptDto MapGrn(GoodsReceiptNote g) => new(
        g.Id, g.Number, g.Status,
        g.PurchaseOrderId, g.PurchaseOrder?.Number,
        g.SupplierId, g.Supplier?.Name,
        g.WarehouseId, g.Warehouse?.Code,
        g.ReceivedAt, g.SupplierDeliveryNote, g.Notes,
        g.Lines.Select(l => new GoodsReceiptLineDto(
            l.Id, l.LineNumber, l.PurchaseOrderLineId, l.ItemId, l.Item?.Sku, l.Item?.Name,
            l.LocationId, l.Quantity, l.UnitCost, l.BatchOrSerial, l.ExpiryDate)).ToList());
}
