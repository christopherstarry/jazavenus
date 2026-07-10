using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Tax;
using Jaza.Domain.Common;
using Jaza.Domain.Tax;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Tags("Tax")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Sales)]
[Route("api/tax/serials")]
public sealed class TaxSerialsController(
    AppDbContext db,
    IDivisionScopeService division,
    IValidator<TaxInvoiceSerialUpsertDto> val) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<TaxInvoiceSerialDto>> List([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.TaxInvoiceSerials.AsNoTracking()
            .Include(x => x.TaxRegistration), x => x.Division)
            .OrderBy(x => x.SerialNumber);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<TaxInvoiceSerialDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaxInvoiceSerialDto>> Get(Guid id, CancellationToken ct)
    {
        var s = await db.TaxInvoiceSerials.AsNoTracking().Include(x => x.TaxRegistration)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(s.Division);
        return Map(s);
    }

    [HttpPost]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<TaxInvoiceSerialDto>> Create([FromBody] TaxInvoiceSerialUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var s = new TaxInvoiceSerial
        {
            Division = division.RequireDivisionForWrite(),
            TaxRegistrationId = dto.TaxRegistrationId,
            SerialNumber = dto.SerialNumber.Trim(),
            Status = TaxSerialStatus.Available,
        };
        db.TaxInvoiceSerials.Add(s);
        await db.SaveChangesAsync(ct);
        return await Get(s.Id, ct);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Update(Guid id, [FromBody] TaxInvoiceSerialUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var s = await db.TaxInvoiceSerials.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(s.Division);
        if (s.Status != TaxSerialStatus.Available)
            throw new DomainException("Only available serials can be edited.");

        s.TaxRegistrationId = dto.TaxRegistrationId;
        s.SerialNumber = dto.SerialNumber.Trim();
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var s = await db.TaxInvoiceSerials.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(s.Division);
        if (s.Status != TaxSerialStatus.Available)
            throw new DomainException("Only available serials can be deleted.");
        db.TaxInvoiceSerials.Remove(s);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static TaxInvoiceSerialDto Map(TaxInvoiceSerial s) => new(
        s.Id, s.Division, s.TaxRegistrationId, s.TaxRegistration?.Code,
        s.SerialNumber, s.Status, s.InvoiceId, s.CreditMemoId,
        s.AllocatedAtUtc, s.AllocatedByUserId, s.UsedAtUtc);
}
