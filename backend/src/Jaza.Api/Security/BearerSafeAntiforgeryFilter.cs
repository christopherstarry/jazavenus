using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Jaza.Api.Security;

/// <summary>
/// Antiforgery validation filter that mirrors <c>AutoValidateAntiforgeryTokenAttribute</c> but
/// SKIPS validation when the request is being authenticated by JWT Bearer (and not by the
/// browser cookie). Browser cookie sessions remain protected by the standard double-submit
/// XSRF-TOKEN flow, while mobile / external clients that authenticate exclusively with a
/// bearer token are exempt — bearer auth doesn't carry the ambient cookie that CSRF exploits.
/// </summary>
public sealed class BearerSafeAntiforgeryFilter(IAntiforgery antiforgery) : IAsyncAuthorizationFilter
{
    private static readonly HashSet<string> SafeMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        "GET", "HEAD", "OPTIONS", "TRACE",
    };

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var http = context.HttpContext;

        if (SafeMethods.Contains(http.Request.Method)) return;

        if (HasIgnoreAntiforgeryAttribute(context)) return;

        // If the caller authenticated via JWT Bearer (Authorization header present), skip
        // antiforgery — there's no ambient cookie a CSRF attacker can ride.
        if (IsBearerAuthenticated(http)) return;

        try
        {
            await antiforgery.ValidateRequestAsync(http);
        }
        catch (AntiforgeryValidationException)
        {
            context.Result = new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new
            {
                title = "antiforgery_failed",
                detail = "Antiforgery validation failed. Refresh the page and try again.",
                status = 400,
            });
        }
    }

    private static bool HasIgnoreAntiforgeryAttribute(AuthorizationFilterContext context) =>
        context.ActionDescriptor.EndpointMetadata
            .OfType<Microsoft.AspNetCore.Mvc.IgnoreAntiforgeryTokenAttribute>().Any();

    private static bool IsBearerAuthenticated(HttpContext http)
    {
        // Inspect the Authorization header directly. Filters run early enough that we don't
        // want to rely on http.User which may not yet have been populated by every endpoint
        // configuration. The bearer pipeline still validates the token elsewhere.
        var auth = http.Request.Headers.Authorization.ToString();
        return !string.IsNullOrEmpty(auth)
            && auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase);
    }
}
