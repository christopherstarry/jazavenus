using Jaza.Application.Auth;
using Jaza.Application.Common;
using Jaza.Application.Stock;
using Jaza.Infrastructure.Auth;
using Jaza.Infrastructure.Identity;
using Jaza.Infrastructure.Persistence;
using Jaza.Infrastructure.Stock;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Jaza.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>((sp, opt) =>
        {
            var cs = config.GetConnectionString("Default")
                ?? throw new InvalidOperationException("ConnectionStrings:Default is required");
            opt.UseNpgsql(cs, npgsql =>
            {
                // Neon (and most managed Postgres) closes idle TCP connections aggressively. Retry
                // a handful of transient failures before surfacing the error to the caller.
                npgsql.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(5), errorCodesToAdd: null);
                npgsql.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
            });
            opt.AddInterceptors(sp.GetRequiredService<AuditSaveChangesInterceptor>());
        });
        services.AddScoped<AuditSaveChangesInterceptor>();

        services.AddIdentity<AppUser, AppRole>(opt =>
        {
            opt.Password.RequireDigit = true;
            opt.Password.RequireLowercase = true;
            opt.Password.RequireUppercase = true;
            opt.Password.RequireNonAlphanumeric = true;
            opt.Password.RequiredLength = 12;
            opt.Password.RequiredUniqueChars = 4;

            opt.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            opt.Lockout.MaxFailedAccessAttempts = 5;
            opt.Lockout.AllowedForNewUsers = true;

            opt.User.RequireUniqueEmail = true;
            opt.SignIn.RequireConfirmedEmail = false;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        services.AddScoped<IDocumentNumberGenerator, DocumentNumberGenerator>();
        services.AddScoped<IStockService, StockService>();
        services.AddSingleton<ITotpService, TotpService>();

        // Auth services
        services.AddSingleton<IAccessTokenIssuer, JwtAccessTokenIssuer>();
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();
        services.AddScoped<IPermissionService, PermissionService>();

        return services;
    }
}
