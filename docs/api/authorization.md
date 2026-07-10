# Authorization

Jaza Venus layers **role policies**, **module permissions**, and **report permissions** on top of ASP.NET Identity authentication. Unless a route is marked `[AllowAnonymous]`, callers must present a valid cookie session or JWT bearer token.

---

## Roles

| Role | Code | Typical use |
|------|------|-------------|
| Sales | 1 | Day-to-day operators; cost fields may be hidden |
| Admin | 2 | Master-data writes, document posting, integrations |
| SuperAdmin | 3 | User management, void invoice, backup/restore |
| Developer | 4 | Error logs, full report access, developer tooling |

Role hierarchy for policies (each policy includes all roles to its right):

```
Developer âŠƒ SuperAdmin âŠƒ Admin âŠƒ Sales
```

---

## Authorization policies

Registered in `Program.cs` and referenced via `[Authorize(Policy = ...)]`:

| Policy | Roles allowed | Used by |
|--------|---------------|---------|
| `RequireDeveloper` | Developer | Error logs |
| `RequireSuperAdmin` | Developer, SuperAdmin | Users, permissions, audit logs, invoice void |
| `RequireAdmin` | Developer, SuperAdmin, Admin | Master-data writes, PO/SO create, posting, integrations |
| `RequireOperator` | Developer, SuperAdmin, Admin, Sales | Default for module controllers |
| `Module:{module}` | Authenticated + module permission | Business modules |
| Default / Fallback | Any authenticated user | Endpoints with bare `[Authorize]` |

Both **cookie** and **JWT bearer** schemes satisfy `[Authorize]` (multi-scheme default policy).

---

## Module permissions

Stored per user in `user_module_permissions`. Module identifiers:

| Module | Key | Example routes |
|--------|-----|----------------|
| Master data | `master` | `/api/master/*`, `/api/settings/*`, `/api/lookup/*` |
| Purchase | `purchase` | `/api/inbound/*` |
| Sales | `sales` | `/api/outbound/*`, `/api/tax/serials`, `/api/pricing`, `/api/processes` |
| Accounts receivable | `ar` | `/api/invoices/*`, `/api/ar/*` |
| Inventory | `inventory` | `/api/stock/*`, `/api/inventory/*` |

Controllers apply `[RequireModule(Modules.X)]` at class level. The `ModulePermissionHandler` checks the caller's resolved permissions from `GET /api/auth/me`.

**Developer** and **SuperAdmin** roles bypass module checks (full module access).

Each module permission includes optional `canEdit` / `canDelete` flags returned in `permissions.modules` on login.

---

## Report permissions

Stored per user in `user_report_permissions`. Report type keys:

| Type | Key | Routes |
|------|-----|--------|
| Sales | `sales` | `/api/reports/sales/{reportKey}` |
| Inventory | `inventory` | `/api/reports/inventory/{reportKey}`, `/api/reports/stock-card`, â€¦ |
| Purchase | `purchase` | `/api/reports/purchase/{reportKey}` |
| A/R | `ar` | `/api/reports/ar/{reportKey}`, `/api/reports/financial-summary` |

`[RequireReport(ReportTypes.X)]` is applied on report controllers and individual report actions.

---

## Division scoping

Authorization answers *who*; division scoping answers *which company branch*:

| Caller | List behaviour | Write behaviour |
|--------|----------------|-----------------|
| Sales / Admin | Filtered to preference division | `X-Division` required if preference unset |
| Developer / SuperAdmin | All divisions | Optional `X-Division` header to pin context |

Valid divisions: `DISTRIBUTIONBDG`, `DISTRIBUTIONCRB`, `TRADINGBDG`, `TRADINGCRB`.

Cross-division access attempts return **403 Forbidden** via `IDivisionScopeService.EnsureDivisionAccess`.

---

## Permission resolution flow

```
Login / GET /api/auth/me
        â”‚
        â–¼
PermissionResolver.ResolveAsync(userId)
        â”‚
        â”œâ”€ Developer? â†’ all modules + all reports
        â”œâ”€ SuperAdmin? â†’ all modules + all reports (no error logs)
        â””â”€ Other roles â†’ DB module + report rows
        â”‚
        â–¼
JWT claims + LoginResponse.permissions
        â”‚
        â–¼
[RequireModule] / [RequireReport] handlers on each request
```

---

## Management endpoints

| Action | Endpoint | Policy |
|--------|----------|--------|
| List/create/update/delete users | `/api/users` | SuperAdmin+ |
| Read/replace permissions | `/api/users/{userId}/permissions` | SuperAdmin+ |
| Read audit trail | `/api/audit-logs` | SuperAdmin+ |
| Read server errors | `/api/error-logs` | Developer |

---

## HTTP status codes

| Status | Meaning |
|--------|---------|
| 401 | Missing or expired session/token |
| 403 | Authenticated but role, module, report, or division denied |
| 404 | Resource not found (may also mask forbidden division access) |

See [errors.md](errors.md) for ProblemDetails shape.

---

## Further reading

- [authentication.md](authentication.md) â€” login, tokens, CSRF
- [conventions.md](conventions.md#division-scoping) â€” division header details
- [../modules/auth/flow/permissions.md](../modules/auth/flow/permissions.md) â€” product-oriented permission guide
