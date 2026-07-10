using System.Collections.Concurrent;
using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Processes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers.System;

[ApiController]
[Tags("Processes")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Sales)]
[Route("api/processes")]
public sealed class ProcessesController : ControllerBase
{
    private static readonly ConcurrentQueue<ProcessJobDto> Jobs = new();

    [HttpGet]
    public ActionResult<IReadOnlyList<ProcessJobDto>> List() => Jobs.ToList();

    [HttpPost("auto-delivery")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public ActionResult<ProcessJobDto> AutoDelivery([FromBody] ProcessEnqueueRequest? req) =>
        Enqueue(ProcessJobType.AutoDelivery, req?.Notes);

    [HttpPost("auto-invoice")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public ActionResult<ProcessJobDto> AutoInvoice([FromBody] ProcessEnqueueRequest? req) =>
        Enqueue(ProcessJobType.AutoInvoice, req?.Notes);

    [HttpPost("auto-delete")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public ActionResult<ProcessJobDto> AutoDelete([FromBody] ProcessEnqueueRequest? req) =>
        Enqueue(ProcessJobType.AutoDelete, req?.Notes);

    [HttpPost("auto-po-from-so")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public ActionResult<ProcessJobDto> AutoPoFromSo([FromBody] ProcessEnqueueRequest? req) =>
        Enqueue(ProcessJobType.AutoPoFromSo, req?.Notes);

    private static ProcessJobDto Enqueue(ProcessJobType type, string? notes)
    {
        var job = new ProcessJobDto(
            Guid.NewGuid(), type, ProcessJobStatus.Queued,
            DateTime.UtcNow, null, notes ?? "Queued (stub in-memory job queue)");
        Jobs.Enqueue(job);
        return job;
    }
}
