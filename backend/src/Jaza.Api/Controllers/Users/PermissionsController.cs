using FluentValidation;
using Jaza.Application.Auth;
using Jaza.Application.Common;
using Jaza.Domain.Audit;
using Jaza.Infrastructure.Identity;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers.Users;

/// <summary>
/// Module + report permission management for an individual user. Developer + SuperAdmin only.
/// </summary>
[ApiController]
[Tags("Users")]
[Route("api/users/{userId:guid}/permissions")]
[Authorize(Policy = Policies.RequireSuperAdmin)]
[Produces("application/json")]
public sealed class PermissionsController(
    AppDbContext db,
    IPermissionService permissions,
    IValidator<UpdatePermissionsRequest> validator,
    ILogger<PermissionsController> logger) : ControllerBase
{
    /// <summary>Read the user's permissions (modules, reports, hasCustomPermissions).</summary>
    [HttpGet]
    [ProducesResponseType(typeof(UserPermissionsView), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<UserPermissionsView>> Get(Guid userId, CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null) return NotFound();

        var modules = await db.UserModulePermissions.AsNoTracking()
            .Where(m => m.UserId == userId)
            .Select(m => new ModulePermissionDto(m.Module, m.CanEdit, m.CanDelete))
            .ToListAsync(ct);
        var reports = await db.UserReportPermissions.AsNoTracking()
            .Where(r => r.UserId == userId)
            .Select(r => r.ReportType)
            .ToListAsync(ct);

        var resolved = await permissions.ResolveAsync(userId, ct);
        return new UserPermissionsView(user.HasCustomPermissions, modules, reports, resolved);
    }

    /// <summary>
    /// Replace ALL module + report permissions for the user.
    /// â€¢ <c>hasCustomPermissions = false</c> â†’ all rows wiped, base role takes over.
    /// â€¢ Modules absent from the request body are removed from the DB.
    /// </summary>
    [HttpPut]
    [ProducesResponseType(typeof(UserPermissionsView), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<UserPermissionsView>> Put(
        Guid userId, [FromBody] UpdatePermissionsRequest req, CancellationToken ct)
    {
        await validator.ValidateAndThrowAsync(req, ct);

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null) return NotFound();

        // Developer can modify all roles. SuperAdmin can modify Admin/Sales only.
        if (!User.IsInRole(Roles.Developer) && user.RoleId is not (Roles.Code.Admin or Roles.Code.Sales))
            return Forbid();

        await permissions.ReplaceAsync(userId, req.HasCustomPermissions, req.Modules, req.Reports, ct);

        await LogPerm(userId, user.Email, $"by={User.Identity?.Name}; custom={req.HasCustomPermissions}; modules={req.Modules.Count}; reports={req.Reports.Count}");

        return ((ActionResult<UserPermissionsView>)await Get(userId, ct)).Value!;
    }

    private async Task LogPerm(Guid uid, string? email, string? notes)
    {
        db.AuditLogs.Add(new AuditLog
        {
            Action = "Permissions.Updated",
            Entity = "User",
            EntityId = uid,
            UserId = uid,
            UserName = email,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString(),
            Notes = notes,
        });
        try { await db.SaveChangesAsync(); }
        catch (Exception ex) { logger.LogError(ex, "Failed to write permission audit log"); }
    }
}

public sealed record UserPermissionsView(
    bool HasCustomPermissions,
    IReadOnlyList<ModulePermissionDto> Modules,
    IReadOnlyList<string> Reports,
    ResolvedPermissions Resolved);
