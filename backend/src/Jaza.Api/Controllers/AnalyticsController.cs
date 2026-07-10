using Jaza.Api.Security;
using Jaza.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers;

/// <summary>Analytics endpoints (penetration tracking, etc.).</summary>
[ApiController]
[Tags("Analytics")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Sales)]
[Route("api/analytics")]
public sealed class AnalyticsController : ControllerBase
{
    public sealed record PenetrationRow(Guid CustomerId, string CustomerCode, string CustomerName, int OutletCount, decimal PenetrationPercent);

    /// <summary>Customer penetration metrics (legacy frmPenetration). Returns empty until ETL seeds penetration data.</summary>
    [HttpGet("penetration")]
    public ActionResult<IReadOnlyList<PenetrationRow>> Penetration(
        [FromQuery] string? division,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to) =>
        Ok(Array.Empty<PenetrationRow>());
}
