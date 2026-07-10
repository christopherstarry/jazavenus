namespace Jaza.Application.Reports;

public sealed record ReportQueryRequest(
    string ReportKey,
    string? Division,
    DateTime? From,
    DateTime? To,
    Guid? CustomerId,
    Guid? SupplierId,
    Guid? ItemId,
    Guid? WarehouseId,
    int Page = 1,
    int PageSize = 50);

public sealed record ReportRow(IReadOnlyDictionary<string, object?> Columns);

public sealed record ReportQueryResult(
    string ReportKey,
    IReadOnlyList<ReportRow> Rows,
    int TotalCount,
    int Page,
    int PageSize);

public interface IReportQueryService
{
    IReadOnlyList<string> AvailableReports { get; }
    Task<ReportQueryResult> ExecuteAsync(ReportQueryRequest request, CancellationToken ct = default);
}
