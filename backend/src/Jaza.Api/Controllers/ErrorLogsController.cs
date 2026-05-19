using Jaza.Application.Common;
using Jaza.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.RequireDeveloper)]
[Route("api/error-logs")]
public sealed class ErrorLogsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ErrorLogDto>>> List(
        [FromQuery] string? exceptionType,
        [FromQuery] int? minStatusCode,
        [FromQuery] int? maxStatusCode,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var paged = new PagedRequest(page, pageSize).Normalized();
        var q = db.ErrorLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(exceptionType))
            q = q.Where(e => e.ExceptionType != null && e.ExceptionType.Contains(exceptionType));
        if (minStatusCode.HasValue)
            q = q.Where(e => e.StatusCode >= minStatusCode.Value);
        if (maxStatusCode.HasValue)
            q = q.Where(e => e.StatusCode < maxStatusCode.Value);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(e =>
                e.Message.Contains(search) ||
                (e.UserName != null && e.UserName.Contains(search)) ||
                (e.RequestPath != null && e.RequestPath.Contains(search)));

        var total = await q.CountAsync();

        var items = await q
            .OrderByDescending(e => e.OccurredAtUtc)
            .Skip((paged.Page - 1) * paged.PageSize)
            .Take(paged.PageSize)
            .Select(e => new ErrorLogDto(
                e.Id,
                e.OccurredAtUtc,
                e.Message,
                e.ExceptionType,
                e.StatusCode,
                e.RequestPath,
                e.RequestMethod,
                e.UserId,
                e.UserName,
                e.IpAddress,
                e.UserAgent,
                e.StackTrace))
            .ToListAsync();

        return new PagedResult<ErrorLogDto>(items, total, paged.Page, paged.PageSize);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ErrorLogDto>> Get(Guid id)
    {
        var log = await db.ErrorLogs.AsNoTracking()
            .Select(e => new ErrorLogDto(
                e.Id, e.OccurredAtUtc, e.Message, e.ExceptionType,
                e.StatusCode, e.RequestPath, e.RequestMethod, e.UserId,
                e.UserName, e.IpAddress, e.UserAgent, e.StackTrace))
            .FirstOrDefaultAsync(e => e.Id == id);

        if (log is null) return NotFound();
        return log;
    }
}

public sealed record ErrorLogDto(
    Guid Id,
    DateTime OccurredAtUtc,
    string Message,
    string? ExceptionType,
    int StatusCode,
    string? RequestPath,
    string? RequestMethod,
    string? UserId,
    string? UserName,
    string? IpAddress,
    string? UserAgent,
    string? StackTrace);
