using FluentValidation;
using Jaza.Application.Common;
using Jaza.Application.MasterData;
using Jaza.Domain.MasterData;
using Jaza.Infrastructure.Persistence;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

/// <summary>
/// Master data CRUD. Read = any authenticated user. Write = Admin or SuperAdmin.
/// All write endpoints require an antiforgery token.
/// </summary>
[ApiController]
[Authorize(Policy = Policies.RequireOperator)]
[Route("api/master")]
public sealed class MasterDataController(AppDbContext db,
    IValidator<UnitUpsertDto> unitVal,
    IValidator<CategoryUpsertDto> catVal,
    IValidator<ItemUpsertDto> itemVal,
    IValidator<SupplierUpsertDto> supVal,
    IValidator<CustomerUpsertDto> custVal,
    IValidator<WarehouseUpsertDto> whVal,
    IValidator<LocationUpsertDto> locVal) : ControllerBase
{
    // ---------- Units ----------
    [HttpGet("units")]
    public async Task<PagedResult<UnitDto>> ListUnits([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.Units.OrderBy(x => x.Code).Select(x => new UnitDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("units")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<UnitDto>> CreateUnit([FromBody] UnitUpsertDto dto, CancellationToken ct)
    {
        await unitVal.ValidateAndThrowAsync(dto, ct);
        var e = new Unit { Code = dto.Code.Trim().ToUpperInvariant(), Name = dto.Name.Trim(), IsActive = dto.IsActive };
        db.Units.Add(e);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(ListUnits), null, new UnitDto(e.Id, e.Code, e.Name, e.IsActive));
    }

    [HttpPut("units/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateUnit(Guid id, [FromBody] UnitUpsertDto dto, CancellationToken ct)
    {
        await unitVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.Units.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        e.Code = dto.Code.Trim().ToUpperInvariant();
        e.Name = dto.Name.Trim();
        e.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("units/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> DeleteUnit(Guid id, CancellationToken ct) => await SoftDelete<Unit>(id, ct);

    // ---------- Categories ----------
    [HttpGet("categories")]
    public async Task<PagedResult<CategoryDto>> ListCategories([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.Categories.OrderBy(x => x.Code)
            .Select(x => new CategoryDto(x.Id, x.Code, x.Name, x.ParentId, x.IsActive)), q, ct);

    [HttpPost("categories")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CategoryUpsertDto dto, CancellationToken ct)
    {
        await catVal.ValidateAndThrowAsync(dto, ct);
        var e = new ItemCategory { Code = dto.Code.Trim(), Name = dto.Name.Trim(), ParentId = dto.ParentId, IsActive = dto.IsActive };
        db.Categories.Add(e);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(ListCategories), null, new CategoryDto(e.Id, e.Code, e.Name, e.ParentId, e.IsActive));
    }

    [HttpPut("categories/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryUpsertDto dto, CancellationToken ct)
    {
        await catVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.Categories.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        e.Code = dto.Code.Trim(); e.Name = dto.Name.Trim(); e.ParentId = dto.ParentId; e.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("categories/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken ct) => await SoftDelete<ItemCategory>(id, ct);

    // ---------- Items ----------
    [HttpGet("items")]
    public async Task<PagedResult<ItemDto>> ListItems([FromQuery] PagedRequest q, CancellationToken ct)
    {
        var canSeeCost = User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin);
        IQueryable<Item> src = db.Items.AsNoTracking().Include(x => x.Category).Include(x => x.Unit);
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.Trim();
            src = src.Where(x => EF.Functions.Like(x.Sku, $"%{s}%") || EF.Functions.Like(x.Name, $"%{s}%"));
        }
        var total = await src.CountAsync(ct);
        var items = await src.OrderBy(x => x.Sku)
            .Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        var dtos = items.Select(x => new ItemDto(
            x.Id, x.Sku, x.Name, x.Barcode, x.Description,
            x.CategoryId, x.Category?.Name, x.UnitId, x.Unit?.Code,
            canSeeCost ? x.StandardCost : null, x.StandardPrice, x.Currency,
            x.ReorderLevel, x.ReorderQuantity, x.IsActive)).ToList();
        return new PagedResult<ItemDto>(dtos, total, q.Page, q.PageSize);
    }

    [HttpGet("items/{id:guid}")]
    public async Task<ActionResult<ItemDto>> GetItem(Guid id, CancellationToken ct)
    {
        var canSeeCost = User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin);
        var x = await db.Items.AsNoTracking().Include(i => i.Category).Include(i => i.Unit)
            .FirstOrDefaultAsync(i => i.Id == id, ct) ?? throw new KeyNotFoundException();
        return new ItemDto(x.Id, x.Sku, x.Name, x.Barcode, x.Description,
            x.CategoryId, x.Category?.Name, x.UnitId, x.Unit?.Code,
            canSeeCost ? x.StandardCost : null, x.StandardPrice, x.Currency,
            x.ReorderLevel, x.ReorderQuantity, x.IsActive);
    }

    [HttpPost("items")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<ItemDto>> CreateItem([FromBody] ItemUpsertDto dto, CancellationToken ct)
    {
        await itemVal.ValidateAndThrowAsync(dto, ct);
        var e = dto.Adapt<Item>();
        e.Sku = dto.Sku.Trim().ToUpperInvariant();
        db.Items.Add(e);
        await db.SaveChangesAsync(ct);
        return await GetItem(e.Id, ct);
    }

    [HttpPut("items/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateItem(Guid id, [FromBody] ItemUpsertDto dto, CancellationToken ct)
    {
        await itemVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.Items.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        dto.Adapt(e);
        e.Sku = dto.Sku.Trim().ToUpperInvariant();
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("items/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> DeleteItem(Guid id, CancellationToken ct) => await SoftDelete<Item>(id, ct);

    // ---------- Suppliers / Customers / Warehouses / Locations (compact) ----------
    [HttpGet("suppliers")]
    public async Task<PagedResult<SupplierDto>> ListSuppliers([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.Suppliers.OrderBy(x => x.Code)
            .Select(x => new SupplierDto(x.Id, x.Code, x.Name, x.TaxId, x.Email, x.Phone,
                x.Address, x.City, x.Country, x.PaymentTermsDays, x.IsActive)), q, ct);

    [HttpPost("suppliers"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<SupplierDto>> CreateSupplier([FromBody] SupplierUpsertDto dto, CancellationToken ct)
    {
        await supVal.ValidateAndThrowAsync(dto, ct);
        var e = dto.Adapt<Supplier>();
        db.Suppliers.Add(e); await db.SaveChangesAsync(ct);
        return new SupplierDto(e.Id, e.Code, e.Name, e.TaxId, e.Email, e.Phone, e.Address, e.City, e.Country, e.PaymentTermsDays, e.IsActive);
    }

    [HttpPut("suppliers/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateSupplier(Guid id, [FromBody] SupplierUpsertDto dto, CancellationToken ct)
    {
        await supVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.Suppliers.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        dto.Adapt(e); await db.SaveChangesAsync(ct); return NoContent();
    }

    [HttpDelete("suppliers/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> DeleteSupplier(Guid id, CancellationToken ct) => await SoftDelete<Supplier>(id, ct);

    [HttpGet("customers")]
    public async Task<PagedResult<CustomerDto>> ListCustomers([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.Customers.OrderBy(x => x.Code)
            .Select(x => new CustomerDto(x.Id, x.Code, x.Name, x.TaxId, x.Email, x.Phone,
                x.BillingAddress, x.ShippingAddress, x.City, x.Country, x.CreditLimit, x.PaymentTermsDays, x.IsActive)), q, ct);

    [HttpPost("customers"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<CustomerDto>> CreateCustomer([FromBody] CustomerUpsertDto dto, CancellationToken ct)
    {
        await custVal.ValidateAndThrowAsync(dto, ct);
        var e = dto.Adapt<Customer>(); db.Customers.Add(e); await db.SaveChangesAsync(ct);
        return new CustomerDto(e.Id, e.Code, e.Name, e.TaxId, e.Email, e.Phone, e.BillingAddress, e.ShippingAddress, e.City, e.Country, e.CreditLimit, e.PaymentTermsDays, e.IsActive);
    }

    [HttpPut("customers/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateCustomer(Guid id, [FromBody] CustomerUpsertDto dto, CancellationToken ct)
    {
        await custVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.Customers.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        dto.Adapt(e); await db.SaveChangesAsync(ct); return NoContent();
    }

    [HttpDelete("customers/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> DeleteCustomer(Guid id, CancellationToken ct) => await SoftDelete<Customer>(id, ct);

    [HttpGet("warehouses")]
    public async Task<PagedResult<WarehouseDto>> ListWarehouses([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.Warehouses.OrderBy(x => x.Code)
            .Select(x => new WarehouseDto(x.Id, x.Code, x.Name, x.Address, x.IsActive)), q, ct);

    [HttpPost("warehouses"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<WarehouseDto>> CreateWarehouse([FromBody] WarehouseUpsertDto dto, CancellationToken ct)
    {
        await whVal.ValidateAndThrowAsync(dto, ct);
        var e = dto.Adapt<Warehouse>(); db.Warehouses.Add(e); await db.SaveChangesAsync(ct);
        return new WarehouseDto(e.Id, e.Code, e.Name, e.Address, e.IsActive);
    }

    [HttpPut("warehouses/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateWarehouse(Guid id, [FromBody] WarehouseUpsertDto dto, CancellationToken ct)
    {
        await whVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.Warehouses.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        dto.Adapt(e); await db.SaveChangesAsync(ct); return NoContent();
    }

    [HttpDelete("warehouses/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> DeleteWarehouse(Guid id, CancellationToken ct) => await SoftDelete<Warehouse>(id, ct);

    [HttpGet("locations")]
    public async Task<PagedResult<LocationDto>> ListLocations([FromQuery] PagedRequest q, [FromQuery] Guid? warehouseId, CancellationToken ct)
    {
        var qry = db.Locations.AsNoTracking();
        if (warehouseId is not null) qry = qry.Where(x => x.WarehouseId == warehouseId);
        return await Page(qry.OrderBy(x => x.Code).Select(x => new LocationDto(x.Id, x.WarehouseId, x.Code, x.Name, x.IsActive)), q, ct);
    }

    [HttpPost("locations"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<LocationDto>> CreateLocation([FromBody] LocationUpsertDto dto, CancellationToken ct)
    {
        await locVal.ValidateAndThrowAsync(dto, ct);
        var e = dto.Adapt<Location>(); db.Locations.Add(e); await db.SaveChangesAsync(ct);
        return new LocationDto(e.Id, e.WarehouseId, e.Code, e.Name, e.IsActive);
    }

    [HttpPut("locations/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateLocation(Guid id, [FromBody] LocationUpsertDto dto, CancellationToken ct)
    {
        await locVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.Locations.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        dto.Adapt(e); await db.SaveChangesAsync(ct); return NoContent();
    }

    [HttpDelete("locations/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> DeleteLocation(Guid id, CancellationToken ct) => await SoftDelete<Location>(id, ct);

    // ---------- Helpers ----------
    private static async Task<PagedResult<T>> Page<T>(IQueryable<T> src, PagedRequest q, CancellationToken ct)
    {
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<T>(items, total, q.Page, q.PageSize);
    }

    private async Task<IActionResult> SoftDelete<T>(Guid id, CancellationToken ct) where T : class
    {
        var e = await db.Set<T>().FindAsync([id], ct);
        if (e is null) return NotFound();
        db.Set<T>().Remove(e);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
