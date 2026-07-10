using FluentAssertions;
using Jaza.Application.Auth;
using Jaza.Application.Common;
using Xunit;

namespace Jaza.Application.Tests.Auth;

/// <summary>
/// Validation rules per PRD §7. Login + password + permission validators are tested in isolation
/// (no DB) since FluentValidation is purely functional.
/// </summary>
public sealed class ValidatorTests
{
    [Fact]
    public void Login_EmptyEmail_Fails()
    {
        var v = new LoginValidator();
        var r = v.Validate(new LoginRequest("", "secret", null));
        r.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Login_EmptyPassword_Fails()
    {
        var v = new LoginValidator();
        var r = v.Validate(new LoginRequest("a@b.local", "", null));
        r.IsValid.Should().BeFalse();
    }

    [Fact]
    public void Login_AcceptsTotpCode()
    {
        var v = new LoginValidator();
        v.Validate(new LoginRequest("a@b.local", "p", "123456")).IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("short1!A", false, "less than 12 chars")]
    [InlineData("nouppercase1!", false, "no uppercase")]
    [InlineData("NOLOWERCASE1!", false, "no lowercase")]
    [InlineData("NoDigitsHere!", false, "no digit")]
    [InlineData("NoSymbols1234", false, "no symbol")]
    [InlineData("Password123!", true, "matches policy")]
    [InlineData("CorrectHorseBattery1!", true, "well above min")]
    public void ChangePassword_PolicyEnforced(string password, bool expectedValid, string scenario)
    {
        var v = new ChangePasswordValidator();
        var r = v.Validate(new ChangePasswordRequest(Guid.NewGuid(), password, password));
        r.IsValid.Should().Be(expectedValid, scenario);
    }

    [Fact]
    public void ChangePassword_Mismatch_Fails()
    {
        var v = new ChangePasswordValidator();
        var r = v.Validate(new ChangePasswordRequest(Guid.NewGuid(), "Password123!", "DifferentPwd1!"));
        r.IsValid.Should().BeFalse();
        r.Errors.Should().Contain(e => e.PropertyName == "ConfirmNewPassword");
    }

    [Fact]
    public void CreateUser_RejectsUnknownRole()
    {
        var v = new CreateUserValidator();
        var r = v.Validate(new CreateUserRequest(
            Email: "a@b.local",
            FullName: "Test",
            RoleId: 99,
            Password: "Password123!",
            HasCustomPermissions: false,
            Modules: null,
            Reports: null));
        r.IsValid.Should().BeFalse();
        r.Errors.Should().Contain(e => e.PropertyName == "RoleId");
    }

    [Fact]
    public void CreateUser_RejectsUnknownModule()
    {
        var v = new CreateUserValidator();
        var r = v.Validate(new CreateUserRequest(
            Email: "a@b.local",
            FullName: "Test",
            RoleId: Roles.Code.Sales,
            Password: "Password123!",
            HasCustomPermissions: true,
            Modules: [new("not-a-module", true, false)],
            Reports: null));
        r.IsValid.Should().BeFalse();
    }

    [Fact]
    public void CreateUser_AllowsValidShape()
    {
        var v = new CreateUserValidator();
        var r = v.Validate(new CreateUserRequest(
            Email: "didi@jaza.local",
            FullName: "Didi",
            RoleId: Roles.Code.Admin,
            Password: "Password123!",
            HasCustomPermissions: true,
            Modules: [new(Modules.Master, true, false), new(Modules.Sales, true, true)],
            Reports: [ReportTypes.Ar]));
        r.IsValid.Should().BeTrue();
    }

    [Fact]
    public void UpdatePreferences_RejectsBogusValues()
    {
        var v = new UpdatePreferencesValidator();
        v.Validate(new UpdatePreferencesRequest("klingon", null, null, null)).IsValid.Should().BeFalse();
        v.Validate(new UpdatePreferencesRequest(null, "tiny", null, null)).IsValid.Should().BeFalse();
        v.Validate(new UpdatePreferencesRequest(null, null, "neon", null)).IsValid.Should().BeFalse();
        v.Validate(new UpdatePreferencesRequest(null, null, null, "INVALID")).IsValid.Should().BeFalse();
    }

    [Fact]
    public void UpdatePreferences_AcceptsAllValid()
    {
        var v = new UpdatePreferencesValidator();
        v.Validate(new UpdatePreferencesRequest("id", "normal", "light", "DISTRIBUTIONBDG")).IsValid.Should().BeTrue();
        v.Validate(new UpdatePreferencesRequest("en", "large", "dark", null)).IsValid.Should().BeTrue();
        v.Validate(new UpdatePreferencesRequest(null, null, null, null)).IsValid.Should().BeTrue();
    }

    [Fact]
    public void UpdatePermissions_RejectsUnknownReport()
    {
        var v = new UpdatePermissionsValidator();
        var r = v.Validate(new UpdatePermissionsRequest(
            HasCustomPermissions: true,
            Modules: [],
            Reports: [ReportTypes.Ar, "bogus"]));
        r.IsValid.Should().BeFalse();
    }
}
