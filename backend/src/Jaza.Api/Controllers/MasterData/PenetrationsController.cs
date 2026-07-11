using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.MasterData;
using Jaza.Domain.MasterData;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers.MasterData;

/// <summary>Customer SKU-coverage penetration targets. See docs/modules/master-data/prds/penetration.md.</summary>
[ApiController]
[Tags("Master")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Master)]
[Route("api/master/penetrations")]
public sealed class PenetrationsController(AppDbContext db, IValidator<PenetrationUpsertDto> val) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<PenetrationDto>> List(
        [FromQuery] PagedRequest q, [FromQuery] Guid? customerId, [FromQuery] int? year, [FromQuery] int? month, CancellationToken ct)
    {
        q = q.Normalized();
        IQueryable<Penetration> src = db.Penetrations.AsNoTracking()
            .Include(x => x.Customer).Include(x => x.Item).Include(x => x.Brand).Include(x => x.Category);
        if (customerId is not null) src = src.Where(x => x.CustomerId == customerId);
        if (year is not null) src = src.Where(x => x.PeriodYear == year);
        if (month is not null) src = src.Where(x => x.PeriodMonth == month);
        var ordered = src.OrderByDescending(x => x.PeriodYear).ThenByDescending(x => x.PeriodMonth);
        var total = await ordered.CountAsync(ct);
        var items = await ordered.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<PenetrationDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PenetrationDto>> Get(Guid id, CancellationToken ct)
    {
        var x = await db.Penetrations.AsNoTracking()
            .Include(p => p.Customer).Include(p => p.Item).Include(p => p.Brand).Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id, ct) ?? throw new KeyNotFoundException();
        return Map(x);
    }

    [HttpPost]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<PenetrationDto>> Create([FromBody] PenetrationUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var e = new Penetration
        {
            CustomerId = dto.CustomerId,
            ItemId = dto.ItemId,
            BrandId = dto.BrandId,
            CategoryId = dto.CategoryId,
            TargetSkuCount = dto.TargetSkuCount,
            PeriodYear = dto.PeriodYear,
            PeriodMonth = dto.PeriodMonth,
        };
        db.Penetrations.Add(e);
        await db.SaveChangesAsync(ct);
        return await Get(e.Id, ct);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Update(Guid id, [FromBody] PenetrationUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var e = await db.Penetrations.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        e.CustomerId = dto.CustomerId;
        e.ItemId = dto.ItemId;
        e.BrandId = dto.BrandId;
        e.CategoryId = dto.CategoryId;
        e.TargetSkuCount = dto.TargetSkuCount;
        e.PeriodYear = dto.PeriodYear;
        e.PeriodMonth = dto.PeriodMonth;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [RequireCanDelete(Modules.Master)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var e = await db.Penetrations.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        db.Penetrations.Remove(e);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static PenetrationDto Map(Penetration x) => new(
        x.Id, x.CustomerId, x.Customer?.Name,
        x.ItemId, x.Item?.Sku, x.BrandId, x.Brand?.Code, x.CategoryId, x.Category?.Name,
        x.TargetSkuCount, x.PeriodYear, x.PeriodMonth);
}
