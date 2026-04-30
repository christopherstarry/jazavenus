using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Auth;
using Jaza.Application.Common;
using Jaza.Domain.Audit;
using Jaza.Infrastructure.Identity;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Jaza.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    UserManager<AppUser> users,
    SignInManager<AppUser> signIn,
    AppDbContext db,
    IAntiforgery antiforgery,
    IValidator<LoginRequest> loginValidator,
    IValidator<ChangePasswordRequest> changePwdValidator,
    ITotpService totp,
    IConfiguration config,
    ILogger<AuthController> logger) : ControllerBase
{
    /// <summary>
    /// Production default: SuperAdmin accounts MUST have MFA enabled before they can sign in.
    /// In Development, set "Auth:RequireSuperAdminMfa" to false in appsettings.Development.json
    /// so the seeded dev super-admin can log in without going through TOTP enrolment first.
    /// </summary>
    private bool RequireSuperAdminMfa => config.GetValue("Auth:RequireSuperAdminMfa", defaultValue: true);

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        await loginValidator.ValidateAndThrowAsync(req, ct);

        var user = await users.FindByNameAsync(req.Username.Trim());
        if (user is null)
        {
            await LogAuth("Login.Failed", null, req.Username, "user-not-found");
            return Unauthorized(new { error = "invalid_credentials" });
        }

        var pwdOk = await users.CheckPasswordAsync(user, req.Password);
        if (!pwdOk)
        {
            await users.AccessFailedAsync(user);
            await LogAuth("Login.Failed", user.Id, user.Email, "bad-password");
            return Unauthorized(new { error = "invalid_credentials" });
        }
        if (await users.IsLockedOutAsync(user))
        {
            await LogAuth("Login.Locked", user.Id, user.Email, "lockout-active");
            return Unauthorized(new { error = "account_locked" });
        }

        if (await users.GetTwoFactorEnabledAsync(user))
        {
            if (string.IsNullOrWhiteSpace(req.TotpCode))
                return Unauthorized(new { error = "mfa_required" });

            var sharedKey = await users.GetAuthenticatorKeyAsync(user)
                ?? throw new InvalidOperationException("MFA enabled but no shared key");
            if (!totp.Verify(sharedKey, req.TotpCode))
            {
                await users.AccessFailedAsync(user);
                await LogAuth("Login.Failed", user.Id, user.Email, "bad-totp");
                return Unauthorized(new { error = "invalid_totp" });
            }
        }
        else if (RequireSuperAdminMfa && await users.IsInRoleAsync(user, Roles.SuperAdmin))
        {
            return Unauthorized(new { error = "mfa_setup_required" });
        }

        await users.ResetAccessFailedCountAsync(user);
        user.LastLoginAtUtc = DateTime.UtcNow;
        await users.UpdateAsync(user);

        await signIn.SignInAsync(user, isPersistent: false);
        await LogAuth("Login.Success", user.Id, user.Email, null);

        // Refresh the antiforgery tokens after sign-in so the SPA's next mutating call uses a token
        // bound to the authenticated session, per OWASP guidance.
        AntiforgeryClientCookie.Issue(HttpContext, antiforgery);

        var roles = await users.GetRolesAsync(user);
        return Ok(new LoginResponse(user.Id, user.Email!, user.FullName,
            roles.ToList(), await users.GetTwoFactorEnabledAsync(user), user.MustChangePassword));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var uid = users.GetUserId(User);
        await signIn.SignOutAsync();
        await LogAuth("Logout", Guid.TryParse(uid, out var g) ? g : null, User.Identity?.Name, null);

        // Antiforgery tokens are bound to the current claims-principal. After SignOutAsync the user is
        // anonymous, so the previous token (issued while authenticated) would be rejected by the
        // antiforgery validator on the very next state-changing request — including the next login
        // attempt. Re-issue an anonymous-bound token here so the SPA can immediately call /login again.
        AntiforgeryClientCookie.Issue(HttpContext, antiforgery);

        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<CurrentUserResponse>> Me()
    {
        var user = await users.GetUserAsync(User);
        if (user is null) return Unauthorized();
        var roles = await users.GetRolesAsync(user);
        return new CurrentUserResponse(user.Id, user.Email!, user.FullName,
            roles.ToList(), await users.GetTwoFactorEnabledAsync(user));
    }

    [HttpGet("antiforgery")]
    [AllowAnonymous]
    public IActionResult GetAntiforgery()
    {
        AntiforgeryClientCookie.Issue(HttpContext, antiforgery);
        return NoContent();
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req, CancellationToken ct)
    {
        await changePwdValidator.ValidateAndThrowAsync(req, ct);
        var user = await users.GetUserAsync(User) ?? throw new UnauthorizedAccessException();
        var r = await users.ChangePasswordAsync(user, req.CurrentPassword, req.NewPassword);
        if (!r.Succeeded) return BadRequest(new { errors = r.Errors.Select(e => e.Description) });

        if (user.MustChangePassword)
        {
            user.MustChangePassword = false;
            await users.UpdateAsync(user);
        }
        await LogAuth("Password.Changed", user.Id, user.Email, null);
        return NoContent();
    }

    [HttpPost("mfa/init")]
    [Authorize]
    public async Task<ActionResult<EnableMfaInitResponse>> InitMfa()
    {
        var user = await users.GetUserAsync(User) ?? throw new UnauthorizedAccessException();
        await users.ResetAuthenticatorKeyAsync(user);
        var key = await users.GetAuthenticatorKeyAsync(user)
            ?? throw new InvalidOperationException("Failed to generate authenticator key");
        var (sharedKey, uri, qr) = totp.Enroll(issuer: "Jaza Venus", accountName: user.Email!);
        return new EnableMfaInitResponse(sharedKey, qr, uri);
    }

    [HttpPost("mfa/confirm")]
    [Authorize]
    public async Task<ActionResult<MfaBackupCodesResponse>> ConfirmMfa([FromBody] EnableMfaConfirmRequest req)
    {
        var user = await users.GetUserAsync(User) ?? throw new UnauthorizedAccessException();
        var key = await users.GetAuthenticatorKeyAsync(user) ?? throw new InvalidOperationException("Init MFA first");
        if (!totp.Verify(key, req.TotpCode)) return BadRequest(new { error = "invalid_totp" });
        await users.SetTwoFactorEnabledAsync(user, true);
        var codes = totp.GenerateBackupCodes();
        await LogAuth("MFA.Enabled", user.Id, user.Email, null);
        return new MfaBackupCodesResponse(codes);
    }

    private async Task LogAuth(string action, Guid? uid, string? email, string? notes)
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
        catch (Exception ex) { logger.LogError(ex, "Failed to write auth audit log"); }
    }
}
