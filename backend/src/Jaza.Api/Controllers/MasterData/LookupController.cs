using Jaza.Api.Security;
using Jaza.Application.Common;
using Jaza.Application.Lookup;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jaza.Api.Controllers.MasterData;

[ApiController]
[Tags("Lookup")]
[Authorize(Policy = Policies.RequireOperator)]
[RequireModule(Modules.Master)]
[Route("api/lookup")]
public sealed class LookupController(ILookupService lookup, IDivisionScopeService division) : ControllerBase
{
    [HttpGet("types")]
    public IReadOnlyList<string> ListTypes() => lookup.SupportedTypes;

    [HttpGet("{type}")]
    public async Task<LookupResult> Search(
        string type,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var div = division.EffectiveDivision;
        return await lookup.SearchAsync(type, search, div, page, pageSize, ct);
    }
}
