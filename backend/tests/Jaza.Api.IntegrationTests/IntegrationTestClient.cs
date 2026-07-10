using System.Net.Http.Json;
using FluentAssertions;
using Jaza.Application.Auth;
using Jaza.Application.Common;
using Jaza.Application.MasterData;

namespace Jaza.Api.IntegrationTests;

internal static class IntegrationTestClient
{
    public const string DefaultDivision = Divisions.DistributionBdg;
    public const string DefaultPassword = "Password123!";

    public static async Task<HttpClient> LoginAsync(
        PostgresFixture fx,
        string email,
        string? division = DefaultDivision,
        string password = DefaultPassword)
    {
        var factory = fx.CreateFactory();
        var client = factory.CreateDefaultClient(new SessionHandler { InnerHandler = new HttpClientHandler() });
        await client.GetAsync("/api/auth/antiforgery");

        if (division is not null)
            client.DefaultRequestHeaders.Add("X-Division", division);

        var resp = await client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, password, null));
        resp.IsSuccessStatusCode.Should().BeTrue($"login failed for {email}: {resp.StatusCode}");
        return client;
    }

    public static void WithDivision(HttpClient client, string division)
    {
        client.DefaultRequestHeaders.Remove("X-Division");
        client.DefaultRequestHeaders.Add("X-Division", division);
    }

    public static CustomerUpsertDto NewCustomer(string code, string name, decimal creditLimit = 0) =>
        new(code, name, null, null, null, null, null, null, null, null, null, null, null,
            creditLimit, 30);

    public static CategoryUpsertDto NewCategory(string code, string name) =>
        new(code, name, ParentId: null);

    public static ItemUpsertDto NewItem(string sku, string name, Guid categoryId, Guid unitId,
        decimal cost = 10m, decimal price = 100m) =>
        new(sku, name, null, null, categoryId, unitId, cost, price, "IDR",
            ReorderLevel: null, ReorderQuantity: null);

    /// <summary>
    /// Stores cookies and echoes XSRF-TOKEN as X-XSRF-TOKEN on unsafe methods.
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
