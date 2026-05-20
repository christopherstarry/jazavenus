using System.Reflection;
using FluentValidation;
using Jaza.Application.Common;
using Jaza.Application.MasterData;
using Jaza.Domain.MasterData;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.RequireOperator)]
[Route("api/master")]
public sealed class ReferenceDataController(AppDbContext db,
    IValidator<RefUpsertDto> refVal,
    IValidator<PaymentTermUpsertDto> payTermVal,
    IValidator<PriceTierUpsertDto> priceTierVal,
    IValidator<DiscountCodeUpsertDto> discVal,
    IValidator<SubCategoryUpsertDto> subCatVal,
    IValidator<CustomerAddressUpsertDto> addrVal,
    IValidator<ItemPriceUpsertDto> itemPriceVal,
    IValidator<ItemDiscountUpsertDto> itemDiscVal) : ControllerBase
{
    // ---------- Brands ----------
    [HttpGet("brands")]
    public async Task<PagedResult<RefDto>> ListBrands([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.Brands.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("brands"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateBrand([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.Brands, dto, () => new Brand { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("brands/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateBrand(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<Brand>(db.Brands, id, dto, ct);

    [HttpDelete("brands/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteBrand(Guid id, CancellationToken ct) => await SoftDelete<Brand>(id, ct);

    // ---------- Banks ----------
    [HttpGet("banks")]
    public async Task<PagedResult<RefDto>> ListBanks([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.Banks.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("banks"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateBank([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.Banks, dto, () => new Bank { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("banks/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateBank(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<Bank>(db.Banks, id, dto, ct);

    [HttpDelete("banks/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteBank(Guid id, CancellationToken ct) => await SoftDelete<Bank>(id, ct);

    // ---------- Salesmen ----------
    [HttpGet("salesmen")]
    public async Task<PagedResult<RefDto>> ListSalesmen([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.Salesmen.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("salesmen"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateSalesman([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.Salesmen, dto, () => new Salesman { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("salesmen/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateSalesman(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<Salesman>(db.Salesmen, id, dto, ct);

    [HttpDelete("salesmen/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteSalesman(Guid id, CancellationToken ct) => await SoftDelete<Salesman>(id, ct);

    // ---------- Collectors ----------
    [HttpGet("collectors")]
    public async Task<PagedResult<RefDto>> ListCollectors([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.Collectors.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("collectors"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateCollector([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.Collectors, dto, () => new Collector { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("collectors/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateCollector(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<Collector>(db.Collectors, id, dto, ct);

    [HttpDelete("collectors/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteCollector(Guid id, CancellationToken ct) => await SoftDelete<Collector>(id, ct);

    // ---------- Areas ----------
    [HttpGet("areas")]
    public async Task<PagedResult<RefDto>> ListAreas([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.Areas.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("areas"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateArea([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.Areas, dto, () => new Area { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("areas/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateArea(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<Area>(db.Areas, id, dto, ct);

    [HttpDelete("areas/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteArea(Guid id, CancellationToken ct) => await SoftDelete<Area>(id, ct);

    // ---------- Warehouse Types ----------
    [HttpGet("warehouse-types")]
    public async Task<PagedResult<RefDto>> ListWarehouseTypes([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.WarehouseTypes.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("warehouse-types"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateWarehouseType([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.WarehouseTypes, dto, () => new WarehouseType { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("warehouse-types/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateWarehouseType(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<WarehouseType>(db.WarehouseTypes, id, dto, ct);

    [HttpDelete("warehouse-types/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteWarehouseType(Guid id, CancellationToken ct) => await SoftDelete<WarehouseType>(id, ct);

    // ---------- Outlet Types ----------
    [HttpGet("outlet-types")]
    public async Task<PagedResult<RefDto>> ListOutletTypes([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.OutletTypes.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("outlet-types"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateOutletType([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.OutletTypes, dto, () => new OutletType { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("outlet-types/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateOutletType(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<OutletType>(db.OutletTypes, id, dto, ct);

    [HttpDelete("outlet-types/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteOutletType(Guid id, CancellationToken ct) => await SoftDelete<OutletType>(id, ct);

    // ---------- Group Outlets ----------
    [HttpGet("outlet-groups")]
    public async Task<PagedResult<RefDto>> ListOutletGroups([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.GroupOutlets.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("outlet-groups"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateOutletGroup([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.GroupOutlets, dto, () => new GroupOutlet { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("outlet-groups/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateOutletGroup(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<GroupOutlet>(db.GroupOutlets, id, dto, ct);

    [HttpDelete("outlet-groups/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteOutletGroup(Guid id, CancellationToken ct) => await SoftDelete<GroupOutlet>(id, ct);

    // ---------- Group Outlet Types ----------
    [HttpGet("outlet-group-types")]
    public async Task<PagedResult<RefDto>> ListOutletGroupTypes([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.GroupOutletTypes.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("outlet-group-types"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateOutletGroupType([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.GroupOutletTypes, dto, () => new GroupOutletType { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("outlet-group-types/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateOutletGroupType(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<GroupOutletType>(db.GroupOutletTypes, id, dto, ct);

    [HttpDelete("outlet-group-types/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteOutletGroupType(Guid id, CancellationToken ct) => await SoftDelete<GroupOutletType>(id, ct);

    // ---------- Trade Types ----------
    [HttpGet("trade-types")]
    public async Task<PagedResult<RefDto>> ListTradeTypes([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.TradeTypes.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("trade-types"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateTradeType([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.TradeTypes, dto, () => new TradeType { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("trade-types/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateTradeType(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<TradeType>(db.TradeTypes, id, dto, ct);

    [HttpDelete("trade-types/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteTradeType(Guid id, CancellationToken ct) => await SoftDelete<TradeType>(id, ct);

    // ---------- Sub Trade Types ----------
    [HttpGet("sub-trade-types")]
    public async Task<PagedResult<RefDto>> ListSubTradeTypes([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.SubTradeTypes.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("sub-trade-types"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateSubTradeType([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.SubTradeTypes, dto, () => new SubTradeType { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("sub-trade-types/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateSubTradeType(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<SubTradeType>(db.SubTradeTypes, id, dto, ct);

    [HttpDelete("sub-trade-types/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteSubTradeType(Guid id, CancellationToken ct) => await SoftDelete<SubTradeType>(id, ct);

    // ---------- Distribution Types ----------
    [HttpGet("distribution-types")]
    public async Task<PagedResult<RefDto>> ListDistributionTypes([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.DistributionTypes.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("distribution-types"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateDistributionType([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.DistributionTypes, dto, () => new DistributionType { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("distribution-types/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateDistributionType(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<DistributionType>(db.DistributionTypes, id, dto, ct);

    [HttpDelete("distribution-types/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteDistributionType(Guid id, CancellationToken ct) => await SoftDelete<DistributionType>(id, ct);

    // ---------- Cost Types ----------
    [HttpGet("cost-types")]
    public async Task<PagedResult<RefDto>> ListCostTypes([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.CostTypes.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("cost-types"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateCostType([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.CostTypes, dto, () => new CostType { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("cost-types/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateCostType(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<CostType>(db.CostTypes, id, dto, ct);

    [HttpDelete("cost-types/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteCostType(Guid id, CancellationToken ct) => await SoftDelete<CostType>(id, ct);

    // ---------- Manufacturings ----------
    [HttpGet("manufacturers")]
    public async Task<PagedResult<RefDto>> ListManufacturers([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.Manufacturings.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("manufacturers"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateManufacturer([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.Manufacturings, dto, () => new Manufacturing { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("manufacturers/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateManufacturer(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<Manufacturing>(db.Manufacturings, id, dto, ct);

    [HttpDelete("manufacturers/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteManufacturer(Guid id, CancellationToken ct) => await SoftDelete<Manufacturing>(id, ct);

    // ---------- Tax Registrations ----------
    [HttpGet("tax-registrations")]
    public async Task<PagedResult<RefDto>> ListTaxRegistrations([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.TaxRegistrations.OrderBy(x => x.Code).Select(x => new RefDto(x.Id, x.Code, x.Name, x.IsActive)), q, ct);

    [HttpPost("tax-registrations"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<RefDto>> CreateTaxRegistration([FromBody] RefUpsertDto dto, CancellationToken ct)
        => await CreateRef(db.TaxRegistrations, dto, () => new TaxRegistration { Code = dto.Code.Trim(), Name = dto.Name.Trim(), IsActive = dto.IsActive }, ct);

    [HttpPut("tax-registrations/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateTaxRegistration(Guid id, [FromBody] RefUpsertDto dto, CancellationToken ct)
        => await UpdateRef<TaxRegistration>(db.TaxRegistrations, id, dto, ct);

    [HttpDelete("tax-registrations/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteTaxRegistration(Guid id, CancellationToken ct) => await SoftDelete<TaxRegistration>(id, ct);

    // ---------- Price Tiers ----------
    [HttpGet("price-tiers")]
    public async Task<PagedResult<PriceTierDto>> ListPriceTiers([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.PriceTiers.OrderBy(x => x.Code)
            .Select(x => new PriceTierDto(x.Id, x.Code, x.Name, x.MarkupPercent, x.IsActive)), q, ct);

    [HttpPost("price-tiers"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<PriceTierDto>> CreatePriceTier([FromBody] PriceTierUpsertDto dto, CancellationToken ct)
    {
        await priceTierVal.ValidateAndThrowAsync(dto, ct);
        var e = new PriceTier { Code = dto.Code.Trim(), Name = dto.Name.Trim(), MarkupPercent = dto.MarkupPercent, IsActive = dto.IsActive };
        db.PriceTiers.Add(e);
        await db.SaveChangesAsync(ct);
        return new PriceTierDto(e.Id, e.Code, e.Name, e.MarkupPercent, e.IsActive);
    }

    [HttpPut("price-tiers/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdatePriceTier(Guid id, [FromBody] PriceTierUpsertDto dto, CancellationToken ct)
    {
        await priceTierVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.PriceTiers.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        e.Code = dto.Code.Trim(); e.Name = dto.Name.Trim(); e.MarkupPercent = dto.MarkupPercent; e.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("price-tiers/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeletePriceTier(Guid id, CancellationToken ct) => await SoftDelete<PriceTier>(id, ct);

    // ---------- Discount Codes ----------
    [HttpGet("discount-codes")]
    public async Task<PagedResult<DiscountCodeDto>> ListDiscountCodes([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.DiscountCodes.OrderBy(x => x.Code)
            .Select(x => new DiscountCodeDto(x.Id, x.Code, x.Name, x.DiscountPercent, x.IsActive)), q, ct);

    [HttpPost("discount-codes"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<DiscountCodeDto>> CreateDiscountCode([FromBody] DiscountCodeUpsertDto dto, CancellationToken ct)
    {
        await discVal.ValidateAndThrowAsync(dto, ct);
        var e = new DiscountCode { Code = dto.Code.Trim(), Name = dto.Name.Trim(), DiscountPercent = dto.DiscountPercent, IsActive = dto.IsActive };
        db.DiscountCodes.Add(e);
        await db.SaveChangesAsync(ct);
        return new DiscountCodeDto(e.Id, e.Code, e.Name, e.DiscountPercent, e.IsActive);
    }

    [HttpPut("discount-codes/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateDiscountCode(Guid id, [FromBody] DiscountCodeUpsertDto dto, CancellationToken ct)
    {
        await discVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.DiscountCodes.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        e.Code = dto.Code.Trim(); e.Name = dto.Name.Trim(); e.DiscountPercent = dto.DiscountPercent; e.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("discount-codes/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteDiscountCode(Guid id, CancellationToken ct) => await SoftDelete<DiscountCode>(id, ct);

    // ---------- Payment Terms ----------
    [HttpGet("payment-terms")]
    public async Task<PagedResult<PaymentTermDto>> ListPaymentTerms([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.PaymentTerms.OrderBy(x => x.Code)
            .Select(x => new PaymentTermDto(x.Id, x.Code, x.Name, x.NetDays, x.IsActive)), q, ct);

    [HttpPost("payment-terms"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<PaymentTermDto>> CreatePaymentTerm([FromBody] PaymentTermUpsertDto dto, CancellationToken ct)
    {
        await payTermVal.ValidateAndThrowAsync(dto, ct);
        var e = new PaymentTerm { Code = dto.Code.Trim(), Name = dto.Name.Trim(), NetDays = dto.NetDays, IsActive = dto.IsActive };
        db.PaymentTerms.Add(e);
        await db.SaveChangesAsync(ct);
        return new PaymentTermDto(e.Id, e.Code, e.Name, e.NetDays, e.IsActive);
    }

    [HttpPut("payment-terms/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdatePaymentTerm(Guid id, [FromBody] PaymentTermUpsertDto dto, CancellationToken ct)
    {
        await payTermVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.PaymentTerms.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        e.Code = dto.Code.Trim(); e.Name = dto.Name.Trim(); e.NetDays = dto.NetDays; e.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("payment-terms/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeletePaymentTerm(Guid id, CancellationToken ct) => await SoftDelete<PaymentTerm>(id, ct);

    // ---------- Sub Categories ----------
    [HttpGet("sub-categories")]
    public async Task<PagedResult<SubCategoryDto>> ListSubCategories([FromQuery] PagedRequest q, CancellationToken ct)
        => await Page(db.SubCategories.OrderBy(x => x.Code)
            .Select(x => new SubCategoryDto(x.Id, x.Code, x.Name, x.CategoryId, x.Category!.Name, x.IsActive)), q, ct);

    [HttpPost("sub-categories"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<SubCategoryDto>> CreateSubCategory([FromBody] SubCategoryUpsertDto dto, CancellationToken ct)
    {
        await subCatVal.ValidateAndThrowAsync(dto, ct);
        var e = new SubCategory { Code = dto.Code.Trim(), Name = dto.Name.Trim(), CategoryId = dto.CategoryId, IsActive = dto.IsActive };
        db.SubCategories.Add(e);
        await db.SaveChangesAsync(ct);
        return new SubCategoryDto(e.Id, e.Code, e.Name, e.CategoryId, e.Category?.Name ?? "", e.IsActive);
    }

    [HttpPut("sub-categories/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateSubCategory(Guid id, [FromBody] SubCategoryUpsertDto dto, CancellationToken ct)
    {
        await subCatVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.SubCategories.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        e.Code = dto.Code.Trim(); e.Name = dto.Name.Trim(); e.CategoryId = dto.CategoryId; e.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("sub-categories/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteSubCategory(Guid id, CancellationToken ct) => await SoftDelete<SubCategory>(id, ct);

    // ---------- Customer Addresses ----------
    [HttpGet("customer-addresses")]
    public async Task<PagedResult<CustomerAddressDto>> ListCustomerAddresses([FromQuery] PagedRequest q, [FromQuery] Guid? customerId, CancellationToken ct)
    {
        var qry = db.CustomerAddresses.AsNoTracking();
        if (customerId.HasValue) qry = qry.Where(x => x.CustomerId == customerId);
        return await Page(qry.OrderBy(x => x.Label).Select(x => new CustomerAddressDto(
            x.Id, x.CustomerId, x.Label, x.Address, x.City, x.Country, x.IsDefault, x.IsActive)), q, ct);
    }

    [HttpPost("customer-addresses"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<CustomerAddressDto>> CreateCustomerAddress([FromBody] CustomerAddressUpsertDto dto, CancellationToken ct)
    {
        await addrVal.ValidateAndThrowAsync(dto, ct);
        var e = new CustomerAddress { CustomerId = dto.CustomerId, Label = dto.Label.Trim(), Address = dto.Address.Trim(), City = dto.City, Country = dto.Country, IsDefault = dto.IsDefault, IsActive = dto.IsActive };
        db.CustomerAddresses.Add(e);
        await db.SaveChangesAsync(ct);
        return new CustomerAddressDto(e.Id, e.CustomerId, e.Label, e.Address, e.City, e.Country, e.IsDefault, e.IsActive);
    }

    [HttpPut("customer-addresses/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateCustomerAddress(Guid id, [FromBody] CustomerAddressUpsertDto dto, CancellationToken ct)
    {
        await addrVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.CustomerAddresses.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        e.CustomerId = dto.CustomerId; e.Label = dto.Label.Trim(); e.Address = dto.Address.Trim(); e.City = dto.City; e.Country = dto.Country; e.IsDefault = dto.IsDefault; e.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("customer-addresses/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteCustomerAddress(Guid id, CancellationToken ct) => await SoftDelete<CustomerAddress>(id, ct);

    // ---------- Item Prices ----------
    [HttpGet("item-prices")]
    public async Task<PagedResult<ItemPriceDto>> ListItemPrices([FromQuery] PagedRequest q, [FromQuery] Guid? itemId, CancellationToken ct)
    {
        IQueryable<ItemPrice> qry = db.ItemPrices.AsNoTracking().Include(x => x.Item).Include(x => x.PriceTier);
        if (itemId.HasValue) qry = qry.Where(x => x.ItemId == itemId);
        return await Page(qry.OrderBy(x => x.Item!.Sku).Select(x => new ItemPriceDto(
            x.Id, x.ItemId, x.Item!.Sku, x.PriceTierId, x.PriceTier!.Code, x.Price, x.IsActive)), q, ct);
    }

    [HttpPost("item-prices"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<ItemPriceDto>> CreateItemPrice([FromBody] ItemPriceUpsertDto dto, CancellationToken ct)
    {
        await itemPriceVal.ValidateAndThrowAsync(dto, ct);
        var e = new ItemPrice { ItemId = dto.ItemId, PriceTierId = dto.PriceTierId, Price = dto.Price, IsActive = dto.IsActive };
        db.ItemPrices.Add(e);
        await db.SaveChangesAsync(ct);
        return await GetItemPrice(e.Id, ct);
    }

    [HttpGet("item-prices/{id:guid}")]
    public async Task<ActionResult<ItemPriceDto>> GetItemPrice(Guid id, CancellationToken ct)
    {
        var x = await db.ItemPrices.AsNoTracking().Include(p => p.Item).Include(p => p.PriceTier)
            .FirstOrDefaultAsync(p => p.Id == id, ct) ?? throw new KeyNotFoundException();
        return new ItemPriceDto(x.Id, x.ItemId, x.Item!.Sku, x.PriceTierId, x.PriceTier!.Code, x.Price, x.IsActive);
    }

    [HttpPut("item-prices/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateItemPrice(Guid id, [FromBody] ItemPriceUpsertDto dto, CancellationToken ct)
    {
        await itemPriceVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.ItemPrices.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        e.ItemId = dto.ItemId; e.PriceTierId = dto.PriceTierId; e.Price = dto.Price; e.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("item-prices/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteItemPrice(Guid id, CancellationToken ct) => await SoftDelete<ItemPrice>(id, ct);

    // ---------- Item Discounts ----------
    [HttpGet("item-discounts")]
    public async Task<PagedResult<ItemDiscountDto>> ListItemDiscounts([FromQuery] PagedRequest q, [FromQuery] Guid? itemId, CancellationToken ct)
    {
        IQueryable<ItemDiscount> qry = db.ItemDiscounts.AsNoTracking().Include(x => x.Item).Include(x => x.DiscountCode);
        if (itemId.HasValue) qry = qry.Where(x => x.ItemId == itemId);
        return await Page(qry.OrderBy(x => x.Item!.Sku).ThenBy(x => x.DiscountCode!.Code)
            .Select(x => new ItemDiscountDto(x.Id, x.ItemId, x.Item!.Sku, x.DiscountCodeId, x.DiscountCode!.Name,
                x.DiscountPercent, x.StartDateUtc, x.EndDateUtc, x.IsActive)), q, ct);
    }

    [HttpPost("item-discounts"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<ItemDiscountDto>> CreateItemDiscount([FromBody] ItemDiscountUpsertDto dto, CancellationToken ct)
    {
        await itemDiscVal.ValidateAndThrowAsync(dto, ct);
        var e = new ItemDiscount { ItemId = dto.ItemId, DiscountCodeId = dto.DiscountCodeId, DiscountPercent = dto.DiscountPercent, StartDateUtc = dto.StartDateUtc, EndDateUtc = dto.EndDateUtc, IsActive = dto.IsActive };
        db.ItemDiscounts.Add(e);
        await db.SaveChangesAsync(ct);
        return await GetItemDiscount(e.Id, ct);
    }

    [HttpGet("item-discounts/{id:guid}")]
    public async Task<ActionResult<ItemDiscountDto>> GetItemDiscount(Guid id, CancellationToken ct)
    {
        var x = await db.ItemDiscounts.AsNoTracking().Include(d => d.Item).Include(d => d.DiscountCode)
            .FirstOrDefaultAsync(d => d.Id == id, ct) ?? throw new KeyNotFoundException();
        return new ItemDiscountDto(x.Id, x.ItemId, x.Item!.Sku, x.DiscountCodeId, x.DiscountCode!.Name,
            x.DiscountPercent, x.StartDateUtc, x.EndDateUtc, x.IsActive);
    }

    [HttpPut("item-discounts/{id:guid}"), Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateItemDiscount(Guid id, [FromBody] ItemDiscountUpsertDto dto, CancellationToken ct)
    {
        await itemDiscVal.ValidateAndThrowAsync(dto, ct);
        var e = await db.ItemDiscounts.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        e.ItemId = dto.ItemId; e.DiscountCodeId = dto.DiscountCodeId; e.DiscountPercent = dto.DiscountPercent;
        e.StartDateUtc = dto.StartDateUtc; e.EndDateUtc = dto.EndDateUtc; e.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("item-discounts/{id:guid}"), Authorize(Policy = Policies.RequireSuperAdmin)]
    public async Task<IActionResult> DeleteItemDiscount(Guid id, CancellationToken ct) => await SoftDelete<ItemDiscount>(id, ct);

    // ---------- Helpers ----------
    private async Task<PagedResult<T>> Page<T>(IQueryable<T> src, PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<T>(items, total, q.Page, q.PageSize);
    }

    private async Task<ActionResult<RefDto>> CreateRef<T>(DbSet<T> set, RefUpsertDto dto, Func<T> factory, CancellationToken ct) where T : class
    {
        await refVal.ValidateAndThrowAsync(dto, ct);
        var e = factory();
        SetProp(e, "Code", dto.Code.Trim());
        SetProp(e, "Name", dto.Name.Trim());
        SetProp(e, "IsActive", dto.IsActive);
        set.Add(e);
        await db.SaveChangesAsync(ct);
        return new RefDto((Guid)(GetProp(e, "Id") ?? Guid.Empty), (string)(GetProp(e, "Code") ?? ""), (string)(GetProp(e, "Name") ?? ""), (bool)(GetProp(e, "IsActive") ?? false));
    }

    private async Task<IActionResult> UpdateRef<T>(DbSet<T> set, Guid id, RefUpsertDto dto, CancellationToken ct) where T : class
    {
        await refVal.ValidateAndThrowAsync(dto, ct);
        var e = await set.FirstOrDefaultAsync(x => EF.Property<Guid>(x, "Id") == id, ct) ?? throw new KeyNotFoundException();
        SetProp(e, "Code", dto.Code.Trim());
        SetProp(e, "Name", dto.Name.Trim());
        SetProp(e, "IsActive", dto.IsActive);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private async Task<IActionResult> SoftDelete<T>(Guid id, CancellationToken ct) where T : class
    {
        var e = await db.Set<T>().FindAsync([id], ct);
        if (e is null) return NotFound();
        db.Set<T>().Remove(e);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static void SetProp(object obj, string name, object value)
    {
        obj.GetType().GetProperty(name)?.SetValue(obj, value);
    }

    private static object? GetProp(object obj, string name)
    {
        return obj.GetType().GetProperty(name)?.GetValue(obj);
    }
}
