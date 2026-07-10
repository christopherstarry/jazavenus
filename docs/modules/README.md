# Documentation by module

Each business module owns its PRDs, process flows, and links to the API reference.

| Module | PRDs | Flows | API reference |
|--------|------|-------|---------------|
| Auth | [auth/prds/](auth/prds/) | [auth/flow/](auth/flow/) | [api/modules/auth.md](../api/modules/auth.md), [users.md](../api/modules/users.md) |
| Master data | [master-data/prds/](master-data/prds/) | — | [api/modules/master-data.md](../api/modules/master-data.md) |
| Sales | [sales/prds/](sales/prds/) | [sales/flow/](sales/flow/) | [api/modules/outbound.md](../api/modules/outbound.md), [invoicing.md](../api/modules/invoicing.md) |
| Purchase | [purchase/prds/](purchase/prds/) | [purchase/flow/](purchase/flow/) | [api/modules/inbound.md](../api/modules/inbound.md) |
| Inventory | [inventory/prds/](inventory/prds/) | [inventory/flow/](inventory/flow/) | [api/modules/inventory.md](../api/modules/inventory.md) |
| A/R | [ar/prds/](ar/prds/) | [ar/flow/](ar/flow/) | [api/modules/ar.md](../api/modules/ar.md) |
| Reports | [reports/prds/](reports/prds/) | — | [api/modules/reports.md](../api/modules/reports.md) |
| System | [system/prds/](system/prds/) | — | [api/modules/system.md](../api/modules/system.md) |

## Cross-cutting (shared)

| Topic | Location |
|-------|----------|
| PRD writing guide | [shared/prd-guide.md](shared/prd-guide.md) |
| UI foundation (lookup, toolbar, grid, dialogs) | [shared/ui-foundation/](shared/ui-foundation/) |
| Localization (i18n) | [shared/localization/](shared/localization/) |

## Code layout (mirrors modules)

| Layer | Pattern |
|-------|---------|
| Backend controllers | `backend/src/Jaza.Api/Controllers/{Module}/` |
| Frontend features | `frontend/src/features/{module}/` |
| This docs tree | `docs/modules/{module}/` |
