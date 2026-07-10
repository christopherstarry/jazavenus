using Jaza.Application.Auth;
using Jaza.Application.Common;
using Jaza.Domain.Common;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Security;

public sealed class DivisionScopeService(
    ICurrentUser currentUser,
    AppDbContext db,
    IHttpContextAccessor httpContextAccessor) : IDivisionScopeService
{
    public bool CanAccessAllDivisions =>
        currentUser.IsInRole(Roles.Developer) || currentUser.IsInRole(Roles.SuperAdmin);

    public string? EffectiveDivision
    {
        get
        {
            if (CanAccessAllDivisions)
            {
                var header = httpContextAccessor.HttpContext?.Request.Headers["X-Division"].FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(header) && Divisions.IsValid(header))
                    return Divisions.Normalize(header);
                return null;
            }

            return GetUserDivisionAsync().GetAwaiter().GetResult();
        }
    }

    public string RequireDivisionForWrite()
    {
        var div = EffectiveDivision;
        if (div is not null) return div;
        if (CanAccessAllDivisions)
            throw new DomainException("X-Division header is required when creating documents as admin.");
        throw new DomainException("User division is not configured.");
    }

    public IQueryable<T> ApplyDivisionFilter<T>(IQueryable<T> query, Func<T, string> divisionSelector)
        where T : class
    {
        var div = EffectiveDivision;
        if (div is null) return query;
        return query.Where(e => divisionSelector(e) == div);
    }

    public void EnsureDivisionAccess(string? documentDivision)
    {
        var div = EffectiveDivision;
        if (div is null) return;
        if (string.IsNullOrWhiteSpace(documentDivision) ||
            !documentDivision.Equals(div, StringComparison.OrdinalIgnoreCase))
            throw new DomainException("Access denied for this division.");
    }

    private async Task<string> GetUserDivisionAsync()
    {
        if (currentUser.UserId is null)
            return Divisions.DistributionBdg;

        var pref = await db.UserPreferences.AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == currentUser.UserId.Value);
        if (pref?.Division is not null && Divisions.IsValid(pref.Division))
            return Divisions.Normalize(pref.Division);

        return Divisions.DistributionBdg;
    }
}
