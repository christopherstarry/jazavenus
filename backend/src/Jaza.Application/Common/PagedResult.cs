namespace Jaza.Application.Common;

public sealed record PagedRequest(int Page = 1, int PageSize = 20, string? Search = null, string? Sort = null);

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
