using Jaza.Application.Common;
using Jaza.Domain.MasterData;
using Jaza.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Jaza.Infrastructure.Persistence;

/// <summary>
/// Applies pending EF migrations and seeds Roles + initial users on first run.
///
/// Two seed paths:
///  1. Production SuperAdmin — credentials read from configuration; if password is absent a strong
///     random one is generated and printed to the log ONCE. Operator must rotate immediately.
///  2. Convenience dev users — only seeded when "Seed:IncludeDevUsers" is true (Development only).
///     These bypass the password policy on purpose so the chosen short password works.
///     Never enable this flag in Production.
/// </summary>
public static class DbInitializer
{
    private sealed record DevSeedUser(string Email, string FullName, string Role, string Password);

    private static readonly DevSeedUser[] DevSeedUsers =
    [
        new("super-admin@super-admin.com", "Super Admin (dev)", Roles.SuperAdmin, "Password123!"),
        new("admin@admin.com",             "Admin (dev)",       Roles.Admin,      "Password123!"),
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

        foreach (var name in Roles.All)
        {
            if (!await roles.RoleExistsAsync(name))
            {
                var r = await roles.CreateAsync(new AppRole(name));
                if (!r.Succeeded)
                    throw new InvalidOperationException("Failed to seed role " + name + ": " + string.Join("; ", r.Errors.Select(e => e.Description)));
            }
        }

        await SeedProductionSuperAdminAsync(users, config, logger);

        if (config.GetValue("Seed:IncludeDevUsers", defaultValue: false))
        {
            foreach (var u in DevSeedUsers)
            {
                await SeedDevUserAsync(users, u, logger);
            }
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

    private static async Task SeedProductionSuperAdminAsync(
        UserManager<AppUser> users, IConfiguration config, ILogger logger)
    {
        var seedEmail = config["Seed:SuperAdminEmail"] ?? "superadmin@jaza.local";
        var seedPwd = config["Seed:SuperAdminPassword"];
        if (await users.FindByEmailAsync(seedEmail) is not null) return;

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
            MustChangePassword = true,
        };
        var create = await users.CreateAsync(user, seedPwd!);
        if (!create.Succeeded)
            throw new InvalidOperationException("Failed to seed SuperAdmin: " + string.Join("; ", create.Errors.Select(e => e.Description)));

        await users.AddToRoleAsync(user, Roles.SuperAdmin);
        logger.LogWarning("Seeded SuperAdmin: {Email}", seedEmail);
        if (generated)
        {
            logger.LogWarning("Generated initial SuperAdmin password (rotate immediately): {Password}", seedPwd);
        }
    }

    /// <summary>
    /// Seed a convenience dev user. We pre-hash the password and call CreateAsync(user)
    /// without the password overload so the password validators are never invoked. The chosen
    /// password still has to be remembered by the developer; the policy still applies to any
    /// password change made through the UI.
    /// </summary>
    private static async Task SeedDevUserAsync(UserManager<AppUser> users, DevSeedUser seed, ILogger logger)
    {
        if (await users.FindByEmailAsync(seed.Email) is not null) return;

        var user = new AppUser
        {
            UserName = seed.Email,
            Email = seed.Email,
            EmailConfirmed = true,
            FullName = seed.FullName,
            MustChangePassword = false,
        };

        user.PasswordHash = users.PasswordHasher.HashPassword(user, seed.Password);

        var create = await users.CreateAsync(user);
        if (!create.Succeeded)
            throw new InvalidOperationException("Failed to seed dev user " + seed.Email + ": " + string.Join("; ", create.Errors.Select(e => e.Description)));

        var addRole = await users.AddToRoleAsync(user, seed.Role);
        if (!addRole.Succeeded)
            throw new InvalidOperationException("Failed to assign role to dev user " + seed.Email + ": " + string.Join("; ", addRole.Errors.Select(e => e.Description)));

        logger.LogWarning(
            "Seeded DEV user {Email} with role {Role}. This account is for local testing only — disable Seed:IncludeDevUsers in non-dev environments.",
            seed.Email, seed.Role);
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
