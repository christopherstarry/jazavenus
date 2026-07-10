using System.Diagnostics.CodeAnalysis;
using FluentValidation;
using Jaza.Application.Common;

[assembly: SuppressMessage("Naming", "CA1711:Identifiers should not have incorrect suffix",
    Scope = "type", Target = "~T:Jaza.Application.Auth.ModulePermission",
    Justification = "Domain term defined by the auth PRD.")]
[assembly: SuppressMessage("Naming", "CA1711:Identifiers should not have incorrect suffix",
    Scope = "type", Target = "~T:Jaza.Application.Auth.ModulePermissionDto",
    Justification = "Domain term defined by the auth PRD.")]

namespace Jaza.Application.Auth;

// ─── Login / sessions ────────────────────────────────────────────────────────

/// <summary>Login request. Email is the internal identifier (e.g. "didi@jaza.local").</summary>
public sealed record LoginRequest(string Email, string Password, string? MfaCode);

/// <summary>Identity portion of the login / me response.</summary>
public sealed record AuthUser(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    bool IsDeveloper,
    bool MfaEnabled,
    bool MustChangePassword);

/// <summary>Resolved permissions snapshot returned alongside the user identity.</summary>
public sealed record ResolvedPermissions(
    IReadOnlyDictionary<string, ModulePermission> Modules,
    IReadOnlyList<string> Reports,
    bool IsDeveloper);

public sealed record ModulePermission(bool CanEdit, bool CanDelete);

public sealed record PreferencesDto(string Language, string TextSize, string Theme, string? Division);

/// <summary>Full successful login response (also returned by /api/auth/refresh).</summary>
public sealed record LoginResponse(
    AuthUser User,
    ResolvedPermissions Permissions,
    PreferencesDto Preferences,
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAtUtc);

public sealed record CurrentUserResponse(
    AuthUser User,
    ResolvedPermissions Permissions,
    PreferencesDto Preferences);

public sealed record RefreshRequest(string RefreshToken);
public sealed record RefreshResponse(string AccessToken, string RefreshToken, DateTime ExpiresAtUtc);

// ─── Password / MFA ──────────────────────────────────────────────────────────

/// <summary>
/// Password change is privileged: only Developer and SuperAdmin may invoke. The user whose
/// password is being changed is identified by <paramref name="UserId"/>; an admin changing
/// their OWN password should pass their own id.
/// </summary>
public sealed record ChangePasswordRequest(Guid UserId, string NewPassword, string ConfirmNewPassword);

/// <summary>
/// Self-service password change for the calling user. Requires the current password as proof of
/// possession; on success the user's SecurityVersion is rotated, signing them out everywhere else.
/// </summary>
public sealed record ChangeMyPasswordRequest(string CurrentPassword, string NewPassword);

public sealed record EnableMfaInitResponse(string SharedKey, string QrCodeDataUrl, string AuthenticatorUri);
public sealed record EnableMfaConfirmRequest(string TotpCode);
public sealed record MfaBackupCodesResponse(IReadOnlyList<string> Codes);

// ─── Preferences ─────────────────────────────────────────────────────────────

public sealed record UpdatePreferencesRequest(string? Language, string? TextSize, string? Theme, string? Division);

// ─── User management ─────────────────────────────────────────────────────────

public sealed record UserListItem(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    bool HasCustomPermissions,
    bool IsActive,
    DateTime? LastLoginAtUtc);

public sealed record UserDetail(
    Guid Id,
    string Email,
    string FullName,
    short RoleId,
    string Role,
    bool HasCustomPermissions,
    bool IsActive,
    bool MfaEnabled,
    DateTime CreatedAtUtc,
    DateTime? LastLoginAtUtc,
    IReadOnlyList<ModulePermissionDto> Modules,
    IReadOnlyList<string> Reports);

public sealed record ModulePermissionDto(string Module, bool CanEdit, bool CanDelete);

public sealed record CreateUserRequest(
    string Email,
    string FullName,
    short RoleId,
    string Password,
    bool HasCustomPermissions,
    IReadOnlyList<ModulePermissionDto>? Modules,
    IReadOnlyList<string>? Reports);

public sealed record UpdateUserRequest(
    string Email,
    string FullName,
    short RoleId,
    bool IsActive);

