namespace Jaza.Application.Lookup;

public sealed record LookupItem(Guid? Id, string Code, string Name, string? Extra);

public sealed record LookupResult(string Type, IReadOnlyList<LookupItem> Items, int TotalCount);

public interface ILookupService
{
    IReadOnlyList<string> SupportedTypes { get; }
    Task<LookupResult> SearchAsync(string type, string? search, string? division, int page, int pageSize,
        CancellationToken ct = default);
}
