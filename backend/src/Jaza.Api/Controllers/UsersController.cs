using FluentValidation;
using Jaza.Application.Auth;
using Jaza.Application.Common;
using Jaza.Domain.Audit;
using Jaza.Infrastructure.Identity;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

/// <summary>
/// User management — Developer + SuperAdmin only.
/// SuperAdmin cannot modify Developer accounts.
/// </summary>
[ApiController]
[Route("api/users")]
[Authorize(Policy = Policies.RequireSuperAdmin)]
[Produces("application/json")]
public sealed class UsersController(
    UserManager<AppUser> users,
    AppDbContext db,
    IPermissionService permissions,
    IRefreshTokenService refreshTokens,
    IValidator<CreateUserRequest> createValidator,
    IValidator<UpdateUserRequest> updateValidator,
    IValidator<ChangePasswordRequest> changePwdValidator,
    ILogger<UsersController> logger) : ControllerBase
{
    /// <summary>Developer can modify all roles. SuperAdmin can modify Admin/Sales only.</summary>
    private bool CanModifyUser(AppUser target)
    {
        if (User.IsInRole(Roles.Developer)) return true;
        return target.RoleId is Roles.Code.Admin or Roles.Code.Sales;
    }

    /// <summary>Paged list of users with simple search (name/email contains) and role filter.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<UserListItem>), 200)]
    public async Task<ActionResult<PagedResult<UserListItem>>> List(
        [FromQuery] string? search, [FromQuery] short? role,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var paged = new PagedRequest(page, pageSize).Normalized();

        IQueryable<AppUser> q = db.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var like = $"%{search.Trim()}%";
            q = q.Where(u => EF.Functions.ILike(u.Email!, like) || EF.Functions.ILike(u.FullName, like));
        }
        if (role is not null) q = q.Where(u => u.RoleId == role);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderBy(u => u.FullName)
            .Skip((paged.Page - 1) * paged.PageSize)
            .Take(paged.PageSize)
            .Select(u => new UserListItem(
                u.Id,
                u.Email!,
                u.FullName,
                Roles.NameFromId(u.RoleId),
                u.HasCustomPermissions,
                u.IsActive,
                u.LastLoginAtUtc))
            .ToListAsync(ct);

        return new PagedResult<UserListItem>(items, total, paged.Page, paged.PageSize);
    }

    /// <summary>Detail with module + report permissions, suitable for the edit dialog.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserDetail), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<UserDetail>> Get(Guid id, CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user is null) return NotFound();

        var modules = await db.UserModulePermissions.AsNoTracking()
            .Where(m => m.UserId == id)
            .Select(m => new ModulePermissionDto(m.Module, m.CanEdit, m.CanDelete))
            .ToListAsync(ct);
        var reports = await db.UserReportPermissions.AsNoTracking()
            .Where(r => r.UserId == id)
            .Select(r => r.ReportType)
            .ToListAsync(ct);

        return new UserDetail(
            user.Id, user.Email!, user.FullName,
            user.RoleId, Roles.NameFromId(user.RoleId),
            user.HasCustomPermissions, user.IsActive, user.TwoFactorEnabled,
            user.CreatedAtUtc, user.LastLoginAtUtc, modules, reports);
    }

    /// <summary>Create a new user with optional custom permissions.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(UserDetail), 201)]
    [ProducesResponseType(typeof(ProblemDetails), 400)]
    public async Task<ActionResult<UserDetail>> Create([FromBody] CreateUserRequest req, CancellationToken ct)
    {
        await createValidator.ValidateAndThrowAsync(req, ct);

        if (await users.FindByEmailAsync(req.Email) is not null)
            return BadRequest(new ProblemDetails { Title = "email_in_use", Detail = "Email is already taken." });

        // SuperAdmin can create Admin/Sales only. Developer can create any role.
        if (!User.IsInRole(Roles.Developer) && req.RoleId is not (Roles.Code.Admin or Roles.Code.Sales))
            return Forbid();

        var user = new AppUser
        {
            UserName = req.Email,
            Email = req.Email,
            EmailConfirmed = true,
            FullName = req.FullName,
            RoleId = req.RoleId,
            HasCustomPermissions = req.HasCustomPermissions,
            IsActive = true,
        };
        var create = await users.CreateAsync(user, req.Password);
        if (!create.Succeeded)
            return BadRequest(new ProblemDetails
            {
                Title = "validation_failed",
                Detail = string.Join("; ", create.Errors.Select(e => e.Description)),
            });

        await users.AddToRoleAsync(user, Roles.NameFromId(req.RoleId));

        await permissions.ReplaceAsync(
            user.Id, req.HasCustomPermissions,
            req.Modules ?? Array.Empty<ModulePermissionDto>(),
            req.Reports ?? Array.Empty<string>(), ct);

        await LogUser("User.Created", user.Id, user.Email, $"by={User.Identity?.Name}");
        var detail = await Get(user.Id, ct);
        return CreatedAtAction(nameof(Get), new { id = user.Id }, ((ActionResult<UserDetail>)detail).Value);
    }

    /// <summary>Update name, email, role, active flag.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(UserDetail), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<UserDetail>> Update(Guid id, [FromBody] UpdateUserRequest req, CancellationToken ct)
    {
        await updateValidator.ValidateAndThrowAsync(req, ct);
        var user = await users.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        if (!CanModifyUser(user)) return Forbid();

        if (!User.IsInRole(Roles.Developer) && req.RoleId is not (Roles.Code.Admin or Roles.Code.Sales))
            return Forbid();

        var oldRoleId = user.RoleId;
        if (!string.Equals(user.Email, req.Email, StringComparison.OrdinalIgnoreCase))
        {
            await users.SetEmailAsync(user, req.Email);
            await users.SetUserNameAsync(user, req.Email);
        }
        user.FullName = req.FullName;
        user.RoleId = req.RoleId;
        user.IsActive = req.IsActive;
        user.UpdatedAtUtc = DateTime.UtcNow;
        var update = await users.UpdateAsync(user);
        if (!update.Succeeded)
            return BadRequest(new ProblemDetails
            {
                Title = "validation_failed",
                Detail = string.Join("; ", update.Errors.Select(e => e.Description)),
            });

        // Sync the Identity role assignment (used by [Authorize(Roles=...)])
        if (oldRoleId != req.RoleId)
        {
            await users.RemoveFromRoleAsync(user, Roles.NameFromId(oldRoleId));
            await users.AddToRoleAsync(user, Roles.NameFromId(req.RoleId));
        }

        // Deactivation also revokes outstanding sessions.
        if (!req.IsActive)
            await refreshTokens.RevokeAllForUserAsync(user.Id, "deactivated", ct);

        await LogUser("User.Updated", user.Id, user.Email, $"by={User.Identity?.Name}");
        return ((ActionResult<UserDetail>)await Get(id, ct)).Value!;
    }

    /// <summary>Permanently delete a user. Revokes all sessions first.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var user = await users.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        if (!CanModifyUser(user)) return Forbid();

        // Revoke all refresh tokens before deleting the user
        await refreshTokens.RevokeAllForUserAsync(id, "deleted", ct);

        // Delete related permission rows (cascade handles module/report permissions, but we explicitly clear audit log FKs)
        var auditEntries = await db.AuditLogs.Where(a => a.UserId == id).ToListAsync(ct);
        foreach (var entry in auditEntries) entry.UserId = null;
        await db.SaveChangesAsync(ct);

        var email = user.Email;
        var result = await users.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(new ProblemDetails
            {
                Title = "delete_failed",
                Detail = string.Join("; ", result.Errors.Select(e => e.Description)),
            });

        await LogUser("User.Deleted", id, email, $"by={User.Identity?.Name}");
        return NoContent();
    }

    /// <summary>
    /// Force a password reset on the given user. Same effect as /api/auth/change-password but
    /// mirrored under the user resource for the management UI.
    /// </summary>
    [HttpPost("{id:guid}/reset-password")]
    [ProducesResponseType(typeof(MessageResponse), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 400)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<MessageResponse>> ResetPassword(
        Guid id, [FromBody] ResetPasswordRequest req, CancellationToken ct)
    {
        var validateReq = new ChangePasswordRequest(id, req.NewPassword, req.ConfirmNewPassword);
        await changePwdValidator.ValidateAndThrowAsync(validateReq, ct);

        var user = await users.FindByIdAsync(id.ToString());
        if (user is null) return NotFound();

        if (!CanModifyUser(user)) return Forbid();

        var token = await users.GeneratePasswordResetTokenAsync(user);
        var result = await users.ResetPasswordAsync(user, token, req.NewPassword);
        if (!result.Succeeded)
            return BadRequest(new ProblemDetails
            {
                Title = "validation_failed",
                Detail = string.Join("; ", result.Errors.Select(e => e.Description)),
            });

        user.SecurityVersion = Guid.NewGuid();
        user.MustChangePassword = false;
        user.UpdatedAtUtc = DateTime.UtcNow;
        await users.UpdateAsync(user);
        await refreshTokens.RevokeAllForUserAsync(id, "password-changed", ct);

        await LogUser("Password.ForcedReset", id, user.Email, $"by={User.Identity?.Name}");
        return Ok(new MessageResponse("Password changed. All existing sessions for this user have been signed out."));
    }

    private async Task LogUser(string action, Guid uid, string? email, string? notes)
    {
        db.AuditLogs.Add(new AuditLog
        {
            Action = action,
            Entity = "User",
            EntityId = uid,
            UserId = uid,
            UserName = email,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers.UserAgent.ToString(),
            Notes = notes,
        });
        try { await db.SaveChangesAsync(); }
        catch (Exception ex) { logger.LogError(ex, "Failed to write user audit log"); }
    }
}

public sealed record ResetPasswordRequest(string NewPassword, string ConfirmNewPassword);
