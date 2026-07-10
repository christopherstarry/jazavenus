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
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
        {
            StampAuditColumns(eventData.Context);
            EmitAuditLogs(eventData.Context);
        }
        return base.SavingChangesAsync(eventData, result, cancellationToken);
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
        var entityName = entry.Entity.GetType().Name;
        var action = ResolveAction(entry);

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
            EntityCode = AuditMetadata.ResolveEntityCode(entry.Entity),
            Module = AuditMetadata.ResolveModule(entityName),
            ChangesJson = entry.State == EntityState.Modified && !entry.Entity.IsDeleted
                ? AuditMetadata.BuildChangesJson(entry, original: false)
                : null,
            BeforeJson = before,
            AfterJson = after,
        };
    }

    private static string ResolveAction(EntityEntry<Entity> entry)
    {
        if (entry.State == EntityState.Added) return "Create";
        if (entry.Entity.IsDeleted) return "Delete";

        var statusProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "Status");
        if (statusProp is { IsModified: true })
        {
            var orig = statusProp.OriginalValue?.ToString() ?? "";
            var curr = statusProp.CurrentValue?.ToString() ?? "";
            if (curr.Contains("Posted", StringComparison.Ordinal) &&
                (orig.Contains("Draft", StringComparison.Ordinal) || string.IsNullOrEmpty(orig)))
                return "Post";
            if (curr.Contains("Voided", StringComparison.Ordinal))
                return "Void";
        }

        return "Update";
    }

    private static string SerializeProperties(EntityEntry entry, bool original)
    {
        var dict = new Dictionary<string, object?>();
        foreach (var p in entry.Properties)
        {
            if (p.Metadata.Name is "RowVersion" or "xmin") continue;
            dict[p.Metadata.Name] = original ? p.OriginalValue : p.CurrentValue;
        }
        return JsonSerializer.Serialize(dict, JsonOpts);
    }
}
