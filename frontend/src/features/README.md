# Frontend features by module

Feature code lives under `src/features/{module}/`. Shared UI primitives stay in `common/`.

| Folder | Contents |
|--------|----------|
| `auth/` | Login, change password |
| `dashboard/` | Home dashboard |
| `master-data/` | Master CRUD pages (`pages/`), `ReferenceDataPage` |
| `sales/` | Sales transactions, `InvoicesPage` |
| `purchase/` | Purchase transactions, `GrnsPage` |
| `inventory/` | BPB/BBK/transfer, stock taking, planning |
| `ar/` | Bank transfer, PDC clearance |
| `reports/` | `sales/`, `inventory/`, `shared/` report screens |
| `system/` | `users/`, `audit/`, `errors/`, `settings/` |
| `common/` | `CrudPage`, toolbar nav, `lookup/`, placeholders |

PRDs: [docs/modules/README.md](../../../docs/modules/README.md)
