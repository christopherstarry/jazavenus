// Startup seeding uses standard ILogger extension methods; LoggerMessage source generators are overkill here.
#pragma warning disable CA1848 // Use LoggerMessage delegates for high-performance logging
#pragma warning disable CA1873 // Avoid expensive interpolated strings when logging is disabled
using Jaza.Application.Common;
using Jaza.Domain.Auth;
using Jaza.Domain.MasterData;
using Jaza.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Jaza.Infrastructure.Persistence;

/// <summary>
/// Applies pending EF migrations and seeds the auth catalog on first run.
///
/// Always seeded:
///   • The 4 PRD roles (Sales / Admin / SuperAdmin / Developer) in the Identity Roles table.
///
/// Seeded conditionally:
///   • Production SuperAdmin from <c>Seed:SuperAdminEmail</c> + optional password (auto-generated
///     and printed to the log if absent — operator MUST rotate immediately).
///   • Optional Developer account from <c>Seed:DeveloperEmail</c>.
///   • The 8 named demo users from <c>docs/prds/auth/user-role.md §9</c>, only when
///     <c>Seed:IncludeDemoUsers = true</c>. Disable this flag in Production.
/// </summary>
public static class DbInitializer
{
    private sealed record DemoUser(
        string Email,
        string FullName,
        short RoleId,
        IReadOnlyList<DemoModulePerm> Modules,
        IReadOnlyList<string> Reports);

    private sealed record DemoModulePerm(string Module, bool CanEdit, bool CanDelete);

    /// <summary>The 8 named users from PRD §9. ALL have has_custom_permissions = true.</summary>
    private static readonly DemoUser[] DemoUsers =
    [
        new("didi@jaza.local",   "Didi",   Roles.Code.Admin,
            [
                new(Modules.Master,   CanEdit: true,  CanDelete: false),
                new(Modules.Purchase, CanEdit: true,  CanDelete: true),
                new(Modules.Sales,    CanEdit: true,  CanDelete: true),
            ],
            [ReportTypes.Ar]),

        new("pai@jaza.local",    "Pai",    Roles.Code.Admin,
            [
                new(Modules.Master,    CanEdit: true,  CanDelete: false),
                new(Modules.Purchase,  CanEdit: true,  CanDelete: true),
                new(Modules.Inventory, CanEdit: true,  CanDelete: true),
            ],
            [ReportTypes.Inventory]),

        new("nenden@jaza.local", "Nenden", Roles.Code.Admin,
            [
                new(Modules.Master,   CanEdit: true,  CanDelete: false),
                new(Modules.Purchase, CanEdit: true,  CanDelete: true),
            ],
            [ReportTypes.Ar, ReportTypes.Sales, ReportTypes.Inventory, ReportTypes.Purchase]),

        new("atep@jaza.local",   "Atep",   Roles.Code.Admin,
            [
                new(Modules.Master, CanEdit: true,  CanDelete: false),
                new(Modules.Sales,  CanEdit: true,  CanDelete: true),
            ],
            [ReportTypes.Ar]),

        new("yane@jaza.local",   "Yane",   Roles.Code.Sales,
            [
                new(Modules.Sales,  CanEdit: true,  CanDelete: true),
            ],
            []),

        new("ilham@jaza.local",  "Ilham",  Roles.Code.Sales,
            [],
            [ReportTypes.Ar]),

        new("robby@jaza.local",  "Robby",  Roles.Code.Sales,
            [],
            [ReportTypes.Ar, ReportTypes.Sales]),

        new("alvin@jaza.local",  "Alvin",  Roles.Code.Admin,
            [
                new(Modules.Master, CanEdit: true,  CanDelete: false),
                new(Modules.Ar,     CanEdit: true,  CanDelete: true),
            ],
            [ReportTypes.Ar, ReportTypes.Sales, ReportTypes.Inventory, ReportTypes.Purchase]),
    ];

