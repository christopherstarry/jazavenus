using System.Reflection;
using System.Threading.RateLimiting;
using FluentValidation;
using Jaza.Api.OpenApi;
using Jaza.Api.Security;
using Jaza.Application.Auth;
using Jaza.Application.Common;
using Jaza.Infrastructure;
using Jaza.Infrastructure.Auth;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, services, cfg) =>
    cfg.ReadFrom.Configuration(ctx.Configuration).ReadFrom.Services(services));

// Forwarded headers when behind Cloudflare/Caddy/Fly.io.
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownIPNetworks.Clear();
    o.KnownProxies.Clear();
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddValidatorsFromAssemblyContaining<LoginValidator>();

// ─── Auth: ASP.NET Identity application cookie (SPA) + JWT bearer (mobile / external) ────────
//
// We keep using Identity's built-in "Identity.Application" cookie because SignInManager.SignInAsync
// writes to that scheme. ConfigureApplicationCookie below tightens its defaults to match PRD §7
// (HttpOnly, Strict SameSite, 24h fixed expiry).
var cookieCfg = builder.Configuration.GetSection("Cookie");
builder.Services
    .AddAuthentication(options =>
    {
        // The Identity cookie is the default for the SPA. Bearer is opt-in per controller.
        options.DefaultScheme = IdentityConstants.ApplicationScheme;
    })
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, opts =>
    {
        opts.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        opts.SaveToken = false;
        opts.TokenValidationParameters = JwtAccessTokenIssuer.BuildValidationParameters(builder.Configuration);
    });

builder.Services.ConfigureApplicationCookie(opt =>
{
    opt.Cookie.Name = cookieCfg["Name"] ?? "jaza.auth";
    opt.Cookie.HttpOnly = true;
    opt.Cookie.SameSite = SameSiteMode.Strict;
    opt.Cookie.SecurePolicy = Enum.TryParse<CookieSecurePolicy>(cookieCfg["SecurePolicy"], out var p) ? p : CookieSecurePolicy.Always;

    // 24h fixed lifetime per PRD §7. NOT sliding — when the cookie expires the user must log in.
    opt.SlidingExpiration = false;
    opt.ExpireTimeSpan = TimeSpan.FromHours(int.Parse(cookieCfg["ExpirationHours"] ?? "24"));

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
    // Both schemes are accepted everywhere [Authorize] is applied — the SPA presents the cookie,
    // mobile/external clients present the JWT bearer token. Without specifying schemes here,
    // [Authorize] would only consult the default (cookie) scheme and reject valid bearer tokens.
    var multiScheme = new[] { IdentityConstants.ApplicationScheme, JwtBearerDefaults.AuthenticationScheme };

    o.DefaultPolicy = new AuthorizationPolicyBuilder()
        .AddAuthenticationSchemes(multiScheme)
        .RequireAuthenticatedUser()
        .Build();

    // Developer is the only role allowed to see error logs and developer tooling.
    o.AddPolicy(Policies.RequireDeveloper, p => p
        .AddAuthenticationSchemes(multiScheme)
        .RequireAuthenticatedUser()
        .RequireRole(Roles.Developer));

    // User & permission management — PRD §10.1 (Developer + SuperAdmin only).
    o.AddPolicy(Policies.RequireSuperAdmin, p => p
        .AddAuthenticationSchemes(multiScheme)
        .RequireAuthenticatedUser()
        .RequireRole(Roles.Developer, Roles.SuperAdmin));

    // Includes Admin so legacy controllers don't accidentally widen access.
    o.AddPolicy(Policies.RequireAdmin, p => p
        .AddAuthenticationSchemes(multiScheme)
        .RequireAuthenticatedUser()
        .RequireRole(Roles.Developer, Roles.SuperAdmin, Roles.Admin));

    // Any signed-in active user. Used by legacy module controllers; new endpoints should use
    // PermissionResolver instead via [RequireModule] / [RequireReport] (see RequirePermission filter).
    o.AddPolicy(Policies.RequireOperator, p => p
        .AddAuthenticationSchemes(multiScheme)
        .RequireAuthenticatedUser()
        .RequireRole(Roles.Developer, Roles.SuperAdmin, Roles.Admin, Roles.Sales));

    foreach (var module in Modules.All)
    {
        o.AddPolicy($"Module:{module}", p => p
            .AddAuthenticationSchemes(multiScheme)
            .RequireAuthenticatedUser()
            .AddRequirements(new ModulePermissionRequirement(module)));
    }

    foreach (var report in ReportTypes.All)
    {
        o.AddPolicy($"Report:{report}", p => p
            .AddAuthenticationSchemes(multiScheme)
            .RequireAuthenticatedUser()
            .AddRequirements(new ReportPermissionRequirement(report)));
    }

    o.FallbackPolicy = o.DefaultPolicy;
});

