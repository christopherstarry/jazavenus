using FluentValidation;
using Jaza.Api.Security;
using Jaza.Application.Ar;
using Jaza.Application.Common;
using Jaza.Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers.Ar;

[ApiController]
[Tags("AR")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Ar)]
[Route("api/ar")]
public sealed class ArClosingController(
    IDivisionScopeService division,
    IArClosingService closing,
    ICurrentUser currentUser,
    IValidator<ArClosePeriodDto> closeVal) : ControllerBase
{
    [HttpPost("close-period")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> ClosePeriod([FromBody] ArClosePeriodDto dto, CancellationToken ct)
    {
        await closeVal.ValidateAndThrowAsync(dto, ct);
        var div = division.RequireDivisionForWrite();
        var userId = currentUser.UserId ?? throw new DomainException("User is required.");
        await closing.ClosePeriodAsync(new ArClosePeriodRequest(div, dto.Year, dto.Month, dto.Notes), userId, ct);
        return NoContent();
    }

    [HttpPost("recalculate-balance")]
    [Authorize(Policy = Policies.RequireAdmin)]
    public async Task<IActionResult> RecalculateBalance([FromBody] ArRecalculateBalanceDto? dto, CancellationToken ct)
    {
        var div = dto?.Division ?? division.EffectiveDivision ?? division.RequireDivisionForWrite();
        await closing.RecalculateBalancesAsync(div, ct);
        return NoContent();
    }
}
