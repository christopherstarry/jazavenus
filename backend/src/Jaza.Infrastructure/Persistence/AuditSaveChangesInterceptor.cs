using System.Text.Json;
using Jaza.Application.Common;
using Jaza.Domain.Audit;
using Jaza.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Jaza.Infrastructure.Persistence;

/// <summary>
/// Stamps audit columns and emits AuditLog rows on every SaveChanges.
/// Soft-deletes (IsDeleted = true) are emitted as "Delete" actions but the row stays in place.
/// </summary>
public sealed class AuditSaveChangesInterceptor(ICurrentUser currentUser) : SaveChangesInterceptor
{
    private static readonly JsonSerializerOptions JsonOpts = new() { WriteIndented = false };

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct = default)
    {
        if (eventData.Context is not null)
        {
            StampAuditColumns(eventData.Context);
            EmitAuditLogs(eventData.Context);
        }
        return base.SavingChangesAsync(eventData, result, ct);
    }

    private void StampAuditColumns(DbContext db)
    {
        var now = DateTime.UtcNow;
        var userId = currentUser.UserId;
        foreach (var entry in db.ChangeTracker.Entries<Entity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAtUtc = now;
                    entry.Entity.CreatedByUserId = userId;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAtUtc = now;
                    entry.Entity.UpdatedByUserId = userId;
                    break;
                case EntityState.Deleted:
                    // Convert hard-delete into soft-delete.
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedAtUtc = now;
                    entry.Entity.DeletedByUserId = userId;
                    break;
            }
        }
    }

    private void EmitAuditLogs(DbContext db)
    {
        var auditEntries = db.ChangeTracker.Entries<Entity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified)
            .Select(BuildAudit)
            .Where(a => a is not null)
            .ToList();

        foreach (var a in auditEntries)
        {
            db.Set<AuditLog>().Add(a!);
        }
    }

    private AuditLog? BuildAudit(EntityEntry<Entity> entry)
    {
        var action = entry.State == EntityState.Added
            ? "Create"
            : entry.Entity.IsDeleted ? "Delete" : "Update";

        var entityName = entry.Entity.GetType().Name;
        var before = entry.State == EntityState.Added
            ? null
            : SerializeProperties(entry, original: true);
        var after = entry.Entity.IsDeleted ? null : SerializeProperties(entry, original: false);

        return new AuditLog
        {
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            IpAddress = currentUser.IpAddress,
            UserAgent = currentUser.UserAgent,
            Action = action,
            Entity = entityName,
            EntityId = entry.Entity.Id,
            BeforeJson = before,
            AfterJson = after,
        };
    }

    private static string SerializeProperties(EntityEntry entry, bool original)
    {
        var dict = new Dictionary<string, object?>();
        foreach (var p in entry.Properties)
        {
            if (p.Metadata.Name == nameof(Entity.RowVersion)) continue;
            dict[p.Metadata.Name] = original ? p.OriginalValue : p.CurrentValue;
        }
        return JsonSerializer.Serialize(dict, JsonOpts);
    }
}
