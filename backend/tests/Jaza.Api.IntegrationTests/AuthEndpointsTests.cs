using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Jaza.Application.Auth;
using Jaza.Application.Common;
using Xunit;

namespace Jaza.Api.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class AuthEndpointsTests(PostgresFixture fx)
{
    [Fact]
    public async Task Login_WithSuperAdminCredentials_ReturnsTokensAndPermissions()
    {
        var client = fx.CreateFactory().CreateClient();

        var resp = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("superadmin@jaza.local", "Password123!", null));

        resp.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await resp.Content.ReadFromJsonAsync<LoginResponse>();
        body.Should().NotBeNull();
        body!.User.Email.Should().Be("superadmin@jaza.local");
        body.User.Role.Should().Be(Roles.SuperAdmin);
        body.AccessToken.Should().NotBeNullOrWhiteSpace();
        body.RefreshToken.Should().NotBeNullOrWhiteSpace();
        body.Permissions.IsDeveloper.Should().BeFalse();
        body.Permissions.Modules.Should().HaveCount(Modules.All.Count);
    }

    [Fact]
    public async Task Login_DeveloperGetsIsDeveloperFlag()
    {
        var client = fx.CreateFactory().CreateClient();

        var resp = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("developer@jaza.local", "Password123!", null));

        resp.IsSuccessStatusCode.Should().BeTrue();
        var body = await resp.Content.ReadFromJsonAsync<LoginResponse>();
        body!.Permissions.IsDeveloper.Should().BeTrue();
    }

    [Fact]
    public async Task Login_WithBadPassword_Returns401()
    {
        var client = fx.CreateFactory().CreateClient();
        var resp = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("superadmin@jaza.local", "wrong-password!", null));
        resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithUnknownEmail_Returns401()
    {
        var client = fx.CreateFactory().CreateClient();
        var resp = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("nobody@jaza.local", "Password123!", null));
        resp.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Me_AfterLogin_ReturnsResolvedPermissions_ForCustomUser()
    {
        // Didi has master(edit) + purchase(edit+delete) + sales(edit+delete) + AR report.
        var (client, _) = await LoginAsync("didi@jaza.local", "Password123!");

        var meResp = await client.GetAsync("/api/auth/me");
        meResp.IsSuccessStatusCode.Should().BeTrue();
        var me = await meResp.Content.ReadFromJsonAsync<CurrentUserResponse>();

        me.Should().NotBeNull();
        me!.User.Email.Should().Be("didi@jaza.local");
        me.Permissions.Modules.Should().ContainKey(Modules.Master);
        me.Permissions.Modules[Modules.Master].CanEdit.Should().BeTrue();
        me.Permissions.Modules[Modules.Master].CanDelete.Should().BeFalse();
        me.Permissions.Modules.Should().NotContainKey(Modules.Inventory);
        me.Permissions.Reports.Should().BeEquivalentTo([ReportTypes.Ar]);
    }

    [Fact]
    public async Task Refresh_ReturnsNewTokens_AndOldTokenIsRevoked()
    {
        var client = fx.CreateFactory().CreateClient();
        var login = await client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("superadmin@jaza.local", "Password123!", null));
        var loginBody = (await login.Content.ReadFromJsonAsync<LoginResponse>())!;
        var oldRefresh = loginBody.RefreshToken;

        // First refresh succeeds.
        var refresh1 = await client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest(oldRefresh));
        refresh1.StatusCode.Should().Be(HttpStatusCode.OK);
        var refreshBody = await refresh1.Content.ReadFromJsonAsync<RefreshResponse>();
        refreshBody!.RefreshToken.Should().NotBe(oldRefresh);

        // Reusing the old (now-rotated) refresh token must fail.
        var refresh2 = await client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest(oldRefresh));
        refresh2.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Logout_RevokesRefreshToken()
    {
        var (client, login) = await LoginAsync("superadmin@jaza.local", "Password123!");

        var logout = await client.PostAsync("/api/auth/logout", content: null);
        logout.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var refresh = await client.PostAsJsonAsync("/api/auth/refresh", new RefreshRequest(login.RefreshToken));
        refresh.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ChangePassword_AsSuperAdmin_RotatesSecurityVersion_AndKillsSessions()
    {
        // SuperAdmin logs in, then changes Yane's password.
        var (admin, _) = await LoginAsync("superadmin@jaza.local", "Password123!");

        // Yane logs in first to get a refresh token.
        var yaneClient = fx.CreateFactory().CreateClient();
        var yaneLogin = (await (await yaneClient.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("yane@jaza.local", "Password123!", null))).Content
            .ReadFromJsonAsync<LoginResponse>())!;

        // Admin changes Yane's password.
        var changeResp = await admin.PostAsJsonAsync("/api/auth/change-password",
            new ChangePasswordRequest(yaneLogin.User.Id, "NewStrongPwd123!", "NewStrongPwd123!"));
        changeResp.StatusCode.Should().Be(HttpStatusCode.OK);

        // Yane's old refresh token must now be rejected.
        var refresh = await yaneClient.PostAsJsonAsync("/api/auth/refresh",
            new RefreshRequest(yaneLogin.RefreshToken));
        refresh.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // And Yane can log in with the new password (clean slate).
        var relogin = await yaneClient.PostAsJsonAsync("/api/auth/login",
            new LoginRequest("yane@jaza.local", "NewStrongPwd123!", null));
        relogin.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task ChangePassword_AsRegularUser_Forbidden()
    {
        var (user, login) = await LoginAsync("robby@jaza.local", "Password123!");

        var resp = await user.PostAsJsonAsync("/api/auth/change-password",
            new ChangePasswordRequest(login.User.Id, "NewStrongPwd123!", "NewStrongPwd123!"));
        resp.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Preferences_RoundTrip()
    {
        var (client, _) = await LoginAsync("superadmin@jaza.local", "Password123!");

        var get1 = await client.GetFromJsonAsync<PreferencesDto>("/api/auth/preferences");
        get1!.Language.Should().Be("id");

        var put = await client.PutAsJsonAsync("/api/auth/preferences",
            new UpdatePreferencesRequest(Language: "en", TextSize: "large", Theme: "dark", Division: "DISTRIBUTIONBDG"));
        put.IsSuccessStatusCode.Should().BeTrue();
        var updated = await put.Content.ReadFromJsonAsync<PreferencesDto>();
        updated!.Language.Should().Be("en");
        updated.TextSize.Should().Be("large");
        updated.Theme.Should().Be("dark");

        var get2 = await client.GetFromJsonAsync<PreferencesDto>("/api/auth/preferences");
        get2!.Language.Should().Be("en");
    }

    private async Task<(HttpClient Client, LoginResponse Login)> LoginAsync(string email, string password)
    {
        // Cookies are HttpOnly + SameSite=Strict; we use a CookieContainer-aware HttpClient.
        var factory = fx.CreateFactory();
        var client = factory.CreateDefaultClient(new SessionHandler { InnerHandler = new HttpClientHandler() });

        // Bootstrap the antiforgery cookie (XSRF-TOKEN) so subsequent POST/PUT/DELETE include the header.
        await client.GetAsync("/api/auth/antiforgery");

        var resp = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, password, null));
        resp.IsSuccessStatusCode.Should().BeTrue($"login should succeed for {email}; status was {resp.StatusCode}");
        var login = (await resp.Content.ReadFromJsonAsync<LoginResponse>())!;
        return (client, login);
    }

    /// <summary>
    /// Test client side-car. Stores cookies AND echoes the XSRF-TOKEN cookie back as the
    /// X-XSRF-TOKEN header on unsafe methods, mirroring the SPA's antiforgery double-submit pattern.
    /// </summary>
    private sealed class SessionHandler : DelegatingHandler
    {
        private readonly System.Net.CookieContainer _jar = new();

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken ct)
        {
            if (request.RequestUri is not null)
            {
                var cookieHeader = _jar.GetCookieHeader(request.RequestUri);
                if (!string.IsNullOrEmpty(cookieHeader))
                    request.Headers.Add("Cookie", cookieHeader);

                if (HttpMethod.Get != request.Method && HttpMethod.Head != request.Method)
                {
                    var xsrf = _jar.GetCookies(request.RequestUri)["XSRF-TOKEN"]?.Value;
                    if (!string.IsNullOrEmpty(xsrf))
                        request.Headers.Add("X-XSRF-TOKEN", xsrf);
                }
            }

            var resp = await base.SendAsync(request, ct);

            if (resp.Headers.TryGetValues("Set-Cookie", out var setCookies) && request.RequestUri is not null)
            {
                foreach (var sc in setCookies)
                    _jar.SetCookies(request.RequestUri, sc);
            }
            return resp;
        }
    }
}