    public static async Task InitializeAsync(IServiceProvider services, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var logger = sp.GetRequiredService<ILogger<AppDbContext>>();
        var db = sp.GetRequiredService<AppDbContext>();
        var roles = sp.GetRequiredService<RoleManager<AppRole>>();
        var users = sp.GetRequiredService<UserManager<AppUser>>();
        var config = sp.GetRequiredService<IConfiguration>();

        logger.LogInformation("Applying database migrations...");
        await db.Database.MigrateAsync(ct);

        await SeedRolesAsync(roles);
        await SeedSuperAdminAsync(users, config, logger);
        await SeedDeveloperAsync(users, config, logger);

        if (config.GetValue("Seed:IncludeDemoUsers", defaultValue: false))
        {
            await SeedDemoUsersAsync(users, db, logger);
        }

        if (!await db.Units.AnyAsync(ct))
        {
            db.Units.AddRange(
                new Unit { Code = "PCS", Name = "Pieces" },
                new Unit { Code = "BOX", Name = "Box" },
                new Unit { Code = "KG",  Name = "Kilogram" },
                new Unit { Code = "L",   Name = "Litre" });
            await db.SaveChangesAsync(ct);
        }
    }

    private static async Task SeedRolesAsync(RoleManager<AppRole> roles)
    {
        foreach (var (_, name) in Roles.All)
        {
            if (!await roles.RoleExistsAsync(name))
            {
                var r = await roles.CreateAsync(new AppRole(name));
                if (!r.Succeeded)
                    throw new InvalidOperationException(
                        $"Failed to seed role {name}: " + string.Join("; ", r.Errors.Select(e => e.Description)));
            }
        }
    }

    private static async Task SeedSuperAdminAsync(
        UserManager<AppUser> users, IConfiguration config, ILogger logger)
    {
        var seedEmail = config["Seed:SuperAdminEmail"] ?? "superadmin@jaza.local";
        var seedPwd = config["Seed:SuperAdminPassword"];

        var existing = await users.FindByEmailAsync(seedEmail);
        if (existing is not null)
        {
            // User exists — if an explicit password is configured, sync it so redeploys don't lock out.
            if (!string.IsNullOrWhiteSpace(seedPwd))
            {
                var token = await users.GeneratePasswordResetTokenAsync(existing);
                var reset = await users.ResetPasswordAsync(existing, token, seedPwd);
                if (reset.Succeeded)
                    logger.LogWarning("Synced SuperAdmin password from config (existing user)");
                else
                    logger.LogError("Failed to sync SuperAdmin password: {Errors}",
                        string.Join("; ", reset.Errors.Select(e => e.Description)));
            }
            return;
        }

        var generated = false;
        if (string.IsNullOrWhiteSpace(seedPwd))
        {
            seedPwd = GenerateStrongPassword();
            generated = true;
        }

        var user = new AppUser
        {
            UserName = seedEmail,
            Email = seedEmail,
            EmailConfirmed = true,
            FullName = "Super Admin",
            RoleId = Roles.Code.SuperAdmin,
            HasCustomPermissions = false,
            IsActive = true,
            MustChangePassword = generated,
        };
        var create = await users.CreateAsync(user, seedPwd!);
        if (!create.Succeeded)
            throw new InvalidOperationException(
                "Failed to seed SuperAdmin: " + string.Join("; ", create.Errors.Select(e => e.Description)));

        await users.AddToRoleAsync(user, Roles.SuperAdmin);
        logger.LogWarning("Seeded SuperAdmin email={Email}", seedEmail);
        if (generated)
            logger.LogWarning("Generated initial SuperAdmin password (rotate immediately): {Password}", seedPwd);
    }

