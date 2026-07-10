using Jaza.Application.Common;
using Jaza.Domain.Audit;

namespace Jaza.Infrastructure.Persistence;

public sealed class ActionAuditService(AppDbContext db, ICurrentUser currentUser) : IActionAuditService
{
    public async Task LogAsync(
        string action,
        string entity,
        Guid? entityId,
        string? entityCode = null,
        string? module = null,
        string? notes = null,
        string? beforeJson = null,
        string? afterJson = null,
        CancellationToken cancellationToken = default)
    {
        db.AuditLogs.Add(new AuditLog
        {
            Action = action,
            Entity = entity,
            EntityId = entityId,
            EntityCode = entityCode,
            Module = module ?? AuditMetadata.ResolveModule(entity),
            Notes = notes,
            BeforeJson = beforeJson,
            AfterJson = afterJson,
            UserId = currentUser.UserId,
            UserName = currentUser.UserName,
            IpAddress = currentUser.IpAddress,
            UserAgent = currentUser.UserAgent,
            OccurredAtUtc = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(cancellationToken);
    }
}