builder.Services.AddScoped<IAuthorizationHandler, ModulePermissionHandler>();
builder.Services.AddScoped<IAuthorizationHandler, ReportPermissionHandler>();

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
    // PRD §7: login limit 10 req/min/IP. Refresh limit 30 req/min/user.
    o.AddPolicy("login", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = int.Parse(rateCfg["LoginPermitsPerMinute"] ?? "10"),
                Window = TimeSpan.FromMinutes(1),
            }));
    o.AddPolicy("refresh", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ctx.User.Identity?.Name ?? ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = int.Parse(rateCfg["RefreshPermitsPerMinute"] ?? "30"),
                Window = TimeSpan.FromMinutes(1),
            }));
});

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// AddControllersWithViews registers Microsoft.AspNetCore.Mvc.ViewFeatures, which the antiforgery
// filter depends on at runtime. We don't render any Razor views.
//
// We use BearerSafeAntiforgeryFilter (NOT AutoValidateAntiforgeryTokenAttribute) so JWT bearer
// clients (mobile / external) don't have to play the cookie+XSRF double-submit game. SPA
// (cookie) clients are still protected.
builder.Services.AddScoped<BearerSafeAntiforgeryFilter>();
builder.Services.AddControllersWithViews(o =>
{
    o.Filters.AddService<BearerSafeAntiforgeryFilter>();
});

// ─── OpenAPI: Scalar (browser) + Swashbuckle Swagger UI ───────────────────────
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Jaza Venus API",
        Version = "v1",
        Description = """
        Warehouse management API. Authentication is dual-mode: the SPA uses an HttpOnly cookie
        plus an antiforgery header (X-XSRF-TOKEN), while mobile or external clients can pass the
        JWT access token returned by /api/auth/login as a `Bearer` header.

        Permission model: see /docs/flow/auth in the repo for a non-tactical overview.
        """,
        Contact = new OpenApiContact { Name = "Jaza IT", Email = "it@jaza.local" },
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT access token (15 min lifetime). Login at /api/auth/login.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
    });
    c.AddSecurityDefinition("Cookie", new OpenApiSecurityScheme
    {
        Description = "HttpOnly cookie session (browser SPA). Mutating requests require X-XSRF-TOKEN header.",
        Name = "jaza.auth",
        In = ParameterLocation.Cookie,
        Type = SecuritySchemeType.ApiKey,
    });
    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = [],
        [new OpenApiSecuritySchemeReference("Cookie", document)] = [],
    });

    c.DocumentFilter<ModuleTagDocumentFilter>();

    var apiXml = Path.Combine(AppContext.BaseDirectory, $"{Assembly.GetExecutingAssembly().GetName().Name}.xml");
    if (File.Exists(apiXml)) c.IncludeXmlComments(apiXml, includeControllerXmlComments: true);
    var appXml = Path.Combine(AppContext.BaseDirectory, "Jaza.Application.xml");
    if (File.Exists(appXml)) c.IncludeXmlComments(appXml);
});

// PostgreSQL health check
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Default")!, name: "postgres");

builder.Services.Configure<ApiBehaviorOptions>(o => o.SuppressModelStateInvalidFilter = true);

var app = builder.Build();

app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseStatusCodePages();

app.MapOpenApi();          // /openapi/v1.json — used by Scalar
app.UseSwagger();          // /swagger/v1/swagger.json
app.UseSwaggerUI(opts =>
{
    opts.SwaggerEndpoint("/swagger/v1/swagger.json", "Jaza Venus API v1");
    opts.RoutePrefix = "swagger";
    opts.DocumentTitle = "Jaza Venus API — Swagger";
});
if (app.Environment.IsDevelopment())
{
    app.MapScalarApiReference();
}
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseJazaSecurityHeaders();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseRateLimiter();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health", new HealthCheckOptions { Predicate = _ => false }).AllowAnonymous();

app.MapFallbackToFile("index.html");

// Wait until app.Start() is called so logging is configured. We also tolerate transient DB failures
// during cold-starts on Fly.io (Neon may take a few seconds to come out of sleep).
await DbInitializer.InitializeAsync(app.Services);

app.Run();

public partial class Program;
