namespace Jaza.Application.Common;

/// <summary>
/// Canonical role catalog used by the auth + permission system.
/// Roles are stored as a small numeric code (RoleId) on AppUser AND mirrored as an ASP.NET
/// Identity role name so the existing claims-based authorization (User.IsInRole, [Authorize(Roles=...)])
/// continues to work without change.
/// </summary>
public static class Roles
{
    /// <summary>Generic staff. Most restrictive base role.</summary>
    public const string Sales = "Sales";

    /// <summary>Placeholder role for future module-specific permission profiles.</summary>
    public const string Admin = "Admin";

    /// <summary>Owners of the business: full business pages + user management. NO error-log access.</summary>
    public const string SuperAdmin = "SuperAdmin";

    /// <summary>You / IT. Full access including error logs and developer tooling.</summary>
    public const string Developer = "Developer";

    /// <summary>
    /// Deprecated alias of <see cref="Sales"/>. Pre-existing controllers reference this
    /// constant; new code should use <see cref="Sales"/>.
    /// </summary>
    [Obsolete("Use Roles.Sales — kept only so legacy controllers still compile during the auth refactor.")]
    public const string Operator = Sales;

    /// <summary>Stable numeric ids matching the PRD (roles enum table).</summary>
    public static class Code
    {
        public const short Sales = 1;
        public const short Admin = 2;
        public const short SuperAdmin = 3;
        public const short Developer = 4;
    }

    public static readonly IReadOnlyList<(short Id, string Name)> All =
    [
        (Code.Sales, Sales),
        (Code.Admin, Admin),
        (Code.SuperAdmin, SuperAdmin),
        (Code.Developer, Developer),
    ];

    public static string NameFromId(short id) => id switch
    {
        Code.Sales => Sales,
        Code.Admin => Admin,
        Code.SuperAdmin => SuperAdmin,
        Code.Developer => Developer,
        _ => throw new ArgumentOutOfRangeException(nameof(id), id, "Unknown role id"),
    };

    public static short IdFromName(string name) => name switch
    {
        Sales => Code.Sales,
        Admin => Code.Admin,
        SuperAdmin => Code.SuperAdmin,
        Developer => Code.Developer,
        _ => throw new ArgumentOutOfRangeException(nameof(name), name, "Unknown role name"),
    };
}

/// <summary>Authorization policy names referenced by [Authorize(Policy = ...)] attributes.</summary>
public static class Policies
{
    /// <summary>Developer role only (full access incl. error logs).</summary>
    public const string RequireDeveloper = "RequireDeveloper";

    /// <summary>Developer OR SuperAdmin — used by user-management and permission-management endpoints.</summary>
    public const string RequireSuperAdmin = "RequireSuperAdmin";

    /// <summary>Developer OR SuperAdmin OR Admin.</summary>
    public const string RequireAdmin = "RequireAdmin";

    /// <summary>
    /// Any authenticated, active user. Pre-existing controllers reference this constant —
    /// new authorization should prefer module-specific permission checks via PermissionResolver.
    /// </summary>
    public const string RequireOperator = "RequireOperator";
}

/// <summary>Module identifiers used in user_module_permissions.module.</summary>
public static class Modules
{
    public const string Master = "master";
    public const string Purchase = "purchase";
    public const string Sales = "sales";
    public const string Ar = "ar";
    public const string Inventory = "inventory";

    public static readonly IReadOnlyList<string> All = [Master, Purchase, Sales, Ar, Inventory];
}

/// <summary>Report-type identifiers used in user_report_permissions.report_type.</summary>
public static class ReportTypes
{
    public const string Sales = "sales";
    public const string Inventory = "inventory";
    public const string Purchase = "purchase";
    public const string Ar = "ar";

    public static readonly IReadOnlyList<string> All = [Sales, Inventory, Purchase, Ar];
}