public sealed record UpdatePermissionsRequest(
    bool HasCustomPermissions,
    IReadOnlyList<ModulePermissionDto> Modules,
    IReadOnlyList<string> Reports);

// ─── Validators ──────────────────────────────────────────────────────────────

public sealed class LoginValidator : AbstractValidator<LoginRequest>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty();
    }
}

/// <summary>
/// Strong-password rules per PRD §7. Used by both ChangePassword and CreateUser.
/// Min 12, upper + lower + digit + symbol.
/// </summary>
internal static class PasswordRules
{
    public static IRuleBuilderOptions<T, string> StrongPassword<T>(this IRuleBuilder<T, string> b) =>
        b.NotEmpty()
         .MinimumLength(12).WithMessage("Must be at least 12 characters long.")
         .Matches("[A-Z]").WithMessage("Must contain an uppercase letter.")
         .Matches("[a-z]").WithMessage("Must contain a lowercase letter.")
         .Matches("[0-9]").WithMessage("Must contain a digit.")
         .Matches("[^A-Za-z0-9]").WithMessage("Must contain a symbol.");
}

public sealed class ChangePasswordValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.NewPassword).StrongPassword();
        RuleFor(x => x.ConfirmNewPassword)
            .Equal(x => x.NewPassword).WithMessage("Passwords do not match.");
    }
}

public sealed class ChangeMyPasswordValidator : AbstractValidator<ChangeMyPasswordRequest>
{
    public ChangeMyPasswordValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).StrongPassword();
    }
}

public sealed class CreateUserValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().MaximumLength(256)
            .Matches(@"^[^\s@]+@[^\s@]+$")
            .WithMessage("Email must look like 'name@domain' (internal identifier — does not need to be deliverable).");
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.RoleId).Must(r => Roles.All.Any(t => t.Id == r))
            .WithMessage("Unknown role id.");
        RuleFor(x => x.Password).StrongPassword();
        RuleForEach(x => x.Modules).ChildRules(c =>
        {
            c.RuleFor(m => m.Module).Must(m => Modules.All.Contains(m))
                .WithMessage("Unknown module.");
        }).When(x => x.Modules is not null);
        RuleForEach(x => x.Reports).Must(r => ReportTypes.All.Contains(r))
            .WithMessage("Unknown report type.")
            .When(x => x.Reports is not null);
    }
}

public sealed class UpdateUserValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.Email).NotEmpty().MaximumLength(256);
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.RoleId).Must(r => Roles.All.Any(t => t.Id == r))
            .WithMessage("Unknown role id.");
    }
}

public sealed class UpdatePermissionsValidator : AbstractValidator<UpdatePermissionsRequest>
{
    public UpdatePermissionsValidator()
    {
        RuleForEach(x => x.Modules).ChildRules(c =>
        {
            c.RuleFor(m => m.Module).Must(m => Modules.All.Contains(m))
                .WithMessage("Unknown module.");
        });
        RuleForEach(x => x.Reports).Must(r => ReportTypes.All.Contains(r))
            .WithMessage("Unknown report type.");
    }
}

public sealed class UpdatePreferencesValidator : AbstractValidator<UpdatePreferencesRequest>
{
    public UpdatePreferencesValidator()
    {
        When(x => x.Language is not null, () =>
        {
            RuleFor(x => x.Language!).Must(v => v is "id" or "en")
                .WithMessage("Language must be 'id' or 'en'.");
        });
        When(x => x.TextSize is not null, () =>
        {
            RuleFor(x => x.TextSize!).Must(v => v is "small" or "normal" or "large" or "xlarge")
                .WithMessage("Text size must be 'small', 'normal', 'large', or 'xlarge'.");
        });
        When(x => x.Theme is not null, () =>
        {
            RuleFor(x => x.Theme!).Must(v => v is "light" or "dark" or "system")
                .WithMessage("Theme must be 'light', 'dark', or 'system'.");
        });
        When(x => x.Division is not null, () =>
        {
            RuleFor(x => x.Division!).Must(Divisions.IsValid)
                .WithMessage("Division must be one of: DISTRIBUTIONBDG, DISTRIBUTIONCRB, TRADINGBDG, TRADINGCRB.");
        });
    }
}
