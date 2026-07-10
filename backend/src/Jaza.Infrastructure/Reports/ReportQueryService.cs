using Jaza.Application.Common;
using Jaza.Application.Reports;
using Jaza.Domain.Common;
using Jaza.Infrastructure.Persistence;

namespace Jaza.Infrastructure.Reports;

public sealed partial class ReportQueryService(
    AppDbContext db,
    IDivisionScopeService divisionScope) : IReportQueryService
{
    public IReadOnlyList<string> AvailableReports => ReportCatalog.All;

    public async Task<ReportQueryResult> ExecuteAsync(ReportQueryRequest request, CancellationToken ct = default)
    {
        if (!ReportCatalog.TryParse(request.ReportKey, out var domain, out var localKey))
            throw new DomainException($"Invalid report key format: {request.ReportKey}");

        var ctx = new ReportQueryContext(db, divisionScope, request);

        return (domain, localKey) switch
        {
            (ReportCatalog.Sales, _) => await ExecuteSalesAsync(ctx, localKey, ct),
            (ReportCatalog.Inventory, _) => await ExecuteInventoryAsync(ctx, localKey, ct),
            (ReportCatalog.Purchase, _) => await ExecutePurchaseAsync(ctx, localKey, ct),
            (ReportCatalog.Ar, _) => await ExecuteArAsync(ctx, localKey, ct),
            _ => throw new DomainException($"Unknown report domain: {domain}"),
        };
    }
}
