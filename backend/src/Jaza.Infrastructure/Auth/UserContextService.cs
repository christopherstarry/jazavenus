using Jaza.Application.Auth;
using Jaza.Application.Common;

namespace Jaza.Infrastructure.Auth;

public sealed class UserContextService(ICurrentUser currentUser, IPermissionService permissions)
    : IUserContextService
{
    private ResolvedPermissions? _cached;

    public Guid? UserId => currentUser.UserId;

    public async Task<ResolvedPermissions> GetPermissionsAsync(CancellationToken ct = default)
    {
        if (_cached is not null) return _cached;
        if (currentUser.UserId is null)
            return _cached = new ResolvedPermissions(new Dictionary<string, ModulePermission>(), [], false);
        _cached = await permissions.ResolveAsync(currentUser.UserId.Value, ct);
        return _cached;
    }
}
