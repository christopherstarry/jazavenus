using Jaza.Application.Common;
using Jaza.Application.Inventory;
using Jaza.Application.Stock;
using Jaza.Domain.Common;
using Jaza.Domain.Inventory;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Inventory;

public sealed class InventoryDocumentService(AppDbContext db, IStockService stock, IActionAuditService audit)
    : IInventoryDocumentService
{
    public async Task PostStockReceiptAsync(Guid id, CancellationToken ct = default)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var doc = await db.StockReceipts.Include(d => d.Lines)
            .FirstOrDefaultAsync(d => d.Id == id, ct) ?? throw new KeyNotFoundException();
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Stock receipt already posted.");

        foreach (var l in doc.Lines)
        {
            await stock.PostMovementAsync(new StockMovement
            {
                Type = StockMovementType.AdjustmentIn,
                ItemId = l.ItemId,
                WarehouseId = doc.WarehouseId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
                UnitCost = l.UnitCost,
                OccurredAtUtc = doc.ReceiptDate.ToUniversalTime(),
                SourceDocumentType = nameof(StockReceipt),
                SourceDocumentId = doc.Id,
                SourceDocumentNumber = doc.Number,
            }, ct);
        }

        doc.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        await audit.LogAsync("Post", nameof(StockReceipt), id, entityCode: doc.Number, module: Modules.Inventory,
            cancellationToken: ct);
    }

    public async Task PostStockIssueAsync(Guid id, CancellationToken ct = default)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var doc = await db.StockIssues.Include(d => d.Lines)
            .FirstOrDefaultAsync(d => d.Id == id, ct) ?? throw new KeyNotFoundException();
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Stock issue already posted.");

        foreach (var l in doc.Lines)
        {
            var cost = l.UnitCost > 0 ? l.UnitCost
                : await stock.GetAverageCostAsync(l.ItemId, doc.WarehouseId, l.LocationId, ct);
            await stock.PostMovementAsync(new StockMovement
            {
                Type = StockMovementType.AdjustmentOut,
                ItemId = l.ItemId,
                WarehouseId = doc.WarehouseId,
                LocationId = l.LocationId,
                Quantity = -l.Quantity,
                UnitCost = cost,
                OccurredAtUtc = doc.IssueDate.ToUniversalTime(),
                SourceDocumentType = nameof(StockIssue),
                SourceDocumentId = doc.Id,
                SourceDocumentNumber = doc.Number,
            }, ct);
        }

        doc.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        await audit.LogAsync("Post", nameof(StockIssue), id, entityCode: doc.Number, module: Modules.Inventory,
            cancellationToken: ct);
    }

    public async Task PostStockTransferAsync(Guid id, CancellationToken ct = default)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var doc = await db.StockTransfers.Include(d => d.Lines)
            .FirstOrDefaultAsync(d => d.Id == id, ct) ?? throw new KeyNotFoundException();
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Stock transfer already posted.");

        foreach (var l in doc.Lines)
        {
            var cost = await stock.GetAverageCostAsync(l.ItemId, doc.FromWarehouseId, l.FromLocationId, ct);
            await stock.PostMovementAsync(new StockMovement
            {
                Type = StockMovementType.TransferOut,
                ItemId = l.ItemId,
                WarehouseId = doc.FromWarehouseId,
                LocationId = l.FromLocationId,
                Quantity = -l.Quantity,
                UnitCost = cost,
                OccurredAtUtc = doc.TransferDate.ToUniversalTime(),
                SourceDocumentType = nameof(StockTransfer),
                SourceDocumentId = doc.Id,
                SourceDocumentNumber = doc.Number,
            }, ct);
            await stock.PostMovementAsync(new StockMovement
            {
                Type = StockMovementType.TransferIn,
                ItemId = l.ItemId,
                WarehouseId = doc.ToWarehouseId,
                LocationId = l.ToLocationId,
                Quantity = l.Quantity,
                UnitCost = cost,
                OccurredAtUtc = doc.TransferDate.ToUniversalTime(),
                SourceDocumentType = nameof(StockTransfer),
                SourceDocumentId = doc.Id,
                SourceDocumentNumber = doc.Number,
            }, ct);
        }

        doc.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        await audit.LogAsync("Post", nameof(StockTransfer), id, entityCode: doc.Number, module: Modules.Inventory,
            cancellationToken: ct);
    }

    public async Task PostStockTakeAsync(Guid id, CancellationToken ct = default)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var session = await db.StockTakeSessions.Include(s => s.Lines)
            .FirstOrDefaultAsync(s => s.Id == id, ct) ?? throw new KeyNotFoundException();
        if (session.Status == StockTakeStatus.Posted) throw new DomainException("Stock take already posted.");

        foreach (var l in session.Lines.Where(x => x.CountedQuantity.HasValue))
        {
            var variance = l.CountedQuantity!.Value - l.SystemQuantity;
            if (variance == 0) continue;

            var type = variance > 0 ? StockMovementType.StockTakeIn : StockMovementType.StockTakeOut;
            var cost = await stock.GetAverageCostAsync(l.ItemId, session.WarehouseId, l.LocationId, ct);
            await stock.PostMovementAsync(new StockMovement
            {
                Type = type,
                ItemId = l.ItemId,
                WarehouseId = session.WarehouseId,
                LocationId = l.LocationId,
                Quantity = variance,
                UnitCost = cost,
                OccurredAtUtc = session.SessionDate.ToUniversalTime(),
                SourceDocumentType = nameof(StockTakeSession),
                SourceDocumentId = session.Id,
                SourceDocumentNumber = session.Number,
            }, ct);
        }

        session.Status = StockTakeStatus.Posted;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        await audit.LogAsync("Post", nameof(StockTakeSession), id, entityCode: session.Number, module: Modules.Inventory,
            cancellationToken: ct);
    }
}
