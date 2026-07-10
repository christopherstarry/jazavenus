namespace Jaza.Application.Auth;

/// <summary>Per-request user context: permissions and division.</summary>
public interface IUserContextService
{
    Guid? UserId { get; }
    Task<ResolvedPermissions> GetPermissionsAsync(CancellationToken ct = default);
}
