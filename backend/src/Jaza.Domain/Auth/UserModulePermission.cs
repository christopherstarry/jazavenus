using System.Diagnostics.CodeAnalysis;

namespace Jaza.Domain.Auth;

/// <summary>
/// One row per user per module they have ANY access to.
/// Absence of a row = NO access (sidebar grayed out, direct URL blocked, all module APIs return 403).
///
/// Module values: "master" | "purchase" | "sales" | "ar" | "inventory" (see <c>Jaza.Application.Common.Modules</c>).
/// </summary>
[SuppressMessage("Naming", "CA1711:Identifiers should not have incorrect suffix",
    Justification = "Domain term defined by the auth PRD — the entity literally is a permission row.")]
public sealed class UserModulePermission
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid UserId { get; set; }

    public required string Module { get; set; }

    /// <summary>FALSE → form inputs are readOnly, Save / Create button disabled.</summary>
    public bool CanEdit { get; set; }

    /// <summary>FALSE → Delete button hidden / disabled.</summary>
    public bool CanDelete { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
