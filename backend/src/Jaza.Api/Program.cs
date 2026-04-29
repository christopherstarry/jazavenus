using System.Threading.RateLimiting;
using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Infrastructure;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, services, cfg) =>
    cfg.ReadFrom.Configuration(ctx.Configuration).ReadFrom.Services(services));

// Forwarded headers when behind Cloudflare/Caddy.
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownIPNetworks.Clear();
    o.KnownProxies.Clear();
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddValidatorsFromAssemblyContaining<Jaza.Application.Auth.LoginValidator>();

var cookieCfg = builder.Configuration.GetSection("Cookie");
builder.Services.ConfigureApplicationCookie(opt =>
{
    opt.Cookie.Name = cookieCfg["Name"] ?? "jaza.auth";
    opt.Cookie.HttpOnly = true;
    opt.Cookie.SameSite = SameSiteMode.Strict;
    opt.Cookie.SecurePolicy = Enum.TryParse<CookieSecurePolicy>(cookieCfg["SecurePolicy"], out var p) ? p : CookieSecurePolicy.Always;
    opt.SlidingExpiration = true;
    opt.ExpireTimeSpan = TimeSpan.FromMinutes(int.Parse(cookieCfg["SlidingExpirationMinutes"] ?? "60"));
    opt.Events.OnRedirectToLogin = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    opt.Events.OnRedirectToAccessDenied = ctx =>
    {
        ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

builder.Services.AddAuthorization(o =>
{
    o.AddPolicy(Policies.RequireSuperAdmin, p => p.RequireRole(Roles.SuperAdmin));
    o.AddPolicy(Policies.RequireAdmin, p => p.RequireRole(Roles.SuperAdmin, Roles.Admin));
    o.AddPolicy(Policies.RequireOperator, p => p.RequireRole(Roles.SuperAdmin, Roles.Admin, Roles.Operator));
    o.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
});

builder.Services.AddAntiforgery(o =>
{
    o.HeaderName = "X-XSRF-TOKEN";
    o.Cookie.Name = "jaza.xsrf";
    o.Cookie.HttpOnly = false;
    o.Cookie.SameSite = SameSiteMode.Strict;
    o.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
{
    var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
    p.WithOrigins(origins).AllowCredentials().AllowAnyHeader().AllowAnyMethod()
     .WithExposedHeaders("X-XSRF-TOKEN");
}));

var rateCfg = builder.Configuration.GetSection("RateLimit");
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = int.Parse(rateCfg["GlobalPermitsPerMinute"] ?? "240"),
                Window = TimeSpan.FromMinutes(1),
            }));
    o.AddPolicy("login", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = int.Parse(rateCfg["LoginPermitsPerMinute"] ?? "5"),
                Window = TimeSpan.FromMinutes(1),
            }));
});

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// AddControllersWithViews (not plain AddControllers) registers Microsoft.AspNetCore.Mvc.ViewFeatures
// services, which AutoValidateAntiforgeryTokenAttribute internally depends on. We don't render any
// Razor views — this is purely to keep the antiforgery filter wired up on a pure-API project.
builder.Services.AddControllersWithViews(o =>
{
    o.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
});

builder.Services.AddOpenApi();

builder.Services.AddHealthChecks()
    .AddSqlServer(builder.Configuration.GetConnectionString("Default")!, name: "sql");

builder.Services.Configure<ApiBehaviorOptions>(o => o.SuppressModelStateInvalidFilter = true);

var app = builder.Build();

app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseJazaSecurityHeaders();
app.UseRouting();
app.UseRateLimiter();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

await DbInitializer.InitializeAsync(app.Services);

app.Run();

public partial class Program;
