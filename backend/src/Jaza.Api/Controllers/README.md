# API controllers by module

Controllers live under `Jaza.Api.Controllers.{Module}/`. Routes are unchanged — only folder and namespace organization.

| Folder | Controllers |
|--------|-------------|
| `Auth/` | `AuthController` |
| `Users/` | `UsersController`, `PermissionsController` |
| `MasterData/` | `MasterDataController`, `ReferenceDataController`, `ExtraDiscountsController`, `LookupController`, `PricingController` |
| `Sales/` | `OutboundController`, `SalesReturnsController`, `CreditMemosController`, `InvoicingController` |
| `Purchase/` | `InboundController`, `PurchaseReturnsController` |
| `Inventory/` | `StockController`, `InventoryDocumentsController`, `StockTakeController` |
| `Ar/` | `ArPaymentsController`, `PdcController`, `ArAdjustmentsController`, `ArClosingController` |
| `Reports/` | `ReportsController`, `SalesReportsController`, `InventoryReportsController`, `PurchaseReportsController`, `ArReportsController`, `ReportQueryParams` |
| `System/` | `SystemController`, `SettingsController`, `ProcessesController`, `AuditLogsController`, `ErrorLogsController` |
| `Tax/` | `TaxSerialsController` |
| `Integrations/` | `IntegrationsController` |
| `ImportExport/` | `ImportExportController` |
| `Analytics/` | `AnalyticsController` |
| `Consignments/` | `ConsignmentsController` |
| `Common/` | Shared API types (e.g. `MessageResponse`) |

PRDs: [docs/modules/README.md](../../../../docs/modules/README.md)
