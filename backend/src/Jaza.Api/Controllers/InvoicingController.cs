using FluentValidation;
using Jaza.Application.Common;
using Jaza.Application.Invoicing;
using Jaza.Domain.Common;
using Jaza.Domain.Invoicing;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.RequireOperator)]
[Route("api/invoices")]
public sealed class InvoicingController(AppDbContext db,
    IDocumentNumberGenerator numberGen,
    IValidator<InvoiceUpsertDto> invVal,
    IValidator<PaymentCreateDto> payVal) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<InvoiceDto>> List([FromQuery] PagedRequest q, CancellationToken ct)
    {
        var src = db.Invoices.AsNoTracking()
            .Include(i => i.Customer).Include(i => i.DeliveryOrder)
            .Include(i => i.Lines).Include(i => i.Payments)
            .OrderByDescending(i => i.IssueDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<InvoiceDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<InvoiceDto>> Get(Guid id, CancellationToken ct)
    {
        var i = await db.Invoices.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.DeliveryOrder)
            .Include(x => x.Lines).Include(x => x.Payments)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        return Map(i);
    }

    [HttpPost]
    public async Task<ActionResult<InvoiceDto>> Create([FromBody] InvoiceUpsertDto dto, CancellationToken ct)
    {
        await invVal.ValidateAndThrowAsync(dto, ct);
        var inv = new Invoice
        {
            Number = await numberGen.NextAsync("INV", ct),
            CustomerId = dto.CustomerId,
            DeliveryOrderId = dto.DeliveryOrderId,
            IssueDate = dto.IssueDate,
            DueDate = dto.DueDate,
            Currency = dto.Currency,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new InvoiceLine
            {
                LineNumber = l.LineNumber,
                ItemId = l.ItemId,
                Description = l.Description,
                Quantity = l.Quantity,
                UnitPrice = l.UnitPrice,
                DiscountPercent = l.DiscountPercent,
                TaxPercent = l.TaxPercent,
            }).ToList(),
        };
        db.Invoices.Add(inv);
        await db.SaveChangesAsync(ct);
        return await Get(inv.Id, ct);
    }

    [HttpPost("{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Post(Guid id, CancellationToken ct)
    {
        var inv = await db.Invoices.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        if (inv.Status != InvoiceStatus.Draft) throw new DomainException("Only draft invoices can be posted.");
        inv.Status = InvoiceStatus.Posted;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/void")]
    [Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> Void(Guid id, CancellationToken ct)
    {
        var inv = await db.Invoices.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        if (inv.Status == InvoiceStatus.Voided) return NoContent();
        inv.Status = InvoiceStatus.Voided;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/pdf")]
    public async Task<IActionResult> DownloadPdf(Guid id, CancellationToken ct)
    {
        var inv = await db.Invoices.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.Lines).Include(x => x.Payments)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        var bytes = Jaza.Api.Pdf.InvoicePdf.Render(inv);
        return File(bytes, "application/pdf", $"{inv.Number}.pdf");
    }

    [HttpPost("{id:guid}/payments")]
    public async Task<ActionResult<PaymentDto>> AddPayment(Guid id, [FromBody] PaymentCreateDto dto, CancellationToken ct)
    {
        await payVal.ValidateAndThrowAsync(dto, ct);
        var inv = await db.Invoices.Include(x => x.Payments)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        if (inv.Status is not (InvoiceStatus.Posted or InvoiceStatus.PartiallyPaid))
            throw new DomainException("Cannot add a payment to a draft or voided invoice.");

        var payment = new Payment
        {
            InvoiceId = id,
            ReceivedAt = dto.ReceivedAt,
            Method = dto.Method,
            Amount = dto.Amount,
            Currency = dto.Currency,
            Reference = dto.Reference,
            Notes = dto.Notes,
        };
        db.Payments.Add(payment);

        var newPaid = inv.AmountPaid + dto.Amount;
        if (newPaid >= inv.GrandTotal) inv.Status = InvoiceStatus.Paid;
        else inv.Status = InvoiceStatus.PartiallyPaid;

        await db.SaveChangesAsync(ct);
        return new PaymentDto(payment.Id, id, payment.ReceivedAt, payment.Method,
            payment.Amount, payment.Currency, payment.Reference, payment.Notes);
    }

    private static InvoiceDto Map(Invoice i) => new(
        i.Id, i.Number, i.Status,
        i.CustomerId, i.Customer?.Name, i.DeliveryOrderId, i.DeliveryOrder?.Number,
        i.IssueDate, i.DueDate, i.Currency, i.Notes,
        i.SubTotal, i.TaxTotal, i.GrandTotal, i.AmountPaid, i.AmountDue,
        i.Lines.Select(l => new InvoiceLineDto(
            l.Id, l.LineNumber, l.ItemId, l.Description,
            l.Quantity, l.UnitPrice, l.DiscountPercent, l.TaxPercent)).ToList());
}
