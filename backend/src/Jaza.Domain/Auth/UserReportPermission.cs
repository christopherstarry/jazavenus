using System.Diagnostics.CodeAnalysis;

namespace Jaza.Domain.Auth;

/// <summary>
/// One row per user per report type they can view.
/// Absence of a row = report category grayed out in the sidebar, direct URLs return 403.
/// </summary>
[SuppressMessage("Naming", "CA1711:Identifiers should not have incorrect suffix",
    Justification = "Domain term defined by the auth PRD — the entity literally is a permission row.")]
public sealed class UserReportPermission
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public Guid UserId { get; set; }

    /// <summary>"sales" | "inventory" | "purchase" | "ar" — see <c>Jaza.Application.Common.ReportTypes</c>.</summary>
    public required string ReportType { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
