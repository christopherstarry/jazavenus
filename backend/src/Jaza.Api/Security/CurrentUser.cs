using System.Security.Claims;
using Jaza.Application.Common;

namespace Jaza.Api.Security;

public sealed class HttpCurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    private HttpContext? Ctx => accessor.HttpContext;

    public Guid? UserId
    {
        get
        {
            var s = Ctx?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(s, out var g) ? g : null;
        }
    }

    public string? UserName => Ctx?.User.Identity?.Name;
    public string? IpAddress => Ctx?.Connection.RemoteIpAddress?.ToString();
    public string? UserAgent => Ctx?.Request.Headers.UserAgent.ToString();
    public bool IsAuthenticated => Ctx?.User.Identity?.IsAuthenticated ?? false;
    public bool IsInRole(string role) => Ctx?.User.IsInRole(role) ?? false;
}
