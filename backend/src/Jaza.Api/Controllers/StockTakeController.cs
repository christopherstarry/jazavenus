using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Inventory;
using Jaza.Application.Stock;
using Jaza.Domain.Common;
using Jaza.Domain.Inventory;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Tags("Inventory")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Inventory)]
[Route("api/inventory/stock-takes")]
public sealed class StockTakeController(
    AppDbContext db,
    IDivisionScopeService division,
    IDocumentNumberGenerator numberGen,
    IStockService stock,
    IInventoryDocumentService inventory,
    IValidator<StockTakePrepDto> prepVal,
    IValidator<StockTakeRecordLinesDto> recordVal) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<StockTakeSessionDto>> List([FromQuery] PagedRequest q, CancellationToken ct)
    {
        q = q.Normalized();
        var src = division.ApplyDivisionFilter(db.StockTakeSessions.AsNoTracking()
            .Include(x => x.Warehouse).Include(x => x.Lines).ThenInclude(l => l.Item), x => x.Division)
            .OrderByDescending(x => x.SessionDate);
        var total = await src.CountAsync(ct);
        var items = await src.Skip((q.Page - 1) * q.PageSize).Take(q.PageSize).ToListAsync(ct);
        return new PagedResult<StockTakeSessionDto>(items.Select(Map).ToList(), total, q.Page, q.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StockTakeSessionDto>> Get(Guid id, CancellationToken ct)
    {
        var session = await Load(id, ct);
        division.EnsureDivisionAccess(session.Division);
        return Map(session);
    }

    [HttpPost("prep")]
    public async Task<ActionResult<StockTakeSessionDto>> Prep([FromBody] StockTakePrepDto dto, CancellationToken ct)
    {
        await prepVal.ValidateAndThrowAsync(dto, ct);
        var onHand = await db.StockOnHand.AsNoTracking()
            .Where(x => x.WarehouseId == dto.WarehouseId && x.Quantity != 0)
            .OrderBy(x => x.ItemId).ThenBy(x => x.LocationId)
            .ToListAsync(ct);

        var lineNo = 1;
        var session = new StockTakeSession
        {
            Number = await numberGen.NextAsync("STK", ct),
            Division = division.RequireDivisionForWrite(),
            WarehouseId = dto.WarehouseId,
            SessionDate = dto.SessionDate,
            Notes = dto.Notes,
            Status = StockTakeStatus.Counting,
            Lines = onHand.Select(x => new StockTakeLine
            {
                LineNumber = lineNo++,
                ItemId = x.ItemId,
                LocationId = x.LocationId,
                SystemQuantity = x.Quantity,
            }).ToList(),
        };
        db.StockTakeSessions.Add(session);
        await db.SaveChangesAsync(ct);
        return await Get(session.Id, ct);
    }

    [HttpPut("{id:guid}/lines")]
    public async Task<IActionResult> RecordLines(Guid id, [FromBody] StockTakeRecordLinesDto dto, CancellationToken ct)
    {
        await recordVal.ValidateAndThrowAsync(dto, ct);
        var session = await db.StockTakeSessions.Include(x => x.Lines).FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(session.Division);
        if (session.Status == StockTakeStatus.Posted) throw new DomainException("Stock take is already posted.");

        foreach (var input in dto.Lines)
        {
            var line = session.Lines.FirstOrDefault(l => l.LineNumber == input.LineNumber)
                ?? session.Lines.FirstOrDefault(l => l.ItemId == input.ItemId && l.LocationId == input.LocationId);
            if (line is null)
            {
                line = new StockTakeLine
                {
                    LineNumber = input.LineNumber,
                    ItemId = input.ItemId,
                    LocationId = input.LocationId,
                    SystemQuantity = await stock.GetOnHandAsync(input.ItemId, session.WarehouseId, input.LocationId, ct),
                };
                session.Lines.Add(line);
            }
            line.CountedQuantity = input.CountedQuantity;
        }

        session.Status = StockTakeStatus.Counting;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/post")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> Post(Guid id, CancellationToken ct)
    {
        var session = await db.StockTakeSessions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new KeyNotFoundException();
        division.EnsureDivisionAccess(session.Division);
        await inventory.PostStockTakeAsync(id, ct);
        return NoContent();
    }

    private async Task<StockTakeSession> Load(Guid id, CancellationToken ct) =>
        await db.StockTakeSessions.AsNoTracking()
            .Include(x => x.Warehouse).Include(x => x.Lines).ThenInclude(l => l.Item)
            .FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new KeyNotFoundException();

    private static StockTakeSessionDto Map(StockTakeSession x) => new(
        x.Id, x.Number, x.Division, x.Status,
        x.WarehouseId, x.Warehouse?.Code, x.SessionDate, x.Notes,
        x.Lines.Select(l => new StockTakeLineDto(
            l.Id, l.LineNumber, l.ItemId, l.Item?.Sku, l.Item?.Name,
            l.LocationId, l.SystemQuantity, l.CountedQuantity, l.Variance)).ToList());
}
