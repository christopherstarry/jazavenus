using Microsoft.AspNetCore.Identity;

namespace Jaza.Infrastructure.Identity;

/// <summary>
/// Application user. Email is an internal identifier (e.g. "didi@jaza.local") — never a real
/// inbox. We do not send email; password resets are performed by Developer/SuperAdmin only.
/// </summary>
public sealed class AppUser : IdentityUser<Guid>
{
    /// <summary>Display name shown in the header / user list.</summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Stable numeric code for the user's base role (1=Sales, 2=Admin, 3=SuperAdmin, 4=Developer).
    /// The Identity role assignment (UserRoles table) is kept in sync so [Authorize(Roles=...)] works.
    /// </summary>
    public short RoleId { get; set; }

    /// <summary>
    /// When TRUE the user_module_permissions / user_report_permissions tables are the source of
    /// truth and the base role is ignored for module/report access.
    /// </summary>
    public bool HasCustomPermissions { get; set; }

    /// <summary>
    /// FALSE = soft-deleted / deactivated. The user cannot log in but their audit trail is preserved.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Forces re-login on every device when rotated. Always rotated by the API when a Developer
    /// or SuperAdmin resets a user's password.
    /// </summary>
    public Guid SecurityVersion { get; set; } = Guid.NewGuid();

    public bool MustChangePassword { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAtUtc { get; set; }
}

public sealed class AppRole : IdentityRole<Guid>
{
    public AppRole() { }
    public AppRole(string name) : base(name) { NormalizedName = name.ToUpperInvariant(); }
}
