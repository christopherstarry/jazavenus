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

[ApiController]
[Tags("Invoicing")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Ar)]
[Route("api/invoices/credit-memos")]
public sealed class CreditMemosController(
    AppDbContext db,
    IDivisionScopeService division,
    IDocumentNumberGenerator numberGen,
    IReturnsService returns,
    IValidator<CreditMemoUpsertDto> val) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<CreditMemoDto>> List([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.CreditMemos.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.SalesReturn).Include(x => x.Invoice)
            .Include(x => x.Lines).ThenInclude(l => l.Item), x => x.Division)
            .OrderByDescending(x => x.IssueDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<CreditMemoDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CreditMemoDto>> Get(Guid id, CancellationToken ct)
    {
        var doc = await Load(id, ct);
        division.EnsureDivisionAccess(doc.Division);
        return Map(doc);
    }

    [HttpPost]
    public async Task<ActionResult<CreditMemoDto>> Create([FromBody] CreditMemoUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var doc = new CreditMemo
        {
            Number = await numberGen.NextAsync("CM", ct),
            Division = division.RequireDivisionForWrite(),
            CustomerId = dto.CustomerId,
            SalesReturnId = dto.SalesReturnId,
            InvoiceId = dto.InvoiceId,
            IssueDate = dto.IssueDate,
            Currency = dto.Currency,
            TaxSerial = dto.TaxSerial,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new CreditMemoLine
            {
                LineNumber = l.LineNumber,
                BaseDocumentType = l.BaseDocumentType,
                BaseDocumentId = l.BaseDocumentId,
                BaseLineNumber = l.BaseLineNumber,
                BaseQuantity = l.BaseQuantity,
                ItemId = l.ItemId,
                Description = l.Description,
                Quantity = l.Quantity,
                UnitPrice = l.UnitPrice,
                DiscountPercent = l.DiscountPercent,
                TaxPercent = l.TaxPercent,
            }).ToList(),
        };
        db.CreditMemos.Add(doc);
        await db.SaveChangesAsync(ct);
        return await Get(doc.Id, ct);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateDraft(Guid id, [FromBody] CreditMemoUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var doc = await db.CreditMemos.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Only draft credit memos can be updated.");

        doc.CustomerId = dto.CustomerId;
        doc.SalesReturnId = dto.SalesReturnId;
        doc.InvoiceId = dto.InvoiceId;
        doc.IssueDate = dto.IssueDate;
        doc.Currency = dto.Currency;
        doc.TaxSerial = dto.TaxSerial;
        doc.Notes = dto.Notes;
        db.CreditMemoLines.RemoveRange(doc.Lines);
        doc.Lines = dto.Lines.Select(l => new CreditMemoLine
        {
            LineNumber = l.LineNumber,
            BaseDocumentType = l.BaseDocumentType,
            BaseDocumentId = l.BaseDocumentId,
            BaseLineNumber = l.BaseLineNumber,
            BaseQuantity = l.BaseQuantity,
            ItemId = l.ItemId,
            Description = l.Description,
            Quantity = l.Quantity,
            UnitPrice = l.UnitPrice,
            DiscountPercent = l.DiscountPercent,
            TaxPercent = l.TaxPercent,
        }).ToList();
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Post(Guid id, CancellationToken ct)
    {
        var doc = await db.CreditMemos.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        await returns.PostCreditMemoAsync(id, ct);
        return NoContent();
    }

    private async Task<CreditMemo> Load(Guid id, CancellationToken ct) =>
        await db.CreditMemos.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.SalesReturn).Include(x => x.Invoice)
            .Include(x => x.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();

    private static CreditMemoDto Map(CreditMemo x) => new(
        x.Id, x.Number, x.Division, x.Status,
        x.CustomerId, x.Customer?.Name, x.SalesReturnId, x.SalesReturn?.Number,
        x.InvoiceId, x.Invoice?.Number, x.IssueDate, x.Currency, x.TaxSerial, x.Notes,
        x.Lines.Select(l => new CreditMemoLineDto(
            l.Id, l.LineNumber, l.BaseDocumentType, l.BaseDocumentId, l.BaseLineNumber, l.BaseQuantity,
            l.ItemId, l.Item?.Sku, l.Item?.Name, l.Description, l.Quantity, l.UnitPrice,
            l.DiscountPercent, l.TaxPercent)).ToList());
}
