using Jaza.Application.Common;
using Jaza.Application.Returns;
using Jaza.Application.Stock;
using Jaza.Domain.Common;
using Jaza.Domain.Returns;
using Jaza.Domain.Stock;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Returns;

public sealed class ReturnsService(AppDbContext db, IStockService stock, IActionAuditService audit) : IReturnsService
{
    public async Task PostSalesReturnAsync(Guid id, CancellationToken ct = default)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var doc = await db.SalesReturns.Include(d => d.Lines)
            .FirstOrDefaultAsync(d => d.Id == id, ct) ?? throw new KeyNotFoundException();
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Sales return already posted.");

        foreach (var l in doc.Lines)
        {
            var cost = await stock.GetAverageCostAsync(l.ItemId, doc.WarehouseId, l.LocationId, ct);
            await stock.PostMovementAsync(new StockMovement
            {
                Type = StockMovementType.AdjustmentIn,
                ItemId = l.ItemId,
                WarehouseId = doc.WarehouseId,
                LocationId = l.LocationId,
                Quantity = l.Quantity,
                UnitCost = cost,
                OccurredAtUtc = doc.ReturnDate.ToUniversalTime(),
                SourceDocumentType = nameof(SalesReturn),
                SourceDocumentId = doc.Id,
                SourceDocumentNumber = doc.Number,
            }, ct);
        }

        doc.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        await audit.LogAsync("Post", nameof(SalesReturn), id, entityCode: doc.Number, module: Modules.Sales,
            cancellationToken: ct);
    }

    public async Task PostPurchaseReturnAsync(Guid id, CancellationToken ct = default)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var doc = await db.PurchaseReturns.Include(d => d.Lines)
            .FirstOrDefaultAsync(d => d.Id == id, ct) ?? throw new KeyNotFoundException();
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Purchase return already posted.");

        foreach (var l in doc.Lines)
        {
            await stock.PostMovementAsync(new StockMovement
            {
                Type = StockMovementType.AdjustmentOut,
                ItemId = l.ItemId,
                WarehouseId = doc.WarehouseId,
                LocationId = l.LocationId,
                Quantity = -l.Quantity,
                UnitCost = l.UnitCost,
                OccurredAtUtc = doc.ReturnDate.ToUniversalTime(),
                SourceDocumentType = nameof(PurchaseReturn),
                SourceDocumentId = doc.Id,
                SourceDocumentNumber = doc.Number,
            }, ct);
        }

        doc.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        await audit.LogAsync("Post", nameof(PurchaseReturn), id, entityCode: doc.Number, module: Modules.Purchase,
            cancellationToken: ct);
    }

    public async Task PostCreditMemoAsync(Guid id, CancellationToken ct = default)
    {
        var doc = await db.CreditMemos.FirstOrDefaultAsync(d => d.Id == id, ct)
            ?? throw new KeyNotFoundException();
        if (doc.Status != DocumentStatus.Draft) throw new DomainException("Credit memo already posted.");
        doc.Status = DocumentStatus.Posted;
        await db.SaveChangesAsync(ct);
        await audit.LogAsync("Post", nameof(CreditMemo), id, entityCode: doc.Number, module: Modules.Ar,
            cancellationToken: ct);
    }
}
