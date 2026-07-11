using Jaza.Application.Auth;
using Jaza.Application.Common;
using Microsoft.AspNetCore.Authorization;

namespace Jaza.Api.Security;

public sealed class RequireModuleAttribute : AuthorizeAttribute
{
    public RequireModuleAttribute(string module) => Policy = $"Module:{module}";
}

public sealed class RequireReportAttribute : AuthorizeAttribute
{
    public RequireReportAttribute(string reportType) => Policy = $"Report:{reportType}";
}

public sealed class RequireCanDeleteAttribute : AuthorizeAttribute
{
    public RequireCanDeleteAttribute(string module) => Policy = $"CanDelete:{module}";
}

public sealed class ModulePermissionRequirement(string module) : IAuthorizationRequirement
{
    public string Module { get; } = module;
}

public sealed class ReportPermissionRequirement(string reportType) : IAuthorizationRequirement
{
    public string ReportType { get; } = reportType;
}

public sealed class ModuleDeletePermissionRequirement(string module) : IAuthorizationRequirement
{
    public string Module { get; } = module;
}

public sealed class ModulePermissionHandler(IUserContextService userContext)
    : AuthorizationHandler<ModulePermissionRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, ModulePermissionRequirement requirement)
    {
        var perms = await userContext.GetPermissionsAsync();
        if (perms.IsDeveloper || PermissionResolver.HasModuleAccess(perms, requirement.Module))
            context.Succeed(requirement);
    }
}

public sealed class ReportPermissionHandler(IUserContextService userContext)
    : AuthorizationHandler<ReportPermissionRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, ReportPermissionRequirement requirement)
    {
        var perms = await userContext.GetPermissionsAsync();
        if (perms.IsDeveloper || PermissionResolver.CanViewReport(perms, requirement.ReportType))
            context.Succeed(requirement);
    }
}

public sealed class ModuleDeletePermissionHandler(IUserContextService userContext)
    : AuthorizationHandler<ModuleDeletePermissionRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, ModuleDeletePermissionRequirement requirement)
    {
        var perms = await userContext.GetPermissionsAsync();
        if (perms.IsDeveloper || PermissionResolver.CanDelete(perms, requirement.Module))
            context.Succeed(requirement);
    }
}
