using Jaza.Application.Reports;

namespace Jaza.Api.Controllers;

public sealed record ReportQueryParams(
    DateTime? From,
    DateTime? To,
    string? Division,
    Guid? CustomerId,
    Guid? SupplierId,
    Guid? ItemId,
    Guid? WarehouseId,
    int Page = 1,
    int PageSize = 50)
{
    public ReportQueryRequest ToRequest(string reportKey) => new(
        reportKey, Division, From, To, CustomerId, SupplierId, ItemId, WarehouseId, Page, PageSize);
}
