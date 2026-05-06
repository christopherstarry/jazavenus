using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Auth;
using Jaza.Application.Common;
using Jaza.Domain.Audit;
using Jaza.Domain.Auth;
using Jaza.Infrastructure.Identity;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

/// <summary>
/// Authentication, current-user, password change, MFA enrolment, and per-user UI preferences.
/// See <c>docs/flow/auth/</c> for the human-friendly overview.
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public sealed class AuthController(
    UserManager<AppUser> users,
    SignInManager<AppUser> signIn,
    AppDbContext db,
    IAntiforgery antiforgery,
    IValidator<LoginRequest> loginValidator,
    IValidator<ChangePasswordRequest> changePwdValidator,
    IValidator<ChangeMyPasswordRequest> changeMyPwdValidator,
    IValidator<UpdatePreferencesRequest> prefsValidator,
    ITotpService totp,
    IAccessTokenIssuer accessTokens,
    IRefreshTokenService refreshTokens,
    IPermissionService permissions,
    IConfiguration config,
    ILogger<AuthController> logger) : ControllerBase
{
    /// <summary>
    /// In Production, SuperAdmin accounts MUST have MFA enabled before they can sign in. In
    /// Development the seeded SuperAdmin can log in without TOTP enrolment first.
    /// </summary>
    private bool RequireSuperAdminMfa => config.GetValue("Auth:RequireSuperAdminMfa", defaultValue: true);

    // ─── Login ────────────────────────────────────────────────────────────────

    /// <summary>
    /// Sign in with email + password (and TOTP code if MFA is enabled).
    /// On success the API sets an HttpOnly session cookie AND returns a JWT access token + refresh token.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    [EnableRateLimiting("login")]
    [ProducesResponseType(typeof(LoginResponse), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 401)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest? req, CancellationToken ct)
    {
        if (req is null)
        {
            return BadRequest(Problem("validation_failed", "Request body must be valid JSON."));
        }

        await loginValidator.ValidateAndThrowAsync(req, ct);

        var user = await users.FindByEmailAsync(req.Email.Trim());
        if (user is null || !user.IsActive)
        {
            await LogAuth("Login.Failed", null, req.Email, "user-not-found-or-inactive");
            return Unauthorized(Problem("invalid_credentials", "Email atau password salah."));
        }

        if (await users.IsLockedOutAsync(user))
        {
            await LogAuth("Login.Locked", user.Id, user.Email, "lockout-active");
            return StatusCode(StatusCodes.Status423Locked, Problem("account_locked", "Akun terkunci. Coba lagi nanti."));
        }

        var pwdOk = await users.CheckPasswordAsync(user, req.Password);
        if (!pwdOk)
        {
            await users.AccessFailedAsync(user);
            await LogAuth("Login.Failed", user.Id, user.Email, "bad-password");
            return Unauthorized(Problem("invalid_credentials", "Email atau password salah."));
        }

        if (await users.GetTwoFactorEnabledAsync(user))
        {
            if (string.IsNullOrWhiteSpace(req.MfaCode))
                return StatusCode(StatusCodes.Status403Forbidden, Problem("mfa_required", "Masukkan kode autentikasi 6-digit."));
            var key = await users.GetAuthenticatorKeyAsync(user)
                ?? throw new InvalidOperationException("MFA enabled but no shared key.");
            if (!totp.Verify(key, req.MfaCode))
            {
                await users.AccessFailedAsync(user);
                await LogAuth("Login.Failed", user.Id, user.Email, "bad-totp");
                return Unauthorized(Problem("invalid_totp", "Kode TOTP salah."));
            }
        }
        else if (RequireSuperAdminMfa && user.RoleId == Roles.Code.SuperAdmin)
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                Problem("mfa_setup_required", "SuperAdmin harus mendaftarkan MFA sebelum bisa login."));
        }

        await users.ResetAccessFailedCountAsync(user);
        user.LastLoginAtUtc = DateTime.UtcNow;
        user.UpdatedAtUtc = DateTime.UtcNow;
        await users.UpdateAsync(user);

        // Cookie session
        await signIn.SignInAsync(user, isPersistent: false);
        AntiforgeryClientCookie.Issue(HttpContext, antiforgery);

        // JWT + refresh token (returned for SPA storage in memory + future mobile clients)
        var perms = await permissions.ResolveAsync(user.Id, ct);
        var prefs = await GetOrInitPreferencesAsync(user.Id, ct);
        var roleName = Roles.NameFromId(user.RoleId);
        var (access, accessExpires) = accessTokens.Issue(user.Id, user.Email!, roleName, perms.IsDeveloper, user.SecurityVersion);
        var (refresh, _) = await refreshTokens.IssueAsync(
            user.Id, user.SecurityVersion,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString(), ct);

        await LogAuth("Login.Success", user.Id, user.Email, null);

        return Ok(new LoginResponse(
            User: ToAuthUser(user, perms),
            Permissions: perms,
            Preferences: prefs,
            AccessToken: access,
            RefreshToken: refresh,
            ExpiresAtUtc: accessExpires));
    }

    // ─── Logout ───────────────────────────────────────────────────────────────

    /// <summary>End the current session. Revokes all of the caller's refresh tokens.</summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(204)]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var uid = users.GetUserId(User);
        if (Guid.TryParse(uid, out var g))
            await refreshTokens.RevokeAllForUserAsync(g, "logout", ct);

        await signIn.SignOutAsync();
        await LogAuth("Logout", Guid.TryParse(uid, out var g2) ? g2 : null, User.Identity?.Name, null);
        AntiforgeryClientCookie.Issue(HttpContext, antiforgery);
        return NoContent();
    }

    // ─── Refresh ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Exchange a valid refresh token for a brand-new access token + refresh token.
    /// The old refresh token is rotated (revoked). Returns 401 once the refresh token is past its
    /// 24-hour expiry — the client must redirect to /login.
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    [EnableRateLimiting("refresh")]
    [ProducesResponseType(typeof(RefreshResponse), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 401)]
    public async Task<ActionResult<RefreshResponse>> Refresh([FromBody] RefreshRequest req, CancellationToken ct)
    {
        var validation = await refreshTokens.ValidateAsync(req.RefreshToken, ct);
        if (validation is null)
            return Unauthorized(Problem("session_expired", "Session berakhir. Silakan login kembali."));

        var user = await users.FindByIdAsync(validation.UserId.ToString());
        if (user is null || !user.IsActive)
            return Unauthorized(Problem("session_expired", "Session berakhir. Silakan login kembali."));

        var perms = await permissions.ResolveAsync(user.Id, ct);
        var roleName = Roles.NameFromId(user.RoleId);
        var (access, accessExpires) = accessTokens.Issue(user.Id, user.Email!, roleName, perms.IsDeveloper, user.SecurityVersion);
        var (refresh, _) = await refreshTokens.RotateAsync(
            validation.TokenId, user.Id, user.SecurityVersion,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString(), ct);

        // Re-issue the cookie session too, so a long-lived browser tab keeps an authoritative cookie.
        await signIn.SignInAsync(user, isPersistent: false);

        return Ok(new RefreshResponse(access, refresh, accessExpires));
    }

    // ─── Current user ─────────────────────────────────────────────────────────

    /// <summary>
    /// Resolved profile + permissions + preferences for the signed-in caller.
    /// The frontend calls this on first load and after permission changes propagate.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(CurrentUserResponse), 200)]
    public async Task<ActionResult<CurrentUserResponse>> Me(CancellationToken ct)
    {
        var user = await users.GetUserAsync(User);
        if (user is null || !user.IsActive) return Unauthorized();

        var perms = await permissions.ResolveAsync(user.Id, ct);
        var prefs = await GetOrInitPreferencesAsync(user.Id, ct);
        return Ok(new CurrentUserResponse(ToAuthUser(user, perms), perms, prefs));
    }

    // ─── Antiforgery bootstrap ────────────────────────────────────────────────

    /// <summary>
    /// Re-issues the XSRF-TOKEN cookie. Called by the SPA on startup and after login/logout.
    /// </summary>
    [HttpGet("antiforgery")]
    [AllowAnonymous]
    [ProducesResponseType(204)]
    public IActionResult GetAntiforgery()
    {
        AntiforgeryClientCookie.Issue(HttpContext, antiforgery);
        return NoContent();
    }

    // ─── Change password ──────────────────────────────────────────────────────

    /// <summary>
    /// Change a user's password. Only Developer or SuperAdmin may invoke.
    /// On success the target user's SecurityVersion is rotated, invalidating every refresh token
    /// for that user globally (they must log in again on every device).
    /// </summary>
    [HttpPost("change-password")]
    [Authorize(Policy = Policies.RequireSuperAdmin)]
    [ProducesResponseType(typeof(MessageResponse), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 400)]
    [ProducesResponseType(typeof(ProblemDetails), 403)]
    public async Task<ActionResult<MessageResponse>> ChangePassword(
        [FromBody] ChangePasswordRequest req, CancellationToken ct)
    {
        await changePwdValidator.ValidateAndThrowAsync(req, ct);

        var target = await users.FindByIdAsync(req.UserId.ToString())
            ?? throw new KeyNotFoundException("Target user not found.");

        var token = await users.GeneratePasswordResetTokenAsync(target);
        var result = await users.ResetPasswordAsync(target, token, req.NewPassword);
        if (!result.Succeeded)
        {
            return BadRequest(Problem(
                "validation_failed",
                string.Join("; ", result.Errors.Select(e => e.Description))));
        }

        // Rotate the security version so every outstanding refresh token becomes invalid.
        target.SecurityVersion = Guid.NewGuid();
        target.MustChangePassword = false;
        target.UpdatedAtUtc = DateTime.UtcNow;
        await users.UpdateAsync(target);
        await refreshTokens.RevokeAllForUserAsync(target.Id, "password-changed", ct);

        await LogAuth("Password.Changed", target.Id, target.Email, $"by={User.Identity?.Name}");
        return Ok(new MessageResponse("Password changed. All existing sessions for this user have been signed out."));
    }

    // ─── Self-service change password ─────────────────────────────────────────

    /// <summary>
    /// The signed-in user changes their own password. Requires their current password.
    /// On success rotates SecurityVersion (signs them out everywhere else) but re-issues
    /// a fresh cookie + JWT for the current device so they can keep working.
    /// </summary>
    [HttpPost("me/change-password")]
    [Authorize]
    [ProducesResponseType(typeof(LoginResponse), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 400)]
    [ProducesResponseType(typeof(ProblemDetails), 401)]
    public async Task<ActionResult<LoginResponse>> ChangeMyPassword(
        [FromBody] ChangeMyPasswordRequest req, CancellationToken ct)
    {
        await changeMyPwdValidator.ValidateAndThrowAsync(req, ct);

        var user = await users.GetUserAsync(User);
        if (user is null || !user.IsActive)
            return Unauthorized(Problem("invalid_credentials", "Sesi tidak valid. Silakan login kembali."));

        var result = await users.ChangePasswordAsync(user, req.CurrentPassword, req.NewPassword);
        if (!result.Succeeded)
        {
            var hadCurrentMismatch = result.Errors.Any(e => e.Code == "PasswordMismatch");
            if (hadCurrentMismatch)
                return Unauthorized(Problem("invalid_current_password", "Password lama salah."));
            return BadRequest(Problem(
                "validation_failed",
                string.Join("; ", result.Errors.Select(e => e.Description))));
        }

        // Rotate SecurityVersion so all OTHER sessions go invalid; revoke all refresh tokens server-side.
        user.SecurityVersion = Guid.NewGuid();
        user.MustChangePassword = false;
        user.UpdatedAtUtc = DateTime.UtcNow;
        await users.UpdateAsync(user);
        await refreshTokens.RevokeAllForUserAsync(user.Id, "self-password-changed", ct);

        // Re-issue session for the caller's current device so the SPA doesn't immediately bounce them out.
        await signIn.SignInAsync(user, isPersistent: false);
        AntiforgeryClientCookie.Issue(HttpContext, antiforgery);

        var perms = await permissions.ResolveAsync(user.Id, ct);
        var prefs = await GetOrInitPreferencesAsync(user.Id, ct);
        var roleName = Roles.NameFromId(user.RoleId);
        var (access, accessExpires) = accessTokens.Issue(user.Id, user.Email!, roleName, perms.IsDeveloper, user.SecurityVersion);
        var (refresh, _) = await refreshTokens.IssueAsync(
            user.Id, user.SecurityVersion,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString(), ct);

        await LogAuth("Password.ChangedSelf", user.Id, user.Email, null);
        return Ok(new LoginResponse(
            User: ToAuthUser(user, perms),
            Permissions: perms,
            Preferences: prefs,
            AccessToken: access,
            RefreshToken: refresh,
            ExpiresAtUtc: accessExpires));
    }

    // ─── MFA ──────────────────────────────────────────────────────────────────

    /// <summary>Generate a TOTP shared key + QR code for the calling user.</summary>
    [HttpPost("mfa/init")]
    [Authorize]
    [ProducesResponseType(typeof(EnableMfaInitResponse), 200)]
    public async Task<ActionResult<EnableMfaInitResponse>> InitMfa()
    {
        var user = await users.GetUserAsync(User) ?? throw new UnauthorizedAccessException();
        await users.ResetAuthenticatorKeyAsync(user);
        _ = await users.GetAuthenticatorKeyAsync(user)
            ?? throw new InvalidOperationException("Failed to generate authenticator key");
        var (sharedKey, uri, qr) = totp.Enroll("Jaza Venus", user.Email!);
        return Ok(new EnableMfaInitResponse(sharedKey, qr, uri));
    }

    /// <summary>Confirm the TOTP code matches and turn on MFA. Returns 10 single-use backup codes.</summary>
    [HttpPost("mfa/confirm")]
    [Authorize]
    [ProducesResponseType(typeof(MfaBackupCodesResponse), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 400)]
    public async Task<ActionResult<MfaBackupCodesResponse>> ConfirmMfa([FromBody] EnableMfaConfirmRequest req)
    {
        var user = await users.GetUserAsync(User) ?? throw new UnauthorizedAccessException();
        var key = await users.GetAuthenticatorKeyAsync(user)
            ?? throw new InvalidOperationException("Init MFA first");
        if (!totp.Verify(key, req.TotpCode))
            return BadRequest(Problem("invalid_totp", "Kode TOTP salah."));
        await users.SetTwoFactorEnabledAsync(user, true);
        var codes = totp.GenerateBackupCodes();
        await LogAuth("MFA.Enabled", user.Id, user.Email, null);
        return Ok(new MfaBackupCodesResponse(codes));
    }

    // ─── Preferences ──────────────────────────────────────────────────────────

    /// <summary>Read the caller's saved preferences.</summary>
    [HttpGet("preferences")]
    [Authorize]
    [ProducesResponseType(typeof(PreferencesDto), 200)]
    public async Task<ActionResult<PreferencesDto>> GetPreferences(CancellationToken ct)
    {
        var user = await users.GetUserAsync(User) ?? throw new UnauthorizedAccessException();
        return Ok(await GetOrInitPreferencesAsync(user.Id, ct));
    }

    /// <summary>Patch any subset of {language, textSize, theme}. Returns the new full snapshot.</summary>
    [HttpPut("preferences")]
    [Authorize]
    [ProducesResponseType(typeof(PreferencesDto), 200)]
    [ProducesResponseType(typeof(ProblemDetails), 400)]
    public async Task<ActionResult<PreferencesDto>> UpdatePreferences(
        [FromBody] UpdatePreferencesRequest req, CancellationToken ct)
    {
        await prefsValidator.ValidateAndThrowAsync(req, ct);
        var user = await users.GetUserAsync(User) ?? throw new UnauthorizedAccessException();

        var pref = await db.UserPreferences.FirstOrDefaultAsync(p => p.UserId == user.Id, ct)
            ?? new UserPreference { UserId = user.Id };
        if (req.Language is not null) pref.Language = req.Language;
        if (req.TextSize is not null) pref.TextSize = req.TextSize;
        if (req.Theme is not null) pref.Theme = req.Theme;
        pref.UpdatedAtUtc = DateTime.UtcNow;

        if (db.Entry(pref).State == EntityState.Detached) db.UserPreferences.Add(pref);
        await db.SaveChangesAsync(ct);

        return Ok(new PreferencesDto(pref.Language, pref.TextSize, pref.Theme));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private async Task<PreferencesDto> GetOrInitPreferencesAsync(Guid userId, CancellationToken ct)
    {
        var p = await db.UserPreferences.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (p is null)
        {
            p = new UserPreference { UserId = userId };
            db.UserPreferences.Add(p);
            await db.SaveChangesAsync(ct);
        }
        return new PreferencesDto(p.Language, p.TextSize, p.Theme);
    }

    private static AuthUser ToAuthUser(AppUser user, ResolvedPermissions perms) =>
        new(user.Id, user.Email!, user.FullName,
            Roles.NameFromId(user.RoleId), perms.IsDeveloper,
            user.TwoFactorEnabled, user.MustChangePassword);

    private static ProblemDetails Problem(string code, string detail) => new()
    {
        Title = code,
        Detail = detail,
        Type = $"https://docs.jaza.local/errors/{code}",
    };

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

public sealed record MessageResponse(string Message);
