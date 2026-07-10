using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Processes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers;

[ApiController]
[Tags("System")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Master)]
[Route("api/system")]
public sealed class SystemController : ControllerBase
{
    [HttpPost("monthly-process")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public ActionResult<SystemStubResult> MonthlyProcess() =>
        Stub("monthly-process", "Monthly process stub — not implemented.");

    [HttpPost("day-end")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public ActionResult<SystemStubResult> DayEnd() =>
        Stub("day-end", "Day-end process stub — not implemented.");

    [HttpPost("delete-cancelled-document")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public ActionResult<SystemStubResult> DeleteCancelledDocument() =>
        Stub("delete-cancelled-document", "Delete cancelled document stub — not implemented.");

    [HttpPost("backup")]
    [Authorize(Policy = Policies.RequireSuperAdmin)]
    public ActionResult<SystemStubResult> Backup() =>
        Stub("backup", "Backup stub — not implemented.");

    [HttpPost("restore")]
    [Authorize(Policy = Policies.RequireSuperAdmin)]
    public ActionResult<SystemStubResult> Restore() =>
        Stub("restore", "Restore stub — not implemented.");

    private static SystemStubResult Stub(string operation, string message) =>
        new(operation, "NotImplemented", message);
}
