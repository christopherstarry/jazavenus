using Jaza.Api.Security;
using Jaza.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers.Consignments;

/// <summary>Consignment stock module (legacy frmConsignment). Schema TBD â€” stub for API parity.</summary>
[ApiController]
[Tags("Outbound")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Sales)]
[Route("api/outbound/consignments")]
public sealed class ConsignmentsController : ControllerBase
{
    [HttpGet]
    public ActionResult<PagedResult<object>> List([FromQuery] PagedRequest q) =>
        Ok(new PagedResult<object>([], 0, q.Page, q.PageSize));
}
