using FluentAssertions;
using Jaza.Application.Ar;
using Jaza.Application.Common;
using Jaza.Domain.Ar;
using Jaza.Domain.Common;
using Jaza.Domain.Settings;
using Jaza.Infrastructure.Ar;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class ArClosingServiceTests
{
    private static readonly Guid UserId = Guid.Parse("99999999-9999-9999-9999-999999999999");

    [Fact]
    public async Task ClosePeriodAsync_CreatesClosingRecord()
    {
        await using var db = TestDb.New();
        var svc = new ArClosingService(db, TestDb.Audit(db));

        await svc.ClosePeriodAsync(new ArClosePeriodRequest(Divisions.DistributionBdg, 2026, 6, "month end"), UserId);

        var closing = await db.ArPeriodClosings.SingleAsync();
        closing.Year.Should().Be(2026);
        closing.Month.Should().Be(6);
        closing.ClosedByUserId.Should().Be(UserId);
    }

    [Fact]
    public async Task ClosePeriodAsync_ClosesMatchingFiscalPeriod()
    {
        await using var db = TestDb.New();
        var fiscal = new FiscalPeriod
        {
            Division = Divisions.DistributionBdg,
            Year = 2026,
            Month = 7,
            StartDate = new DateTime(2026, 7, 1),
            EndDate = new DateTime(2026, 7, 31),
        };
        db.FiscalPeriods.Add(fiscal);
        await db.SaveChangesAsync();
        var svc = new ArClosingService(db, TestDb.Audit(db));

        await svc.ClosePeriodAsync(new ArClosePeriodRequest(Divisions.DistributionBdg, 2026, 7, null), UserId);

        (await db.FiscalPeriods.SingleAsync()).IsClosed.Should().BeTrue();
    }

    [Fact]
    public async Task ClosePeriodAsync_Duplicate_Throws()
    {
        await using var db = TestDb.New();
        db.ArPeriodClosings.Add(new ArPeriodClosing
        {
            Division = Divisions.DistributionBdg,
            Year = 2026,
            Month = 5,
            ClosedAtUtc = DateTime.UtcNow,
            ClosedByUserId = UserId,
        });
        await db.SaveChangesAsync();
        var svc = new ArClosingService(db, TestDb.Audit(db));

        Func<Task> act = () => svc.ClosePeriodAsync(
            new ArClosePeriodRequest(Divisions.DistributionBdg, 2026, 5, null), UserId);

        await act.Should().ThrowAsync<DomainException>().WithMessage("*already closed*");
    }

    [Fact]
    public async Task EnsurePeriodOpenAsync_ClosedPeriod_Throws()
    {
        await using var db = TestDb.New();
        db.ArPeriodClosings.Add(new ArPeriodClosing
        {
            Division = Divisions.DistributionBdg,
            Year = 2026,
            Month = 3,
            ClosedAtUtc = DateTime.UtcNow,
            ClosedByUserId = UserId,
        });
        await db.SaveChangesAsync();
        var svc = new ArClosingService(db, TestDb.Audit(db));

        Func<Task> act = () => svc.EnsurePeriodOpenAsync(
            Divisions.DistributionBdg, new DateTime(2026, 3, 15));

        await act.Should().ThrowAsync<DomainException>().WithMessage("*period is closed*");
    }

    [Fact]
    public async Task RecalculateBalancesAsync_LogsAudit()
    {
        await using var db = TestDb.New();
        var svc = new ArClosingService(db, TestDb.Audit(db));

        await svc.RecalculateBalancesAsync(Divisions.DistributionBdg);

        var log = await db.AuditLogs.SingleAsync();
        log.Action.Should().Be("AR.Recalculated");
    }
}
