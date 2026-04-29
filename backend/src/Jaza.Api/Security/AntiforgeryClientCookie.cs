using Microsoft.AspNetCore.Antiforgery;

namespace Jaza.Api.Security;

/// <summary>
/// Microsoft.AspNetCore.Antiforgery uses TWO tokens: a server-managed cookie token (named "jaza.xsrf"
/// in our config) and a derived "request token" that callers must echo back in the X-XSRF-TOKEN header.
/// For a SPA we cannot render the request token into HTML, so we publish it via a dedicated cookie
/// (HttpOnly=false) named XSRF-TOKEN. This is the OWASP-recommended "double-submit cookie" pattern:
/// the JS reads the cookie value, sends it back as a header on every state-changing request, and the
/// antiforgery service confirms the two halves match.
///
/// The XSRF-TOKEN cookie itself is NOT a secret — knowing it conveys no privilege without also having
/// the http-only cookie token, which an attacker on a different origin cannot read or steal.
/// </summary>
public static class AntiforgeryClientCookie
{
    public const string CookieName = "XSRF-TOKEN";

    public static void Issue(HttpContext http, IAntiforgery antiforgery)
    {
        var tokens = antiforgery.GetAndStoreTokens(http);
        if (string.IsNullOrEmpty(tokens.RequestToken)) return;

        http.Response.Cookies.Append(CookieName, tokens.RequestToken, new CookieOptions
        {
            HttpOnly = false,
            Secure = http.Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/",
        });
    }
}
