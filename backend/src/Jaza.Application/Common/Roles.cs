namespace Jaza.Application.Common;

/// <summary>Canonical role names. Use these constants — never magic strings.</summary>
public static class Roles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Admin = "Admin";
    public const string Operator = "Operator";

    public static readonly string[] All = [SuperAdmin, Admin, Operator];
}

/// <summary>Authorization policy names referenced by [Authorize(Policy = ...)] attributes.</summary>
public static class Policies
{
    public const string RequireSuperAdmin = "RequireSuperAdmin";
    public const string RequireAdmin = "RequireAdmin";
    public const string RequireOperator = "RequireOperator";
}
