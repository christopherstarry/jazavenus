using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers.Reports;

[ApiController]
[Tags("SalesReports")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireReport(ReportTypes.Sales)]
[Route("api/reports/sales")]
public sealed class SalesReportsController(IReportQueryService reports) : ControllerBase
{
    [HttpGet("{reportKey}")]
    public Task<ReportQueryResult> Get(string reportKey, [FromQuery] ReportQueryParams p, CancellationToken ct) =>
        reports.ExecuteAsync(p.ToRequest($"{ReportTypes.Sales}:{reportKey}"), ct);
}
