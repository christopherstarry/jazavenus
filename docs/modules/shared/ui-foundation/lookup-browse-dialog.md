# PRD: Universal Lookup / Browse Dialog

## Summary

Reusable modal search-and-select component matching legacy VB6 `frmBrowse` + `BrowseData.bas`. Every FK code field on gap screens (transactions, A/R, inventory, new master data, reports) opens this dialog via a magnifier button or **F4**. Replaces ad-hoc `<select>` dropdowns on gap screens only Ã¢â‚¬â€ already-built master pages are out of scope.

**Legacy reference:** `UI\Forms\frmBrowse.frm`, `UI\Module\BrowseData.bas` (`siBROWSE_TYPE` enum, 64 types).

**Foundation PRD:** referenced by all domain UI PRDs in `docs/modules/sales/prds/`, `purchase/`, `inventory/`, `ar/`, `master-data/` (gap), `reports/`.

---

## Screens & URLs

| Screen | Where used | Purpose |
|--------|------------|---------|
| Lookup dialog | Modal overlay on any gap page | Search and select one record; returns code + description to caller |

No dedicated route Ã¢â‚¬â€ component only.

---

## Data Model

```ts
/** Lookup type slug Ã¢â‚¬â€ maps to GET /api/lookup/{type} */
type LookupType =
  | "customers" | "suppliers" | "items" | "warehouses" | "brands" | "categories"
  | "units" | "banks" | "salesmen" | "collectors" | "areas" | "payment-terms"
  | "order-codes" | "return-codes" | "purchase-orders" | "sales-orders"
  | "delivery-orders" | "invoices" | "payments" | "sales-returns"
  | "purchase-returns" | "credit-memos" | "post-dated-checks"
  | "stock-receipts" | "stock-issues" | "stock-transfers"
  | "customer-addresses" | "fiscal-periods" | "extra-discounts"
  | "tax-registrations" | "sub-categories" | "price-tiers" | "discount-codes";

interface LookupItem {
  id: string | null;
  code: string;
  name: string;
  extra?: string | null;
}

interface LookupDialogProps {
  type: LookupType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: LookupItem) => void;
  /** Optional parent filter (e.g. customerId for customer-addresses) */
  division?: string;
  title?: string;
}

interface LookupSearchState {
  field: string;           // column to search (from type config)
  condition: "contains" | "startsWith";
  search: string;
  autoSearch: boolean;       // default true Ã¢â‚¬â€ debounce 300ms
  page: number;
  pageSize: number;          // default 20
}
```

### Return value contract (legacy parity)

| Legacy property | Web equivalent |
|-----------------|----------------|
| `SecondValue` | `item.code` Ã¢â‚¬â€ written to code `TextBox` |
| `ThirdValue` | `item.extra` or `item.name` Ã¢â‚¬â€ written to description label |
| `FinderResult` | `item.id` Ã¢â‚¬â€ optional GUID for API FK |

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/lookup/{type}?search=&division=&page=1&pageSize=20` | Paginated lookup search |

See [http-api.md](../../http-api.md) and [api/modules/lookup.md](../../api/modules/lookup.md).

---

## UI Behavior

### Dialog chrome (match `lookup-dialog-chrome.tsx`)

- [ ] **Title:** e.g. "Browse Customer" Ã¢â‚¬â€ from lookup type config + i18n `lookup.title.{type}`
- [ ] **Find by:** dropdown of searchable columns (legacy `cboFindby`)
- [ ] **Condition:** "Contains" / "Start With" (legacy `cboCondition`)
- [ ] **Search box:** `txtSearch` Ã¢â‚¬â€ focus on open
- [ ] **Auto Search:** checkbox, default checked; when on, search debounces 300ms; when off, manual **Find** button
- [ ] **Grid:** read-only table, single-row selection, columns per type config
- [ ] **Footer:** OK (primary) + Cancel
- [ ] **Double-click row** or **Enter** on selected row Ã¢â€ â€™ same as OK
- [ ] **Esc** or Cancel Ã¢â€ â€™ close without selection (`onOpenChange(false)`)
- [ ] **Validation:** if OK with no row selected Ã¢â€ â€™ toast "Please make only one selection." (`dialog.lookup.selectOne`)
- [ ] **Loading:** skeleton rows while fetching
- [ ] **Empty:** "No records found" (`lookup.empty`)
- [ ] **Error:** inline banner with retry

### Trigger patterns

- [ ] **Magnifier button** (`Ã¢â€¹Â¯` or Search icon) beside every code field on transaction/master gap forms
- [ ] **F4** on transaction forms when focus is in header area Ã¢â€ â€™ open document browse (`frmDocumentBrw` pattern) or field-specific browse per form PRD
- [ ] **Read-only code field** + adjacent **name label** auto-filled after selection (legacy `Text1` + `Label1` pattern)

### Field wiring example (Sales Order)

| Header field | Lookup type | API filter |
|--------------|-------------|------------|
| Customer code | `customers` | division |
| Salesman code | `salesmen` | Ã¢â‚¬â€ |
| Payment term | `payment-terms` | Ã¢â‚¬â€ |
| Warehouse | `warehouses` | division |
| Ship-to address | `customer-addresses` | `customerId` parent |
| Document # (F4) | `sales-orders` | division, status filter |

### Grid line product finder

- [ ] On editable line grid, magnifier overlay on active Item column cell opens `items` lookup (legacy `cmdFinderProduct`)
- [ ] After select: fill Item code, name, UOM, default price from `GET /api/pricing/resolve`

---

## Permissions

- Lookup is read-only; same module permission as parent screen (`sales`, `purchase`, etc.).
- Division filter applied server-side via `IDivisionScopeService` when user is not SuperAdmin/Developer.

---

## Localization keys

| Key | id (default) | en |
|-----|--------------|-----|
| `lookup.title.customers` | Cari Pelanggan | Browse Customer |
| `lookup.condition.contains` | Mengandung | Contains |
| `lookup.condition.startsWith` | Dimulai Dengan | Start With |
| `lookup.autoSearch` | Pencarian Otomatis | Auto Search |
| `lookup.find` | Cari | Find |
| `lookup.select` | Pilih | OK |
| `lookup.cancel` | Batal | Cancel |
| `lookup.selectOne` | Silakan pilih satu baris. | Please make only one selection. |
| `lookup.empty` | Tidak ada data. | No records found. |

Add per-type titles under `lookup.title.*`.

---

## How This Matches Existing Patterns

- Extend [CustomerLookupDialog.tsx](../../../frontend/src/features/customers/CustomerLookupDialog.tsx) into generic `LookupDialog.tsx` in `src/features/common/`
- Chrome from [lookup-dialog-chrome.tsx](../../../frontend/src/components/ui/lookup-dialog-chrome.tsx)
- API: `api.get(\`lookup/${type}\`, { searchParams })` via [api.ts](../../../frontend/src/lib/api.ts)
- i18n: [i18n-framework.md](../localization/i18n-framework.md)

---

## Acceptance Criteria

1. One `<LookupDialog type="..." />` works for all gap-screen FK fields
2. Search, pagination, and selection match legacy `frmBrowse` behavior
3. F4 and magnifier triggers documented per domain PRD
4. All strings use i18n keys (id default, en translation)
5. Division scoping enforced on document/customer lookups
