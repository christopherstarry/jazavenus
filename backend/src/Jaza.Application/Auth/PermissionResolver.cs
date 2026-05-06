using Jaza.Application.Common;

namespace Jaza.Application.Auth;

/// <summary>
/// Pure-function permission resolver. Implements PRD §6.1 exactly:
///
///   1. Developer (RoleId 4)                       → full access incl. error logs.
///   2. SuperAdmin (RoleId 3) without custom perms → full business access, no error logs.
///   3. has_custom_permissions = true              → use the per-user permission rows.
///   4. Otherwise (Admin / Sales fallback)         → minimal Sales-only access.
///
/// Kept entirely free of EF / database dependencies so it can be unit-tested with plain
/// in-memory inputs and re-used by tests, the API, and anywhere else that needs to know
/// what a user can see.
/// </summary>
public static class PermissionResolver
{
    public sealed record UserPermissionInputs(
        short RoleId,
        bool HasCustomPermissions,
        IReadOnlyList<UserModulePermissionRow> Modules,
        IReadOnlyList<string> Reports);

    public sealed record UserModulePermissionRow(string Module, bool CanEdit, bool CanDelete);

    public static ResolvedPermissions Resolve(UserPermissionInputs input)
    {
        // 1. Developer = global access.
        if (input.RoleId == Roles.Code.Developer)
        {
            return AllAccess(isDeveloper: true);
        }

        // 2. SuperAdmin without custom perms = full business access.
        if (input.RoleId == Roles.Code.SuperAdmin && !input.HasCustomPermissions)
        {
            return AllAccess(isDeveloper: false);
        }

        // 3. Custom per-user permission rows.
        if (input.HasCustomPermissions)
        {
            var modules = input.Modules
                .GroupBy(m => m.Module)
                .ToDictionary(g => g.Key, g =>
                {
                    var row = g.Last(); // dedupe defensively
                    return new ModulePermission(row.CanEdit, row.CanDelete);
                });

            // Filter reports to known ones, dedupe.
            var reports = input.Reports
                .Where(ReportTypes.All.Contains)
                .Distinct()
                .ToList();

            return new ResolvedPermissions(modules, reports, IsDeveloper: false);
        }

        // 4. Fallback (Admin or Sales without custom perms): minimal Sales-only access.
        return new ResolvedPermissions(
            new Dictionary<string, ModulePermission>
            {
                [Modules.Sales] = new ModulePermission(CanEdit: true, CanDelete: false),
            },
            Reports: [],
            IsDeveloper: false);
    }

    /// <summary>True when the user has ANY access (edit or read) to the given module.</summary>
    public static bool HasModuleAccess(ResolvedPermissions perms, string module) =>
        perms.Modules.ContainsKey(module);

    /// <summary>True when the user can edit (create/update) within the given module.</summary>
    public static bool CanEdit(ResolvedPermissions perms, string module) =>
        perms.Modules.TryGetValue(module, out var p) && p.CanEdit;

    /// <summary>True when the user can delete within the given module.</summary>
    public static bool CanDelete(ResolvedPermissions perms, string module) =>
        perms.Modules.TryGetValue(module, out var p) && p.CanDelete;

    /// <summary>True when the user can view the given report type.</summary>
    public static bool CanViewReport(ResolvedPermissions perms, string reportType) =>
        perms.Reports.Contains(reportType);

    private static ResolvedPermissions AllAccess(bool isDeveloper)
    {
        var modules = Modules.All.ToDictionary(
            m => m,
            _ => new ModulePermission(CanEdit: true, CanDelete: true));
        return new ResolvedPermissions(modules, ReportTypes.All.ToList(), isDeveloper);
    }
}
