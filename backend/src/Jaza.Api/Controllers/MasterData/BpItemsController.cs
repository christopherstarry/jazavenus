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

/// <summary>Business-partner item cross-reference: supplier SKU to internal item mapping. See docs/modules/master-data/prds/bp-item.md.</summary>
[ApiController]
[Tags("Master")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Master)]
[Route("api/master/bp-items")]
public sealed class BpItemsController(AppDbContext db, IValidator<BpItemUpsertDto> val) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<BpItemDto>> List([FromQuery] PagedRequest q, [FromQuery] Guid? supplierId, CancellationToken ct)
    {
        q = q.Normalized();
        IQueryable<BpItem> src = db.BpItems.AsNoTracking().Include(x => x.Supplier).Include(x => x.Item);
        if (supplierId is not null) src = src.Where(x => x.SupplierId == supplierId);
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = $"%{q.Search.Trim()}%";
            src = src.Where(x => EF.Functions.ILike(x.SupplierItemCode, s) || EF.Functions.ILike(x.Item!.Sku, s));
        }
        var ordered = src.OrderBy(x => x.SupplierItemCode);
        var total = await ordered.CountAsync(ct);
        var items = await ordered.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<BpItemDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BpItemDto>> Get(Guid id, CancellationToken ct)
    {
        var x = await db.BpItems.AsNoTracking().Include(b => b.Supplier).Include(b => b.Item)
            .FirstOrDefaultAsync(b => b.Id == id, ct) ?? throw new KeyNotFoundException();
        return Map(x);
    }

    [HttpPost]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<BpItemDto>> Create([FromBody] BpItemUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var e = new BpItem
        {
            SupplierId = dto.SupplierId,
            SupplierItemCode = dto.SupplierItemCode.Trim(),
            ItemId = dto.ItemId,
            Uom = dto.Uom,
            ConversionFactor = dto.ConversionFactor,
            IsActive = dto.IsActive,
        };
        db.BpItems.Add(e);
        await db.SaveChangesAsync(ct);
        return await Get(e.Id, ct);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Update(Guid id, [FromBody] BpItemUpsertDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var e = await db.BpItems.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        e.SupplierId = dto.SupplierId;
        e.SupplierItemCode = dto.SupplierItemCode.Trim();
        e.ItemId = dto.ItemId;
        e.Uom = dto.Uom;
        e.ConversionFactor = dto.ConversionFactor;
        e.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var e = await db.BpItems.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        db.BpItems.Remove(e);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static BpItemDto Map(BpItem x) => new(
        x.Id, x.SupplierId, x.Supplier?.Code, x.SupplierItemCode,
        x.ItemId, x.Item?.Sku, x.Uom, x.ConversionFactor, x.IsActive);
}
