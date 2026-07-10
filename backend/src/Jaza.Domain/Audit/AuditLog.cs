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

    /// <summary>Human-readable identifier at time of change (document number, customer code).</summary>
    public string? EntityCode { get; set; }

    /// <summary>Permission module: master, purchase, sales, inventory, ar, system.</summary>
    public string? Module { get; set; }

    /// <summary>Field-level diff array JSON for updates.</summary>
    public string? ChangesJson { get; set; }

    public string? BeforeJson { get; set; }
    public string? AfterJson { get; set; }
    public string? Notes { get; set; }
}