    private static async Task SeedDeveloperAsync(
        UserManager<AppUser> users, IConfiguration config, ILogger logger)
    {
        var seedEmail = config["Seed:DeveloperEmail"];
        if (string.IsNullOrWhiteSpace(seedEmail)) return;

        var seedPwd = config["Seed:DeveloperPassword"];

        var existing = await users.FindByEmailAsync(seedEmail);
        if (existing is not null)
        {
            // User exists — if an explicit password is configured, sync it.
            if (!string.IsNullOrWhiteSpace(seedPwd))
            {
                var token = await users.GeneratePasswordResetTokenAsync(existing);
                var reset = await users.ResetPasswordAsync(existing, token, seedPwd);
                if (reset.Succeeded)
                    logger.LogWarning("Synced Developer password from config (existing user)");
                else
                    logger.LogError("Failed to sync Developer password: {Errors}",
                        string.Join("; ", reset.Errors.Select(e => e.Description)));
            }
            return;
        }

        var generated = false;
        if (string.IsNullOrWhiteSpace(seedPwd))
        {
            seedPwd = GenerateStrongPassword();
            generated = true;
        }

        var user = new AppUser
        {
            UserName = seedEmail,
            Email = seedEmail,
            EmailConfirmed = true,
            FullName = "Developer",
            RoleId = Roles.Code.Developer,
            HasCustomPermissions = false,
            IsActive = true,
            MustChangePassword = generated,
        };
        var create = await users.CreateAsync(user, seedPwd!);
        if (!create.Succeeded)
            throw new InvalidOperationException(
                "Failed to seed Developer: " + string.Join("; ", create.Errors.Select(e => e.Description)));
        await users.AddToRoleAsync(user, Roles.Developer);
        logger.LogWarning("Seeded Developer email={Email}", seedEmail);
        if (generated)
            logger.LogWarning("Generated initial Developer password (rotate immediately): {Password}", seedPwd);
    }

    /// <summary>
    /// Insert the 8 named users from the PRD with custom permissions. Each gets the temporary
    /// password "Password123!" (developer convenience only; never enable Seed:IncludeDemoUsers in prod).
    /// </summary>
    private static async Task SeedDemoUsersAsync(
        UserManager<AppUser> users, AppDbContext db, ILogger logger)
    {
        const string demoPassword = "Password123!";

        foreach (var demo in DemoUsers)
        {
            if (await users.FindByEmailAsync(demo.Email) is not null) continue;

            var user = new AppUser
            {
                UserName = demo.Email,
                Email = demo.Email,
                EmailConfirmed = true,
                FullName = demo.FullName,
                RoleId = demo.RoleId,
                HasCustomPermissions = true,
                IsActive = true,
                MustChangePassword = false,
            };

            // CreateAsync overload without a password skips the password validators. We then set the
            // hash manually with the configured hasher so the chosen demo password is acceptable
            // even though the demo password violates the strict policy enforced for real users.
            user.PasswordHash = users.PasswordHasher.HashPassword(user, demoPassword);
            var r = await users.CreateAsync(user);
            if (!r.Succeeded)
                throw new InvalidOperationException(
                    $"Failed to seed demo user {demo.Email}: " + string.Join("; ", r.Errors.Select(e => e.Description)));

            var roleName = Roles.NameFromId(demo.RoleId);
            await users.AddToRoleAsync(user, roleName);

            foreach (var m in demo.Modules)
                db.UserModulePermissions.Add(new UserModulePermission
                {
                    UserId = user.Id,
                    Module = m.Module,
                    CanEdit = m.CanEdit,
                    CanDelete = m.CanDelete,
                });
            foreach (var rep in demo.Reports)
                db.UserReportPermissions.Add(new UserReportPermission
                {
                    UserId = user.Id,
                    ReportType = rep,
                });

            await db.SaveChangesAsync();
            logger.LogInformation("Seeded demo user {Email} ({Role})", demo.Email, roleName);
        }
    }

    private static string GenerateStrongPassword()
    {
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower = "abcdefghjkmnpqrstuvwxyz";
        const string digit = "23456789";
        const string sym   = "!@#$%^&*-_=+";
        var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        var chars = new char[20];
        var pools = new[] { upper, lower, digit, sym };
        for (var i = 0; i < 4; i++) chars[i] = PickOne(pools[i], rng);
        var all = upper + lower + digit + sym;
        for (var i = 4; i < chars.Length; i++) chars[i] = PickOne(all, rng);
        Shuffle(chars, rng);
        return new string(chars);
    }

    private static char PickOne(string pool, System.Security.Cryptography.RandomNumberGenerator rng)
    {
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        var i = (int)(BitConverter.ToUInt32(bytes, 0) % (uint)pool.Length);
        return pool[i];
    }

    private static void Shuffle(char[] arr, System.Security.Cryptography.RandomNumberGenerator rng)
    {
        for (var i = arr.Length - 1; i > 0; i--)
        {
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            var j = (int)(BitConverter.ToUInt32(bytes, 0) % (uint)(i + 1));
            (arr[i], arr[j]) = (arr[j], arr[i]);
        }
    }
}
