using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Returns;
using Jaza.Domain.Common;
using Jaza.Domain.Returns;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Tags("Returns")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Purchase)]
[Route("api/inbound/purchase-returns")]
public sealed class PurchaseReturnsController(
    AppDbContext db,
    IDivisionScopeService division,
    IDocumentNumberGenerator numberGen,
    IReturnsService returns,
    IValidator<PurchaseReturnUpsertDto> val) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<PurchaseReturnDto>> List([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.PurchaseReturns.AsNoTracking()
            .Include(x => x.Supplier).Include(x => x.Warehouse).Include(x => x.GoodsReceiptNote)
            .Include(x => x.Lines).ThenInclude(l => l.Item), x => x.Division)
            .OrderByDescending(x => x.ReturnDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<PurchaseReturnDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PurchaseReturnDto>> Get(Guid id, CancellationToken ct)
    {
        var doc = await Load(id, ct);
        division.EnsureDivisionAccess(doc.Division);
        return Map(doc);
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseReturnDto>> Create([FromBody] PurchaseReturnUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var doc = new PurchaseReturn
        {
            Number = await numberGen.NextAsync("PR", ct),
            Division = division.RequireDivisionForWrite(),
            SupplierId = dto.SupplierId,
            WarehouseId = dto.WarehouseId,
            GoodsReceiptNoteId = dto.GoodsReceiptNoteId,
            ReturnCode = dto.ReturnCode,
            ReturnDate = dto.ReturnDate,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new PurchaseReturnLine
            {
                LineNumber = l.LineNumber,
                BaseDocumentType = l.BaseDocumentType,
                BaseDocumentId = l.BaseDocumentId,
                BaseLineNumber = l.BaseLineNumber,
                BaseQuantity = l.BaseQuantity,
                ItemId = l.ItemId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
                UnitCost = l.UnitCost,
                DiscountPercent = l.DiscountPercent,
            }).ToList(),
        };
        db.PurchaseReturns.Add(doc);
        await db.SaveChangesAsync(ct);
        return await Get(doc.Id, ct);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateDraft(Guid id, [FromBody] PurchaseReturnUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var doc = await db.PurchaseReturns.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Only draft purchase returns can be updated.");

        doc.SupplierId = dto.SupplierId;
        doc.WarehouseId = dto.WarehouseId;
        doc.GoodsReceiptNoteId = dto.GoodsReceiptNoteId;
        doc.ReturnCode = dto.ReturnCode;
        doc.ReturnDate = dto.ReturnDate;
        doc.Notes = dto.Notes;
        db.PurchaseReturnLines.RemoveRange(doc.Lines);
        doc.Lines = dto.Lines.Select(l => new PurchaseReturnLine
        {
            LineNumber = l.LineNumber,
            BaseDocumentType = l.BaseDocumentType,
            BaseDocumentId = l.BaseDocumentId,
            BaseLineNumber = l.BaseLineNumber,
            BaseQuantity = l.BaseQuantity,
            ItemId = l.ItemId,
            LocationId = l.LocationId,
            Quantity = l.Quantity,
            UnitCost = l.UnitCost,
            DiscountPercent = l.DiscountPercent,
        }).ToList();
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Post(Guid id, CancellationToken ct)
    {
        var doc = await db.PurchaseReturns.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        await returns.PostPurchaseReturnAsync(id, ct);
        return NoContent();
    }

    private async Task<PurchaseReturn> Load(Guid id, CancellationToken ct) =>
        await db.PurchaseReturns.AsNoTracking()
            .Include(x => x.Supplier).Include(x => x.Warehouse).Include(x => x.GoodsReceiptNote)
            .Include(x => x.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();

    private static PurchaseReturnDto Map(PurchaseReturn x) => new(
        x.Id, x.Number, x.Division, x.Status,
        x.SupplierId, x.Supplier?.Name, x.WarehouseId, x.Warehouse?.Code,
        x.GoodsReceiptNoteId, x.GoodsReceiptNote?.Number,
        x.ReturnCode, x.ReturnDate, x.Notes,
        x.Lines.Select(l => new PurchaseReturnLineDto(
            l.Id, l.LineNumber, l.BaseDocumentType, l.BaseDocumentId, l.BaseLineNumber, l.BaseQuantity,
            l.ItemId, l.Item?.Sku, l.Item?.Name, l.LocationId, l.Quantity, l.UnitCost, l.DiscountPercent)).ToList());
}
