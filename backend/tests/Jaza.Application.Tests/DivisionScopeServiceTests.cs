using FluentAssertions;
using Jaza.Application.Common;
using Jaza.Domain.Auth;
using Jaza.Domain.Common;
using Jaza.Infrastructure.Security;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace Jaza.Application.Tests;

public sealed class DivisionScopeServiceTests
{
    [Fact]
    public void SuperAdmin_WithoutHeader_SeesAllDivisions()
    {
        var user = new FakeCurrentUser();
        user.WithRole(Roles.SuperAdmin);
        var svc = NewService(user, new DefaultHttpContext());

        svc.CanAccessAllDivisions.Should().BeTrue();
        svc.EffectiveDivision.Should().BeNull();
    }

    [Fact]
    public void SuperAdmin_WithHeader_PinsDivision()
    {
        var user = new FakeCurrentUser();
        user.WithRole(Roles.SuperAdmin);
        var ctx = new DefaultHttpContext();
        ctx.Request.Headers["X-Division"] = Divisions.TradingBdg;
        var svc = NewService(user, ctx);

        svc.EffectiveDivision.Should().Be(Divisions.TradingBdg);
    }

    [Fact]
    public async Task RegularUser_UsesPreferenceDivision()
    {
        await using var db = TestDb.New();
        var userId = Guid.NewGuid();
        db.UserPreferences.Add(new UserPreference { UserId = userId, Division = Divisions.DistributionCrb });
        await db.SaveChangesAsync();

        var user = new FakeCurrentUser { UserId = userId };
        user.WithRole(Roles.Sales);
        var svc = NewService(user, new DefaultHttpContext(), db);

        svc.EffectiveDivision.Should().Be(Divisions.DistributionCrb);
    }

    [Fact]
    public void RequireDivisionForWrite_AdminWithoutHeader_Throws()
    {
        var user = new FakeCurrentUser();
        user.WithRole(Roles.SuperAdmin);
        var svc = NewService(user, new DefaultHttpContext());

        Action act = () => svc.RequireDivisionForWrite();
        act.Should().Throw<DomainException>().WithMessage("*X-Division*");
    }

    [Fact]
    public void EnsureDivisionAccess_Mismatch_Throws()
    {
        var user = new FakeCurrentUser();
        user.WithRole(Roles.SuperAdmin);
        var ctx = new DefaultHttpContext();
        ctx.Request.Headers["X-Division"] = Divisions.DistributionBdg;
        var svc = NewService(user, ctx);

        Action act = () => svc.EnsureDivisionAccess(Divisions.TradingBdg);
        act.Should().Throw<DomainException>().WithMessage("*division*");
    }

    private static DivisionScopeService NewService(
        FakeCurrentUser user, HttpContext httpContext, Infrastructure.Persistence.AppDbContext? db = null)
    {
        db ??= TestDb.New();
        var accessor = new HttpContextAccessor { HttpContext = httpContext };
        return new DivisionScopeService(user, db, accessor);
    }
}
