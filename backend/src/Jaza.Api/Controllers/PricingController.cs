using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Pricing;
using Jaza.Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers;

[ApiController]
[Tags("Pricing")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Sales)]
[Route("api/pricing")]
public sealed class PricingController(IPricingService pricing) : ControllerBase
{
    [HttpGet("resolve")]
    public async Task<ActionResult<PricingResult>> Resolve(
        [FromQuery] Guid customerId, [FromQuery] Guid itemId,
        [FromQuery] decimal quantity = 1, [FromQuery] DateTime? asOf = null,
        CancellationToken ct = default)
    {
        if (customerId == Guid.Empty || itemId == Guid.Empty)
            throw new DomainException("customerId and itemId are required.");
        if (quantity <= 0) throw new DomainException("quantity must be positive.");

        var result = await pricing.ResolveAsync(customerId, itemId, quantity, asOf ?? DateTime.UtcNow, ct);
        return result;
    }
}
