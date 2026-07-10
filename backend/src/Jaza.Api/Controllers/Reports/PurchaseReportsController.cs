using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers.Reports;

[ApiController]
[Tags("PurchaseReports")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireReport(ReportTypes.Purchase)]
[Route("api/reports/purchase")]
public sealed class PurchaseReportsController(IReportQueryService reports) : ControllerBase
{
    [HttpGet("{reportKey}")]
    public Task<ReportQueryResult> Get(string reportKey, [FromQuery] ReportQueryParams p, CancellationToken ct) =>
        reports.ExecuteAsync(p.ToRequest($"{ReportTypes.Purchase}:{reportKey}"), ct);
}
