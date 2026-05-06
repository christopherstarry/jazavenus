namespace Jaza.Domain.Common;

/// <summary>
/// Base class for all aggregates. Tracks identity, audit columns, and soft-delete state.
/// All audit fields are populated automatically by the AuditSaveChangesInterceptor.
/// </summary>
public abstract class Entity
{
    public Guid Id { get; set; } = Guid.CreateVersion7();

    public DateTime CreatedAtUtc { get; set; }
    public Guid? CreatedByUserId { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }
    public Guid? UpdatedByUserId { get; set; }

    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public Guid? DeletedByUserId { get; set; }

    /// <summary>
    /// Optimistic-concurrency token. Mapped to PostgreSQL's <c>xmin</c> system column
    /// (the transaction id of the last writer), which Npgsql populates automatically.
    /// We never set this manually — EF reads it on load and uses it in UPDATE WHERE clauses.
    /// </summary>
    public uint RowVersion { get; set; }

    /// <summary>Set by ETL to keep traceability to the legacy primary key (nullable).</summary>
    public int? LegacyId { get; set; }
}
