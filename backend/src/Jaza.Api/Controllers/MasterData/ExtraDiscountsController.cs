using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Returns;
using Jaza.Domain.Pricing;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers.MasterData;

[ApiController]
[Tags("Master")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Master)]
[Route("api/master/extra-discounts")]
public sealed class ExtraDiscountsController(
    AppDbContext db,
    IDivisionScopeService division,
    IValidator<ExtraDiscountUpsertDto> val) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<ExtraDiscountDto>> List([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.ExtraDiscounts.AsNoTracking()
            .Include(x => x.Lines).ThenInclude(l => l.Customer)
            .Include(x => x.Lines).ThenInclude(l => l.Brand)
            .Include(x => x.Lines).ThenInclude(l => l.Item), x => x.Division)
            .OrderByDescending(x => x.EffectiveFrom);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<ExtraDiscountDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ExtraDiscountDto>> Get(Guid id, CancellationToken ct)
    {
        var x = await Load(id, ct);
        division.EnsureDivisionAccess(x.Division);
        return Map(x);
    }

    [HttpPost]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<ExtraDiscountDto>> Create([FromBody] ExtraDiscountUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var div = division.RequireDivisionForWrite();
        var e = new ExtraDiscount
        {
            Code = dto.Code.Trim().ToUpperInvariant(),
            Name = dto.Name.Trim(),
            Division = div,
            EffectiveFrom = dto.EffectiveFrom,
            EffectiveTo = dto.EffectiveTo,
            IsActive = dto.IsActive,
            Notes = dto.Notes,
            Lines = dto.Lines.Select(l => new ExtraDiscountLine
            {
                LineNumber = l.LineNumber,
                CustomerId = l.CustomerId,
                BrandId = l.BrandId,
                ItemId = l.ItemId,
                Discount2Percent = l.Discount2Percent,
                Discount3Percent = l.Discount3Percent,
            }).ToList(),
        };
        db.ExtraDiscounts.Add(e);
        await db.SaveChangesAsync(ct);
        return await Get(e.Id, ct);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Update(Guid id, [FromBody] ExtraDiscountUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var e = await db.ExtraDiscounts.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(e.Division);
        e.Code = dto.Code.Trim().ToUpperInvariant();
        e.Name = dto.Name.Trim();
        e.EffectiveFrom = dto.EffectiveFrom;
        e.EffectiveTo = dto.EffectiveTo;
        e.IsActive = dto.IsActive;
        e.Notes = dto.Notes;
        db.ExtraDiscountLines.RemoveRange(e.Lines);
        e.Lines = dto.Lines.Select(l => new ExtraDiscountLine
        {
            LineNumber = l.LineNumber,
            CustomerId = l.CustomerId,
            BrandId = l.BrandId,
            ItemId = l.ItemId,
            Discount2Percent = l.Discount2Percent,
            Discount3Percent = l.Discount3Percent,
        }).ToList();
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var e = await db.ExtraDiscounts.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(e.Division);
        db.ExtraDiscounts.Remove(e);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private async Task<ExtraDiscount> Load(Guid id, CancellationToken ct) =>
        await db.ExtraDiscounts.AsNoTracking()
            .Include(x => x.Lines).ThenInclude(l => l.Customer)
            .Include(x => x.Lines).ThenInclude(l => l.Brand)
            .Include(x => x.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();

    private static ExtraDiscountDto Map(ExtraDiscount x) => new(
        x.Id, x.Code, x.Name, x.Division, x.EffectiveFrom, x.EffectiveTo, x.IsActive, x.Notes,
        x.Lines.Select(l => new ExtraDiscountLineDto(
            l.Id, l.LineNumber, l.CustomerId, l.Customer?.Name,
            l.BrandId, l.Brand?.Code, l.ItemId, l.Item?.Sku,
            l.Discount2Percent, l.Discount3Percent)).ToList());
}
