using Jaza.Domain.Common;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Security;

/// <summary>
/// Maps domain/validation/auth exceptions to RFC-7807 ProblemDetails. Hides stack traces in production.
/// </summary>
public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment env)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var (status, title) = ex switch
        {
            DomainException                                 => (StatusCodes.Status400BadRequest, "Business rule violated"),
            FluentValidation.ValidationException            => (StatusCodes.Status400BadRequest, "Validation failed"),
            UnauthorizedAccessException                     => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            KeyNotFoundException                            => (StatusCodes.Status404NotFound, "Not found"),
            DbUpdateConcurrencyException                    => (StatusCodes.Status409Conflict, "Concurrency conflict"),
            _                                               => (StatusCodes.Status500InternalServerError, "Server error")
        };

        if (status >= 500) logger.LogError(ex, "Unhandled exception");
        else logger.LogInformation(ex, "Handled exception {Type}", ex.GetType().Name);

        var pd = new ProblemDetails
        {
            Status = status,
            Title = title,
            Type = $"https://httpstatuses.io/{status}",
            Detail = env.IsDevelopment() ? ex.ToString() : ex.Message,
            Instance = ctx.Request.Path,
        };
        if (ex is FluentValidation.ValidationException ve)
        {
            pd.Extensions["errors"] = ve.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
        }

        ctx.Response.StatusCode = status;
        ctx.Response.ContentType = "application/problem+json";
        await ctx.Response.WriteAsJsonAsync(pd, ct);
        return true;
    }
}
