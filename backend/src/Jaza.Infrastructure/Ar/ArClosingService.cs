using Jaza.Application.Ar;
using Jaza.Application.Common;
using Jaza.Domain.Ar;
using Jaza.Domain.Common;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Ar;

public sealed class ArClosingService(AppDbContext db, IActionAuditService audit) : IArClosingService
{
    public async Task ClosePeriodAsync(ArClosePeriodRequest request, Guid userId, CancellationToken ct = default)
    {
        var exists = await db.ArPeriodClosings.AnyAsync(c =>
            c.Division == request.Division && c.Year == request.Year && c.Month == request.Month, ct);
        if (exists)
            throw new DomainException("AR period is already closed.");

        db.ArPeriodClosings.Add(new ArPeriodClosing
        {
            Division = request.Division,
            Year = request.Year,
            Month = request.Month,
            ClosedAtUtc = DateTime.UtcNow,
            ClosedByUserId = userId,
            Notes = request.Notes,
        });

        var fiscal = await db.FiscalPeriods
            .FirstOrDefaultAsync(f => f.Division == request.Division && f.Year == request.Year && f.Month == request.Month, ct);
        if (fiscal is not null)
        {
            fiscal.IsClosed = true;
            fiscal.ClosedAtUtc = DateTime.UtcNow;
            fiscal.ClosedByUserId = userId;
        }

        await db.SaveChangesAsync(ct);
        await audit.LogAsync("AR.PeriodClosed", nameof(ArPeriodClosing), null,
            module: Modules.Ar, notes: $"{request.Division} {request.Year}-{request.Month:D2}", cancellationToken: ct);
    }

    public async Task RecalculateBalancesAsync(string division, CancellationToken ct = default)
    {
        // AR balance is computed from invoices - no denormalized balance table to update.
        await audit.LogAsync("AR.Recalculated", "Customer", null,
            module: Modules.Ar, notes: division, cancellationToken: ct);
    }

    public async Task EnsurePeriodOpenAsync(string division, DateTime transactionDate, CancellationToken ct = default)
    {
        var closed = await db.ArPeriodClosings.AnyAsync(c =>
            c.Division == division && c.Year == transactionDate.Year && c.Month == transactionDate.Month, ct);
        if (closed)
            throw new DomainException("AR period is closed for this date.");
    }
}
