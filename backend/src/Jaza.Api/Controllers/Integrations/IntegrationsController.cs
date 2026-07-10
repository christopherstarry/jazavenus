using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Processes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers.Integrations;

[ApiController]
[Tags("Integrations")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Master)]
[Route("api/integrations")]
public sealed class IntegrationsController : ControllerBase
{
    [HttpPost("semblog")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public ActionResult<IntegrationStubResult> Semblog() =>
        Stub("semblog", "Semblog integration is not configured.");

    [HttpPost("clipper")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public ActionResult<IntegrationStubResult> Clipper() =>
        Stub("clipper", "Clipper integration is not configured.");

    [HttpPost("sms-orders")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public ActionResult<IntegrationStubResult> SmsOrders() =>
        Stub("sms-orders", "SMS orders integration is not configured.");

    private static IntegrationStubResult Stub(string name, string message) =>
        new(name, "NotConfigured", message);
}
