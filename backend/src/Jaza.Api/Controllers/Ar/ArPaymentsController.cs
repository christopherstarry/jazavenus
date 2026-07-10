using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Ar;
using Jaza.Application.Common;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers.Ar;

/// <summary>Batch payment receipts and invoice allocations.</summary>
[ApiController]
[Tags("AR")]
[ProducesResponseType(typeof(ProblemDetails), 400)]
[ProducesResponseType(typeof(ProblemDetails), 401)]
[ProducesResponseType(typeof(ProblemDetails), 403)]
[ProducesResponseType(typeof(ProblemDetails), 404)]
[ProducesResponseType(typeof(ProblemDetails), 409)]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Ar)]
[Route("api/ar/payments")]
public sealed class ArPaymentsController(
    AppDbContext db,
    IDivisionScopeService division,
    IPaymentReceiptService payments,
    IValidator<BatchPaymentDto> val) : ControllerBase
{
    public sealed record PaymentReceiptAllocationDto(Guid InvoiceId, string? InvoiceNumber, decimal Amount, string? Notes);

    public sealed record PaymentReceiptDto(
        Guid Id, string Division, Guid? CustomerId, string? CustomerName,
        DateTime ReceivedAt, Domain.Invoicing.PaymentMethod Method, decimal Amount, string Currency,
        string? Reference, string? Notes, IReadOnlyList<PaymentReceiptAllocationDto> Allocations);

    /// <summary>Lists batch payment receipts (payments with one or more invoice allocations) for the active division.</summary>
    [HttpGet]
    public async Task<PagedResult<PaymentReceiptDto>> List([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.Payments.AsNoTracking()
            .Include(p => p.Customer).Include(p => p.Allocations).ThenInclude(a => a.Invoice)
            .Where(p => p.Allocations.Count > 0), p => p.Division)
            .OrderByDescending(p => p.ReceivedAt);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<PaymentReceiptDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PaymentReceiptDto>> Get(Guid id, CancellationToken ct)
    {
        var p = await db.Payments.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.Allocations).ThenInclude(a => a.Invoice)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(p.Division);
        return Map(p);
    }

    /// <summary>Posts a batch payment and allocates amounts across open invoices.</summary>
    [HttpPost]
    public async Task<ActionResult<BatchPaymentResult>> CreateBatch([FromBody] BatchPaymentDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var div = division.RequireDivisionForWrite();
        var request = new BatchPaymentRequest(
            div, dto.CustomerId, dto.ReceivedAt, dto.Method, dto.Currency,
            dto.Reference, dto.Notes,
            dto.Allocations.Select(a => new PaymentAllocationInput(a.InvoiceId, a.Amount, a.Notes)).ToList());
        var result = await payments.CreateBatchAsync(request, ct);
        return result;
    }

    private static PaymentReceiptDto Map(Domain.Invoicing.Payment p) => new(
        p.Id, p.Division, p.CustomerId, p.Customer?.Name,
        p.ReceivedAt, p.Method, p.Amount, p.Currency, p.Reference, p.Notes,
        p.Allocations.Select(a => new PaymentReceiptAllocationDto(a.InvoiceId, a.Invoice?.Number, a.Amount, a.Notes)).ToList());
}
