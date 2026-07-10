# PRD: Editable Line-Item Grid Pattern

## Summary

Reusable inline-editable grid for transaction line items (SO, PO, Invoice, BPB, etc.), matching legacy `VSFlexGrid` + `GridModul.bas` behavior. Hidden row status column tracks insert/update/delete; visual styling mirrors legacy blue (updated) and red (deleted) rows.

**Legacy reference:** `UI\Module\GridModul.bas`, transaction forms (`gridSales`, `gridPurchase`, etc.).

---

## Data Model

```ts
type RowStatus = "unchanged" | "insert" | "update" | "delete";

interface EditableLineRow {
  id?: string;              // undefined for new rows
  lineNumber: number;
  _status: RowStatus;       // internal; not sent to API on delete-marked rows
  // ... line fields per document type (itemId, quantity, unitPrice, etc.)
}
```

API payloads: send only rows where `_status !== "delete"`; omit `id` for `insert` rows.

---

## UI Behavior

### Grid layout

- [ ] Fixed header row, scrollable body
- [ ] Columns per document PRD (Item, Qty, UOM, Price, Disc%, Tax%, Total, etc.)
- [ ] **Actions column:** trash icon marks row deleted (not removed until save)
- [ ] **Totals footer** below grid: SubTotal, P1/P2/P3 discounts, Tax, Grand Total (legacy `PicOrder`)

### Row lifecycle

| Action | `_status` | Visual |
|--------|-----------|--------|
| New row added | `insert` | Default text |
| Cell edited on existing row | `update` | Blue text (`text-blue-600`) |
| Delete key / trash on new row | removed from array | â€” |
| Delete key / trash on existing row | `delete` | Red text + strikethrough (`text-red-600 line-through`) |
| Save success | all â†’ `unchanged` | Normal |

### Keyboard (in grid focus)

- [ ] **Insert** key: add empty row at bottom
- [ ] **Delete** key: delete new row or mark existing deleted
- [ ] **Enter** in cell: move to next editable column (legacy `GoToNextColumn`)
- [ ] **Tab**: standard focus order
- [ ] String cells: auto-uppercase on blur (legacy behavior)
- [ ] Numeric cells: digits + decimal only; reject negative qty where business rules require

### Auto-add row

- [ ] When grid receives focus and has zero rows, auto-add one empty `insert` row (legacy empty-grid behavior)

### Item column finder

- [ ] Magnifier on Item column opens [LookupDialog](lookup-browse-dialog.md) `type="items"`
- [ ] On select: populate code, name, UOM; call pricing API for unit price and P1 discount

### Validation before save

- [ ] At least one non-deleted line with `quantity > 0`
- [ ] Item required on each active line
- [ ] Inline red border + message under cell for invalid fields
- [ ] Block F2 Save until grid valid

---

## Component API

```ts
interface EditableLineGridProps<T extends EditableLineRow> {
  columns: ColumnDef<T>[];
  rows: T[];
  onRowsChange: (rows: T[]) => void;
  readOnly?: boolean;
  onItemLookup?: (rowIndex: number) => void;
}
```

Implementation: `@tanstack/react-table` (already in `package.json`) with custom cell editors (`Input` from `components/ui`).

---

## Localization keys

| Key | id | en |
|-----|-----|-----|
| `grid.addLine` | Tambah Baris | Add Line |
| `grid.noLines` | Belum ada baris. Tekan Insert untuk menambah. | No lines. Press Insert to add. |
| `grid.itemRequired` | Item wajib diisi | Item is required |
| `grid.qtyRequired` | Kuantitas harus lebih dari 0 | Quantity must be greater than 0 |

Column headers use domain-specific keys in each transaction PRD.

---

## How This Matches Existing Patterns

- New component: `src/features/common/EditableLineGrid.tsx`
- Used by refactored `SalesTransactionFormPage`, `PurchaseTransactionFormPage`, `InventoryTransactionFormPage`
- Table primitives from `@/components/ui/table.tsx`

---

## Acceptance Criteria

1. Insert/update/delete visual states match legacy colors
2. Insert/Delete/Enter keyboard behavior works in grid
3. Deleted rows excluded from API payload on save
4. Item lookup integrates with LookupDialog
5. Totals footer recalculates on row/cell change
