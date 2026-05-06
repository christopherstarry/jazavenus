namespace Jaza.Application.Auth;

/// <summary>
/// Loads a user's permission rows from the database and runs them through PermissionResolver.
/// Concrete implementation lives in Infrastructure (touches EF). Services and controllers depend
/// on this interface so they remain test-friendly.
/// </summary>
public interface IPermissionService
{
    /// <summary>Compute the resolved permission snapshot for a user — used by /me and /login.</summary>
    Task<ResolvedPermissions> ResolveAsync(Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Replace ALL custom permission rows for a user.
    /// When <c>hasCustomPermissions=false</c> all rows are removed and the user falls back to base role.
    /// </summary>
    Task ReplaceAsync(
        Guid userId,
        bool hasCustomPermissions,
        IReadOnlyList<ModulePermissionDto> modules,
        IReadOnlyList<string> reports,
        CancellationToken ct = default);
}
