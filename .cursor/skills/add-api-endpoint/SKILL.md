---
name: add-api-endpoint
description: Adds or completes Jaza Venus REST endpoints following API conventions — thin controllers, Application services, division scope, pagination. Use when wiring new or incomplete API surface without a full frontend pass.
disable-model-invocation: true
---

# Add API Endpoint

Backend-focused workflow. For full features including UI, start with skill `implement-prd` (scope `api-only` or `full-stack`).

## Read first

1. [docs/api/conventions.md](../../../docs/api/conventions.md) — pagination, document lifecycle, division scope
2. [docs/api/modules/](../../../docs/api/modules/) — pick the right file (sales→`outbound.md`, purchase→`inbound.md`, invoices→`invoicing.md`; see rule `jaza-docs-and-parity`)
3. [docs/http-api.md](../../../docs/http-api.md) — existing route catalogue
4. Matching PRD if feature-scoped

## Implementation pattern

### List endpoint

```csharp
[HttpGet]
public async Task<ActionResult<PagedResult<CustomerDto>>> List(
    [FromQuery] PagedRequest request, CancellationToken ct)
{
    var scope = await division.GetScopeAsync(User, ct);
    return Ok(await service.ListAsync(request.Normalized(), scope, ct));
}
```

- `page` (1-based), `pageSize` (max 50 for lists)
- Response: `{ items, totalCount, page, pageSize, totalPages }`

### Document endpoints

- `GET /{id}` — detail with lines
- `POST` — create (Draft)
- `PUT /{id}` — update (Draft only)
- `POST /{id}/post` — post document
- `POST /{id}/void` — void document

Validation in Application via FluentValidation — not in controller.

### Division scope

Inject `IDivisionScopeService`; filter all reads/writes by caller division unless Developer/SuperAdmin override documented in API module doc.

### Audit

Writes that change business data should emit audit/activity history per [audit-and-history.md](../../../docs/database/audit-and-history.md).

## Layer placement

| Concern | Location |
|---------|----------|
| Entity | `Jaza.Domain/` |
| DTO, validator, `I*Service` | `Jaza.Application/{Module}/` |
| EF, service impl | `Jaza.Infrastructure/` |
| HTTP | `Jaza.Api/Controllers/{Module}/` |

Register services in Infrastructure `DependencyInjection.cs`.

## Tests

- Validator + service unit tests in `Jaza.Application.Tests/`
- Integration test in `Jaza.Api.IntegrationTests/` with `[Collection(nameof(PostgresCollection))]` — Docker required

## After implementation

- Update [docs/http-api.md](../../../docs/http-api.md) or run `backend/scripts/export-api-docs.ps1` if project uses it
- Update parity matrix Backend column
- Export OpenAPI visible in Development at `/openapi/v1.json`

## Don't

- Put EF queries or business rules in controllers
- Return unbounded lists without pagination
- Skip `[Authorize]` and `[RequireModule]`
