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
[Route("api/ar/adjustments")]
public sealed class ArAdjustmentsController(
    AppDbContext db,
    IDivisionScopeService division,
    IDocumentNumberGenerator numberGen,
    IValidator<ArAdjustmentUpsertDto> val) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<ArAdjustmentDto>> List([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.ArAdjustments.AsNoTracking()
            .Include(x => x.Customer), x => x.Division)
            .OrderByDescending(x => x.AdjustmentDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<ArAdjustmentDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ArAdjustmentDto>> Get(Guid id, CancellationToken ct)
    {
        var doc = await db.ArAdjustments.AsNoTracking().Include(x => x.Customer)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        return Map(doc);
    }

    [HttpPost]
    public async Task<ActionResult<ArAdjustmentDto>> Create([FromBody] ArAdjustmentUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var doc = new ArAdjustment
        {
            Number = await numberGen.NextAsync("ADJ", ct),
            Division = division.RequireDivisionForWrite(),
            CustomerId = dto.CustomerId,
            AdjustmentDate = dto.AdjustmentDate,
            Amount = dto.Amount,
            Currency = dto.Currency,
            ReasonCode = dto.ReasonCode,
            Notes = dto.Notes,
        };
        db.ArAdjustments.Add(doc);
        await db.SaveChangesAsync(ct);
        return await Get(doc.Id, ct);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateDraft(Guid id, [FromBody] ArAdjustmentUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var doc = await db.ArAdjustments.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Only draft adjustments can be updated.");

        doc.CustomerId = dto.CustomerId;
        doc.AdjustmentDate = dto.AdjustmentDate;
        doc.Amount = dto.Amount;
        doc.Currency = dto.Currency;
        doc.ReasonCode = dto.ReasonCode;
        doc.Notes = dto.Notes;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Post(Guid id, CancellationToken ct)
    {
        var doc = await db.ArAdjustments.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Only draft adjustments can be posted.");
        doc.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var doc = await db.ArAdjustments.FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(doc.Division);
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Only draft adjustments can be deleted.");
        db.ArAdjustments.Remove(doc);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static ArAdjustmentDto Map(ArAdjustment x) => new(
        x.Id, x.Number, x.Division, x.Status,
        x.CustomerId, x.Customer?.Name, x.AdjustmentDate,
        x.Amount, x.Currency, x.ReasonCode, x.Notes);
}
