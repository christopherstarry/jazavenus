using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Settings;
using Jaza.Domain.Common;
using Jaza.Domain.Settings;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

/// <summary>Division settings: company profile, fiscal calendar, and document codes.</summary>
[ApiController]
[Tags("Settings")]
[ProducesResponseType(typeof(ProblemDetails), 400)]
[ProducesResponseType(typeof(ProblemDetails), 401)]
[ProducesResponseType(typeof(ProblemDetails), 403)]
[ProducesResponseType(typeof(ProblemDetails), 404)]
[ProducesResponseType(typeof(ProblemDetails), 409)]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Master)]
[Route("api/settings")]
public sealed class SettingsController(
    AppDbContext db,
    IDivisionScopeService division,
    IValidator<CompanySettingsUpsertDto> companyVal,
    IValidator<FiscalPeriodUpsertDto> fiscalVal,
    IValidator<OrderCodeUpsertDto> orderCodeVal,
    IValidator<ReturnCodeUpsertDto> returnCodeVal) : ControllerBase
{
    /// <summary>Returns company settings for the operator's active division.</summary>
    [HttpGet("company")]
    public async Task<ActionResult<CompanySettingsDto>> GetCompany(CancellationToken ct)
    {
        var div = division.EffectiveDivision ?? throw new DomainException("Division is required.");
        var s = await db.CompanySettings.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Division == div, ct);
        if (s is null) return NotFound();
        return MapCompany(s);
    }

    /// <summary>Creates or updates company settings. Requires admin role.</summary>
    [HttpPut("company")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<CompanySettingsDto>> PutCompany([FromBody] CompanySettingsUpsertDto dto, CancellationToken ct)
    {
        await companyVal.ValidateAndThrowAsync(dto, ct);
        var div = division.RequireDivisionForWrite();
        var s = await db.CompanySettings.FirstOrDefaultAsync(x => x.Division == div, ct);
        if (s is null)
        {
            s = new CompanySettings { Division = div };
            db.CompanySettings.Add(s);
        }
        s.CompanyName = dto.CompanyName.Trim();
        s.Address = dto.Address;
        s.City = dto.City;
        s.Phone = dto.Phone;
        s.Fax = dto.Fax;
        s.NpwpNumber = dto.NpwpNumber;
        s.PkpNumber = dto.PkpNumber;
        s.DefaultCurrency = dto.DefaultCurrency ?? "IDR";
        s.SettingsJson = dto.SettingsJson;
        await db.SaveChangesAsync(ct);
        return MapCompany(s);
    }

    /// <summary>Lists fiscal periods for the active division, newest first.</summary>
    [HttpGet("fiscal-periods")]
    public async Task<PagedResult<FiscalPeriodDto>> ListFiscalPeriods([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.FiscalPeriods.AsNoTracking(), f => f.Division)
            .OrderByDescending(f => f.Year).ThenByDescending(f => f.Month);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<FiscalPeriodDto>(items.Select(MapFiscal).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("fiscal-periods/{id:guid}")]
    public async Task<ActionResult<FiscalPeriodDto>> GetFiscalPeriod(Guid id, CancellationToken ct)
    {
        var f = await db.FiscalPeriods.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(f.Division);
        return MapFiscal(f);
    }

    [HttpPost("fiscal-periods")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<FiscalPeriodDto>> CreateFiscalPeriod([FromBody] FiscalPeriodUpsertDto dto, CancellationToken ct)
    {
        await fiscalVal.ValidateAndThrowAsync(dto, ct);
        var div = division.RequireDivisionForWrite();
        var f = new FiscalPeriod
        {
            Division = div,
            Year = dto.Year,
            Month = dto.Month,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
        };
        db.FiscalPeriods.Add(f);
        await db.SaveChangesAsync(ct);
        return MapFiscal(f);
    }

    [HttpPut("fiscal-periods/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateFiscalPeriod(Guid id, [FromBody] FiscalPeriodUpsertDto dto, CancellationToken ct)
    {
        await fiscalVal.ValidateAndThrowAsync(dto, ct);
        var f = await db.FiscalPeriods.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(f.Division);
        if (f.IsClosed) throw new DomainException("Closed fiscal periods cannot be edited.");
        f.Year = dto.Year;
        f.Month = dto.Month;
        f.StartDate = dto.StartDate;
        f.EndDate = dto.EndDate;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("fiscal-periods/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> DeleteFiscalPeriod(Guid id, CancellationToken ct)
    {
        var f = await db.FiscalPeriods.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(f.Division);
        if (f.IsClosed) throw new DomainException("Closed fiscal periods cannot be deleted.");
        db.FiscalPeriods.Remove(f);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("order-codes")]
    public async Task<PagedResult<OrderCodeDto>> ListOrderCodes([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = SearchCodes(db.OrderCodes.AsNoTracking(), q.Search).OrderBy(x => x.Code);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<OrderCodeDto>(items.Select(MapOrderCode).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("order-codes/{id:guid}")]
    public async Task<ActionResult<OrderCodeDto>> GetOrderCode(Guid id, CancellationToken ct)
    {
        var o = await db.OrderCodes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        return MapOrderCode(o);
    }

    [HttpPost("order-codes")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<OrderCodeDto>> CreateOrderCode([FromBody] OrderCodeUpsertDto dto, CancellationToken ct)
    {
        await orderCodeVal.ValidateAndThrowAsync(dto, ct);
        var o = new OrderCode
        {
            Code = dto.Code.Trim().ToUpperInvariant(),
            Name = dto.Name.Trim(),
            Description = dto.Description,
            IsActive = dto.IsActive,
        };
        db.OrderCodes.Add(o);
        await db.SaveChangesAsync(ct);
        return MapOrderCode(o);
    }

    [HttpPut("order-codes/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateOrderCode(Guid id, [FromBody] OrderCodeUpsertDto dto, CancellationToken ct)
    {
        await orderCodeVal.ValidateAndThrowAsync(dto, ct);
        var o = await db.OrderCodes.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        o.Code = dto.Code.Trim().ToUpperInvariant();
        o.Name = dto.Name.Trim();
        o.Description = dto.Description;
        o.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("order-codes/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> DeleteOrderCode(Guid id, CancellationToken ct)
    {
        var o = await db.OrderCodes.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        db.OrderCodes.Remove(o);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("return-codes")]
    public async Task<PagedResult<ReturnCodeDto>> ListReturnCodes([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = SearchCodes(db.ReturnCodes.AsNoTracking(), q.Search).OrderBy(x => x.Code);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<ReturnCodeDto>(items.Select(MapReturnCode).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("return-codes/{id:guid}")]
    public async Task<ActionResult<ReturnCodeDto>> GetReturnCode(Guid id, CancellationToken ct)
    {
        var r = await db.ReturnCodes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        return MapReturnCode(r);
    }

    [HttpPost("return-codes")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<ActionResult<ReturnCodeDto>> CreateReturnCode([FromBody] ReturnCodeUpsertDto dto, CancellationToken ct)
    {
        await returnCodeVal.ValidateAndThrowAsync(dto, ct);
        var r = new ReturnCode
        {
            Code = dto.Code.Trim().ToUpperInvariant(),
            Name = dto.Name.Trim(),
            Description = dto.Description,
            IsActive = dto.IsActive,
        };
        db.ReturnCodes.Add(r);
        await db.SaveChangesAsync(ct);
        return MapReturnCode(r);
    }

    [HttpPut("return-codes/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> UpdateReturnCode(Guid id, [FromBody] ReturnCodeUpsertDto dto, CancellationToken ct)
    {
        await returnCodeVal.ValidateAndThrowAsync(dto, ct);
        var r = await db.ReturnCodes.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        r.Code = dto.Code.Trim().ToUpperInvariant();
        r.Name = dto.Name.Trim();
        r.Description = dto.Description;
        r.IsActive = dto.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("return-codes/{id:guid}")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> DeleteReturnCode(Guid id, CancellationToken ct)
    {
        var r = await db.ReturnCodes.FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();
        db.ReturnCodes.Remove(r);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static IQueryable<T> SearchCodes<T>(IQueryable<T> src, string? search) where T : class
    {
        if (string.IsNullOrWhiteSpace(search)) return src;
        var like = $"%{search.Trim()}%";
        return src.Where(x => EF.Functions.ILike(EF.Property<string>(x, "Code"), like)
            || EF.Functions.ILike(EF.Property<string>(x, "Name"), like));
    }

    private static CompanySettingsDto MapCompany(CompanySettings s) => new(
        s.Id, s.Division, s.CompanyName, s.Address, s.City, s.Phone, s.Fax,
        s.NpwpNumber, s.PkpNumber, s.DefaultCurrency, s.SettingsJson);

    private static FiscalPeriodDto MapFiscal(FiscalPeriod f) => new(
        f.Id, f.Division, f.Year, f.Month, f.StartDate, f.EndDate,
        f.IsClosed, f.ClosedAtUtc, f.ClosedByUserId);

    private static OrderCodeDto MapOrderCode(OrderCode o) => new(o.Id, o.Code, o.Name, o.Description, o.IsActive);
    private static ReturnCodeDto MapReturnCode(ReturnCode r) => new(r.Id, r.Code, r.Name, r.Description, r.IsActive);
}
