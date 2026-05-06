using Jaza.Application.Auth;
using Jaza.Domain.Auth;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Auth;

/// <summary>
/// EF-backed loader for permission rows. Resolution itself is delegated to the pure
/// <see cref="PermissionResolver"/> so the rules stay easy to unit-test without a database.
/// </summary>
public sealed class PermissionService(AppDbContext db) : IPermissionService
{
    public async Task<ResolvedPermissions> ResolveAsync(Guid userId, CancellationToken ct = default)
    {
        // Pull the role + custom-permission flag in one query — the rest only loads when needed.
        var user = await db.Users
            .Where(u => u.Id == userId)
            .Select(u => new { u.RoleId, u.HasCustomPermissions })
            .FirstOrDefaultAsync(ct)
            ?? throw new KeyNotFoundException("User not found.");

        var modules = Array.Empty<PermissionResolver.UserModulePermissionRow>();
        var reports = Array.Empty<string>();

        if (user.HasCustomPermissions)
        {
            modules = await db.UserModulePermissions
                .Where(m => m.UserId == userId)
                .Select(m => new PermissionResolver.UserModulePermissionRow(m.Module, m.CanEdit, m.CanDelete))
                .ToArrayAsync(ct);

            reports = await db.UserReportPermissions
                .Where(r => r.UserId == userId)
                .Select(r => r.ReportType)
                .ToArrayAsync(ct);
        }

        return PermissionResolver.Resolve(new PermissionResolver.UserPermissionInputs(
            user.RoleId, user.HasCustomPermissions, modules, reports));
    }

    public async Task ReplaceAsync(
        Guid userId,
        bool hasCustomPermissions,
        IReadOnlyList<ModulePermissionDto> modules,
        IReadOnlyList<string> reports,
        CancellationToken ct = default)
    {
        // Wipe existing rows, then insert what's in the request. Atomicity: AppDbContext.SaveChanges
        // is one transaction, so callers see a consistent snapshot.
        await db.UserModulePermissions
            .Where(m => m.UserId == userId)
            .ExecuteDeleteAsync(ct);
        await db.UserReportPermissions
            .Where(r => r.UserId == userId)
            .ExecuteDeleteAsync(ct);

        if (hasCustomPermissions)
        {
            foreach (var m in modules.DistinctBy(m => m.Module))
            {
                db.UserModulePermissions.Add(new UserModulePermission
                {
                    UserId = userId,
                    Module = m.Module,
                    CanEdit = m.CanEdit,
                    CanDelete = m.CanDelete,
                });
            }
            foreach (var r in reports.Distinct())
            {
                db.UserReportPermissions.Add(new UserReportPermission
                {
                    UserId = userId,
                    ReportType = r,
                });
            }
        }

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new KeyNotFoundException("User not found.");
        if (user.HasCustomPermissions != hasCustomPermissions)
        {
            user.HasCustomPermissions = hasCustomPermissions;
            user.UpdatedAtUtc = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);
    }
}
