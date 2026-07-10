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

namespace Jaza.Api.Controllers.Sales;

/// <summary>Sales return documents linked to deliveries and invoices.</summary>
[ApiController]
[Tags("Returns")]
[ProducesResponseType(typeof(ProblemDetails), 400)]
[ProducesResponseType(typeof(ProblemDetails), 401)]
[ProducesResponseType(typeof(ProblemDetails), 403)]
[ProducesResponseType(typeof(ProblemDetails), 404)]
[ProducesResponseType(typeof(ProblemDetails), 409)]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Sales)]
[Route("api/outbound/sales-returns")]
public sealed class SalesReturnsController(
    AppDbContext db,
    IDivisionScopeService division,
    IDocumentNumberGenerator numberGen,
    IReturnsService returns,
    IValidator<SalesReturnUpsertDto> val) : ControllerBase
{
    /// <summary>Lists sales returns for the active division, newest first.</summary>
    [HttpGet]
    public async Task<PagedResult<SalesReturnDto>> List([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.SalesReturns.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.Warehouse)
            .Include(x => x.DeliveryOrder).Include(x => x.Invoice)
            .Include(x => x.Lines).ThenInclude(l => l.Item), x => x.Division)
            .OrderByDescending(x => x.ReturnDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<SalesReturnDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    /// <summary>Returns a single sales return with lines and linked documents.</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SalesReturnDto>> Get(Guid id, CancellationToken ct)
    {
        var doc = await Load(id, ct);
        division.EnsureDivisionAccess(doc.Division);
        return Map(doc);
    }

    /// <summary>Creates a draft sales return and assigns the next document number.</summary>
    [HttpPost]
    public async Task<ActionResult<SalesReturnDto>> Create([FromBody] SalesReturnUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var doc = new SalesReturn
        {
            Number = await numberGen.NextAsync("SR", ct),
            Division = division.RequireDivisionForWrite(),
            CustomerId = dto.CustomerId,
            WarehouseId = dto.WarehouseId,
            DeliveryOrderId = dto.DeliveryOrderId,
            InvoiceId = dto.InvoiceId,
            ReturnCode = dto.ReturnCode,
            ReturnDate = dto.ReturnDate,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new SalesReturnLine
            {
                LineNumber = l.LineNumber,
                BaseDocumentType = l.BaseDocumentType,
                BaseDocumentId = l.BaseDocumentId,
                BaseLineNumber = l.BaseLineNumber,
                BaseQuantity = l.BaseQuantity,
                ItemId = l.ItemId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
                UnitPrice = l.UnitPrice,
                DiscountPercent = l.DiscountPercent,
                Discount2Percent = l.Discount2Percent,
                Discount3Percent = l.Discount3Percent,
                TaxPercent = l.TaxPercent,
            }).ToList(),
        };
        db.SalesReturns.Add(doc);
        await db.SaveChangesAsync(ct);
        return await Get(doc.Id, ct);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateDraft(Guid id, [FromBody] SalesReturnUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var doc = await db.SalesReturns.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Only draft sales returns can be updated.");

        doc.CustomerId = dto.CustomerId;
        doc.WarehouseId = dto.WarehouseId;
        doc.DeliveryOrderId = dto.DeliveryOrderId;
        doc.InvoiceId = dto.InvoiceId;
        doc.ReturnCode = dto.ReturnCode;
        doc.ReturnDate = dto.ReturnDate;
        doc.Notes = dto.Notes;
        db.SalesReturnLines.RemoveRange(doc.Lines);
        doc.Lines = dto.Lines.Select(l => new SalesReturnLine
        {
            LineNumber = l.LineNumber,
            BaseDocumentType = l.BaseDocumentType,
            BaseDocumentId = l.BaseDocumentId,
            BaseLineNumber = l.BaseLineNumber,
            BaseQuantity = l.BaseQuantity,
            ItemId = l.ItemId,
            LocationId = l.LocationId,
            Quantity = l.Quantity,
            UnitPrice = l.UnitPrice,
            DiscountPercent = l.DiscountPercent,
            Discount2Percent = l.Discount2Percent,
            Discount3Percent = l.Discount3Percent,
            TaxPercent = l.TaxPercent,
        }).ToList();
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Post(Guid id, CancellationToken ct)
    {
        var doc = await db.SalesReturns.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        await returns.PostSalesReturnAsync(id, ct);
        return NoContent();
    }

    private async Task<SalesReturn> Load(Guid id, CancellationToken ct) =>
        await db.SalesReturns.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.Warehouse)
            .Include(x => x.DeliveryOrder).Include(x => x.Invoice)
            .Include(x => x.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();

    private static SalesReturnDto Map(SalesReturn x) => new(
        x.Id, x.Number, x.Division, x.Status,
        x.CustomerId, x.Customer?.Name, x.WarehouseId, x.Warehouse?.Code,
        x.DeliveryOrderId, x.DeliveryOrder?.Number, x.InvoiceId, x.Invoice?.Number,
        x.ReturnCode, x.ReturnDate, x.Notes,
        x.Lines.Select(l => new SalesReturnLineDto(
            l.Id, l.LineNumber, l.BaseDocumentType, l.BaseDocumentId, l.BaseLineNumber, l.BaseQuantity,
            l.ItemId, l.Item?.Sku, l.Item?.Name, l.LocationId, l.Quantity, l.UnitPrice,
            l.DiscountPercent, l.Discount2Percent, l.Discount3Percent, l.TaxPercent)).ToList());
}
