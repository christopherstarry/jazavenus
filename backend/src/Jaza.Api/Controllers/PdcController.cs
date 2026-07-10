using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Ar;
using Jaza.Application.Common;
using Jaza.Domain.Ar;
using Jaza.Domain.Common;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Tags("AR")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Ar)]
[Route("api/ar/pdc")]
public sealed class PdcController(
    AppDbContext db,
    IDivisionScopeService division,
    IDocumentNumberGenerator numberGen,
    ICurrentUser currentUser,
    IValidator<PostDatedCheckUpsertDto> val) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<PostDatedCheckDto>> List([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.PostDatedChecks.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.Bank).Include(x => x.History), x => x.Division)
            .OrderByDescending(x => x.ReceivedAt);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<PostDatedCheckDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PostDatedCheckDto>> Get(Guid id, CancellationToken ct)
    {
        var doc = await Load(id, ct);
        division.EnsureDivisionAccess(doc.Division);
        return Map(doc);
    }

    [HttpPost]
    public async Task<ActionResult<PostDatedCheckDto>> Create([FromBody] PostDatedCheckUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var doc = new PostDatedCheck
        {
            Number = await numberGen.NextAsync("PDC", ct),
            Division = division.RequireDivisionForWrite(),
            CustomerId = dto.CustomerId,
            BankId = dto.BankId,
            Amount = dto.Amount,
            Currency = dto.Currency,
            ChequeDate = dto.ChequeDate,
            ReceivedAt = dto.ReceivedAt,
            Reference = dto.Reference,
            Notes = dto.Notes,
        };
        db.PostDatedChecks.Add(doc);
        await db.SaveChangesAsync(ct);
        return await Get(doc.Id, ct);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PostDatedCheckUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var doc = await db.PostDatedChecks.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != PdcStatus.Outstanding) throw new DomainException("Only outstanding PDCs can be edited.");

        doc.CustomerId = dto.CustomerId;
        doc.BankId = dto.BankId;
        doc.Amount = dto.Amount;
        doc.Currency = dto.Currency;
        doc.ChequeDate = dto.ChequeDate;
        doc.ReceivedAt = dto.ReceivedAt;
        doc.Reference = dto.Reference;
        doc.Notes = dto.Notes;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var doc = await db.PostDatedChecks.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != PdcStatus.Outstanding) throw new DomainException("Only outstanding PDCs can be deleted.");
        db.PostDatedChecks.Remove(doc);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/clear")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Clear(Guid id, [FromBody] PdcActionDto? dto, CancellationToken ct)
    {
        var doc = await db.PostDatedChecks.Include(x => x.History).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != PdcStatus.Outstanding) throw new DomainException("PDC is not outstanding.");

        var from = doc.Status;
        doc.Status = PdcStatus.Cleared;
        doc.History.Add(new PdcClearanceHistory
        {
            FromStatus = from,
            ToStatus = PdcStatus.Cleared,
            OccurredAtUtc = DateTime.UtcNow,
            UserId = currentUser.UserId,
            Notes = dto?.Notes,
        });
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/cancel-clearance")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> CancelClearance(Guid id, [FromBody] PdcActionDto? dto, CancellationToken ct)
    {
        var doc = await db.PostDatedChecks.Include(x => x.History).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != PdcStatus.Cleared) throw new DomainException("PDC is not cleared.");

        var from = doc.Status;
        doc.Status = PdcStatus.Outstanding;
        doc.History.Add(new PdcClearanceHistory
        {
            FromStatus = from,
            ToStatus = PdcStatus.Outstanding,
            OccurredAtUtc = DateTime.UtcNow,
            UserId = currentUser.UserId,
            Notes = dto?.Notes,
        });
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private async Task<PostDatedCheck> Load(Guid id, CancellationToken ct) =>
        await db.PostDatedChecks.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.Bank).Include(x => x.History)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();

    private static PostDatedCheckDto Map(PostDatedCheck x) => new(
        x.Id, x.Number, x.Division, x.Status,
        x.CustomerId, x.Customer?.Name, x.BankId, x.Bank?.Code,
        x.Amount, x.Currency, x.ChequeDate, x.ReceivedAt, x.Reference, x.Notes,
        x.History.OrderBy(h => h.OccurredAtUtc).Select(h => new PdcClearanceHistoryDto(
            h.Id, h.FromStatus, h.ToStatus, h.OccurredAtUtc, h.UserId, h.Notes)).ToList());
}
