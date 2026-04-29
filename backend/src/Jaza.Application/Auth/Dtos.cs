using FluentValidation;

namespace Jaza.Application.Auth;

public sealed record LoginRequest(string Email, string Password, string? TotpCode);
public sealed record LoginResponse(Guid UserId, string Email, string FullName,
    IReadOnlyList<string> Roles, bool MfaEnabled, bool MustChangePassword);

public sealed record RegisterRequest(string Email, string FullName, string Password, IReadOnlyList<string> Roles);

public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public sealed record EnableMfaInitResponse(string SharedKey, string QrCodeDataUrl, string AuthenticatorUri);
public sealed record EnableMfaConfirmRequest(string TotpCode);
public sealed record MfaBackupCodesResponse(IReadOnlyList<string> Codes);

public sealed record CurrentUserResponse(Guid UserId, string Email, string FullName,
    IReadOnlyList<string> Roles, bool MfaEnabled);

public sealed class LoginValidator : AbstractValidator<LoginRequest>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class RegisterValidator : AbstractValidator<RegisterRequest>
{
    public RegisterValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(12)
            .Matches("[A-Z]").WithMessage("Must contain an uppercase letter")
            .Matches("[a-z]").WithMessage("Must contain a lowercase letter")
            .Matches("[0-9]").WithMessage("Must contain a digit")
            .Matches("[^A-Za-z0-9]").WithMessage("Must contain a symbol");
        RuleFor(x => x.Roles).NotEmpty();
    }
}

public sealed class ChangePasswordValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(12)
            .Matches("[A-Z]").Matches("[a-z]").Matches("[0-9]").Matches("[^A-Za-z0-9]");
    }
}
