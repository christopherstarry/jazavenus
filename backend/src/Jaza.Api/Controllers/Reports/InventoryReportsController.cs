using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers.Reports;

[ApiController]
[Tags("InventoryReports")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireReport(ReportTypes.Inventory)]
[Route("api/reports/inventory")]
public sealed class InventoryReportsController(IReportQueryService reports) : ControllerBase
{
    [HttpGet("{reportKey}")]
    public Task<ReportQueryResult> Get(string reportKey, [FromQuery] ReportQueryParams p, CancellationToken ct) =>
        reports.ExecuteAsync(p.ToRequest($"{ReportTypes.Inventory}:{reportKey}"), ct);
}
