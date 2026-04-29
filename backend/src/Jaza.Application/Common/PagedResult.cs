namespace Jaza.Application.Common;

public sealed record PagedRequest(int Page = 1, int PageSize = 20, string? Search = null, string? Sort = null)
{
    public const int DefaultPageSize = 20;

    /// <summary>
    /// Hard cap so list endpoints never return huge JSON payloads (slow or mobile links).
    /// </summary>
    public const int MaxPageSize = 50;

    /// <summary>
    /// Coerce page/pageSize to safe values. Call this at the start of every paged query.
    /// </summary>
    public PagedRequest Normalized()
    {
        var page = Page < 1 ? 1 : Page;
        var size = PageSize < 1 ? DefaultPageSize : PageSize;
        if (size > MaxPageSize)
            size = MaxPageSize;
        return this with { Page = page, PageSize = size };
    }
}

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
