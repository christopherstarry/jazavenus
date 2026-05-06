using FluentAssertions;
using Jaza.Application.Auth;
using Jaza.Application.Common;
using Xunit;

namespace Jaza.Application.Tests.Auth;

/// <summary>
/// Verifies the PermissionResolver matches PRD §6.1 byte-for-byte. PermissionResolver is a
/// pure function so all tests run in-memory without a database.
/// </summary>
public sealed class PermissionResolverTests
{
    [Fact]
    public void Developer_AlwaysGetsFullAccess_AndIsDeveloperFlagSet()
    {
        var input = new PermissionResolver.UserPermissionInputs(
            RoleId: Roles.Code.Developer,
            HasCustomPermissions: false,
            Modules: [],
            Reports: []);

        var result = PermissionResolver.Resolve(input);

        result.IsDeveloper.Should().BeTrue();
        result.Modules.Should().HaveCount(Modules.All.Count);
        foreach (var m in Modules.All)
        {
            result.Modules.Should().ContainKey(m);
            result.Modules[m].CanEdit.Should().BeTrue();
            result.Modules[m].CanDelete.Should().BeTrue();
        }
        result.Reports.Should().BeEquivalentTo(ReportTypes.All);
    }

    [Fact]
    public void Developer_CustomPermissionFlag_DoesNotRestrictAccess()
    {
        // Even if HasCustomPermissions is set, Developer is checked FIRST.
        var input = new PermissionResolver.UserPermissionInputs(
            RoleId: Roles.Code.Developer,
            HasCustomPermissions: true,
            Modules:
            [
                new(Modules.Sales, CanEdit: false, CanDelete: false), // ignored
            ],
            Reports: []);

        var result = PermissionResolver.Resolve(input);

        result.IsDeveloper.Should().BeTrue();
        result.Modules[Modules.Sales].CanEdit.Should().BeTrue();
        result.Modules[Modules.Sales].CanDelete.Should().BeTrue();
    }

    [Fact]
    public void SuperAdmin_WithoutCustom_GetsFullBusinessAccess_NotDeveloper()
    {
        var input = new PermissionResolver.UserPermissionInputs(
            RoleId: Roles.Code.SuperAdmin,
            HasCustomPermissions: false,
            Modules: [],
            Reports: []);

        var result = PermissionResolver.Resolve(input);

        result.IsDeveloper.Should().BeFalse();
        result.Modules.Should().HaveCount(Modules.All.Count);
        foreach (var m in Modules.All)
            result.Modules[m].CanDelete.Should().BeTrue();
        result.Reports.Should().BeEquivalentTo(ReportTypes.All);
    }

    [Fact]
    public void SuperAdmin_WithCustom_FollowsCustomRows()
    {
        // PRD §2.2: when has_custom_permissions = true, base role is ignored.
        var input = new PermissionResolver.UserPermissionInputs(
            RoleId: Roles.Code.SuperAdmin,
            HasCustomPermissions: true,
            Modules: [new(Modules.Master, CanEdit: true, CanDelete: false)],
            Reports: [ReportTypes.Ar]);

        var result = PermissionResolver.Resolve(input);

        result.IsDeveloper.Should().BeFalse();
        result.Modules.Should().ContainKey(Modules.Master);
        result.Modules[Modules.Master].CanEdit.Should().BeTrue();
        result.Modules[Modules.Master].CanDelete.Should().BeFalse();
        result.Modules.Should().NotContainKey(Modules.Sales);
        result.Reports.Should().BeEquivalentTo([ReportTypes.Ar]);
    }

    [Fact]
    public void Custom_AbsentModule_IsNoAccess()
    {
        var input = new PermissionResolver.UserPermissionInputs(
            RoleId: Roles.Code.Admin,
            HasCustomPermissions: true,
            Modules: [new(Modules.Master, true, false)],
            Reports: []);

        var result = PermissionResolver.Resolve(input);

        PermissionResolver.HasModuleAccess(result, Modules.Inventory).Should().BeFalse();
        PermissionResolver.HasModuleAccess(result, Modules.Master).Should().BeTrue();
    }

    [Fact]
    public void Custom_AbsentReport_IsNoAccess()
    {
        var input = new PermissionResolver.UserPermissionInputs(
            RoleId: Roles.Code.Admin,
            HasCustomPermissions: true,
            Modules: [],
            Reports: [ReportTypes.Ar]);

        var result = PermissionResolver.Resolve(input);

        PermissionResolver.CanViewReport(result, ReportTypes.Ar).Should().BeTrue();
        PermissionResolver.CanViewReport(result, ReportTypes.Sales).Should().BeFalse();
    }

