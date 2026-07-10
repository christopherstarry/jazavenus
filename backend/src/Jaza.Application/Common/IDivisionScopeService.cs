namespace Jaza.Application.Common;

/// <summary>Scopes queries and mutations to the user's effective division.</summary>
public interface IDivisionScopeService
{
    /// <summary>Developer and SuperAdmin without a pinned division can see all divisions.</summary>
    bool CanAccessAllDivisions { get; }

    /// <summary>Effective division for the current request, or null when all divisions are visible.</summary>
    string? EffectiveDivision { get; }

    /// <summary>Division to stamp on new transaction documents.</summary>
    string RequireDivisionForWrite();

    IQueryable<T> ApplyDivisionFilter<T>(IQueryable<T> query, Func<T, string> divisionSelector)
        where T : class;

    void EnsureDivisionAccess(string? documentDivision);
}
