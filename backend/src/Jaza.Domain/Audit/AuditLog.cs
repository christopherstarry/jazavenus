namespace Jaza.Domain.Audit;

/// <summary>
/// Append-only audit record. The DB user has INSERT-only on this table — no UPDATE/DELETE granted.
/// Inserted automatically by AuditSaveChangesInterceptor for every entity change,
/// and explicitly for sensitive non-entity actions (logins, MFA changes, role assignment).
/// </summary>
public sealed class AuditLog
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;

    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    /// <summary>"Create" | "Update" | "Delete" | "Login.Success" | "Login.Failed" | "Role.Assigned" | ...</summary>
    public required string Action { get; set; }

    /// <summary>Entity type or domain noun ("Item", "Invoice", "User").</summary>
    public required string Entity { get; set; }
    public Guid? EntityId { get; set; }

    public string? BeforeJson { get; set; }
    public string? AfterJson { get; set; }
    public string? Notes { get; set; }
}