    [Fact]
    public void Custom_UnknownReportType_IsFiltered()
    {
        var input = new PermissionResolver.UserPermissionInputs(
            RoleId: Roles.Code.Admin,
            HasCustomPermissions: true,
            Modules: [],
            Reports: ["bogus", ReportTypes.Sales]);

        var result = PermissionResolver.Resolve(input);

        result.Reports.Should().BeEquivalentTo([ReportTypes.Sales]);
    }

    [Fact]
    public void Sales_WithoutCustom_GetsMinimalSalesOnly()
    {
        // PRD §6.1 step 4: base-role fallback.
        var input = new PermissionResolver.UserPermissionInputs(
            RoleId: Roles.Code.Sales,
            HasCustomPermissions: false,
            Modules: [],
            Reports: []);

        var result = PermissionResolver.Resolve(input);

        result.IsDeveloper.Should().BeFalse();
        result.Modules.Should().HaveCount(1);
        result.Modules[Modules.Sales].CanEdit.Should().BeTrue();
        result.Modules[Modules.Sales].CanDelete.Should().BeFalse();
        result.Reports.Should().BeEmpty();
    }

    [Fact]
    public void Admin_WithoutCustom_FallsBackToSalesMinimum()
    {
        // PRD §2.1: Admin is a placeholder with no built-in permissions.
        var input = new PermissionResolver.UserPermissionInputs(
            RoleId: Roles.Code.Admin,
            HasCustomPermissions: false,
            Modules: [],
            Reports: []);

        var result = PermissionResolver.Resolve(input);

        result.Modules.Should().ContainKey(Modules.Sales);
        result.Modules.Should().NotContainKey(Modules.Master);
    }

    [Theory]
    [InlineData(Roles.Code.Sales,      "yane",   "[(sales,T,T)]",                     "")]
    [InlineData(Roles.Code.Admin,      "didi",   "[(master,T,F)|(purchase,T,T)|(sales,T,T)]", "ar")]
    [InlineData(Roles.Code.Admin,      "alvin",  "[(master,T,F)|(ar,T,T)]",            "ar,sales,inventory,purchase")]
    [InlineData(Roles.Code.Sales,      "ilham",  "[]",                                 "ar")]
    public void NamedDemoUser_MatchesPrdMatrix(short roleId, string _,
        string moduleSpec, string reportSpec)
    {
        var modules = ParseModules(moduleSpec);
        var reports = string.IsNullOrEmpty(reportSpec) ? [] : reportSpec.Split(',');

        var result = PermissionResolver.Resolve(new PermissionResolver.UserPermissionInputs(
            RoleId: roleId, HasCustomPermissions: true, Modules: modules, Reports: reports));

        result.IsDeveloper.Should().BeFalse();
        result.Modules.Count.Should().Be(modules.Count);
        result.Reports.Should().BeEquivalentTo(reports);
    }

    private static List<PermissionResolver.UserModulePermissionRow> ParseModules(string spec)
    {
        if (spec == "[]") return [];
        // "[(name,T,F)|(name,T,T)]"
        var inner = spec.Trim('[', ']');
        return [.. inner.Split('|', StringSplitOptions.RemoveEmptyEntries)
            .Select(s =>
            {
                var parts = s.Trim('(', ')').Split(',');
                return new PermissionResolver.UserModulePermissionRow(
                    parts[0],
                    parts[1] == "T",
                    parts[2] == "T");
            })];
    }

    [Fact]
    public void HasModuleAccess_CanEdit_CanDelete_HelperMethods()
    {
        var perms = PermissionResolver.Resolve(new PermissionResolver.UserPermissionInputs(
            RoleId: Roles.Code.Admin,
            HasCustomPermissions: true,
            Modules: [new(Modules.Master, CanEdit: true, CanDelete: false)],
            Reports: []));

        PermissionResolver.HasModuleAccess(perms, Modules.Master).Should().BeTrue();
        PermissionResolver.CanEdit(perms, Modules.Master).Should().BeTrue();
        PermissionResolver.CanDelete(perms, Modules.Master).Should().BeFalse();

        PermissionResolver.HasModuleAccess(perms, Modules.Inventory).Should().BeFalse();
        PermissionResolver.CanEdit(perms, Modules.Inventory).Should().BeFalse();
        PermissionResolver.CanDelete(perms, Modules.Inventory).Should().BeFalse();
    }
}
