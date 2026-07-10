using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Ar;
using Jaza.Application.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers;

/// <summary>Batch payment receipts and invoice allocations.</summary>
[ApiController]
[Tags("AR")]
[ProducesResponseType(typeof(ProblemDetails), 400)]
[ProducesResponseType(typeof(ProblemDetails), 401)]
[ProducesResponseType(typeof(ProblemDetails), 403)]
[ProducesResponseType(typeof(ProblemDetails), 404)]
[ProducesResponseType(typeof(ProblemDetails), 409)]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Ar)]
[Route("api/ar/payments")]
public sealed class ArPaymentsController(
    IDivisionScopeService division,
    IPaymentReceiptService payments,
    IValidator<BatchPaymentDto> val) : ControllerBase
{
    /// <summary>Posts a batch payment and allocates amounts across open invoices.</summary>
    [HttpPost]
    public async Task<ActionResult<BatchPaymentResult>> CreateBatch([FromBody] BatchPaymentDto dto, CancellationToken ct)
    {
        await val.ValidateAndThrowAsync(dto, ct);
        var div = division.RequireDivisionForWrite();
        var request = new BatchPaymentRequest(
            div, dto.CustomerId, dto.ReceivedAt, dto.Method, dto.Currency,
            dto.Reference, dto.Notes,
            dto.Allocations.Select(a => new PaymentAllocationInput(a.InvoiceId, a.Amount, a.Notes)).ToList());
        var result = await payments.CreateBatchAsync(request, ct);
        return result;
    }
}
