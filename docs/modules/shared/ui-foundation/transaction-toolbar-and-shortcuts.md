# PRD: Transaction Toolbar and Keyboard Shortcuts

## Summary

Global toolbar and F-key contract for all **gap** transaction, process, and master-data entry screens. Matches legacy MDI `tbPOS` toolbar in `MainFrm.frm` and `RuleModule.bas` (`SetToolBar`, `DoKeyDown`). The current app shell (sidebar, breadcrumbs) is unchanged; this toolbar renders **inside** each gap page content area.

**Legacy reference:** `UI\Forms\MainFrm.frm` (`tbPOS(0â€“15)`), `UI\Module\RuleModule.bas`.

---

## Screens & URLs

Component: `<LegacyTransactionToolbar />` â€” embedded in gap pages, not a separate route.

---

## Toolbar button map (legacy `tbPOS`)

| Index | Label | Action | Shortcut | Enabled when |
|-------|-------|--------|----------|--------------|
| 0 | New | `onNew()` | **F1** | Document not in insert-only lock |
| 1 | Save | `onSave()` | **F2** | Dirty + valid |
| 2 | Del / Undo | `onDelete()` or `onUndo()` | **F3** | Toggle: Del in view mode, Undo in insert |
| 3 | First | `onFirst()` | **F9** | Master data mode only |
| 4 | Previous | `onPrevious()` | **F10** | Master data mode only |
| 5 | Next | `onNext()` | **F11** | Master data mode only |
| 6 | Last | `onLast()` | **F12** | Master data mode only |
| 7 | Export Excel | `onExport("xlsx")` | â€” | Optional; hidden on transactions |
| 8 | Export Text | `onExport("txt")` | â€” | Optional; hidden |
| 9 | Import Excel | `onImport("xlsx")` | â€” | Optional; hidden |
| 10 | Import Text | `onImport("txt")` | â€” | Optional; hidden |
| 11 | Execute / Print | `onExecute()` | **F5** | Reports + post/print actions |
| 12 | Close | `onClose()` | **Esc** | Always (navigates back or clears form) |
| 13 | Prev Form | `onPrevForm()` | **PageDown** | Multi-tab stack (optional v1) |
| 14 | Next Form | `onNextForm()` | **PageUp** | Multi-tab stack (optional v1) |

**Note:** Export/Import (7â€“10) may remain hidden on v1 gap screens (legacy also hides them in current build).

---

## Toolbar modes (`FORM_TYPE`)

| Mode | Legacy constant | Used on | Nav F9â€“F12 | Record nav |
|------|-----------------|---------|------------|------------|
| `master` | `insDATA_TYPE` | Extra discount, order codes, BP item | Enabled | Enabled |
| `transaction` | `insTRANSACTION_TYPE` | SO, PO, Invoice, BPB, PDC, etc. | **Disabled** | Disabled |
| `process` | `insPROCESS_TYPE` | Reports, closing AR, batch jobs | Disabled | Only Execute (F5) |

```ts
type ToolbarMode = "master" | "transaction" | "process";

interface LegacyTransactionToolbarProps {
  mode: ToolbarMode;
  formState: "init" | "insert" | "normal" | "posted" | "voided";
  canEdit: boolean;
  canDelete: boolean;
  isDirty: boolean;
  onNew: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onExecute?: () => void;
  onPrint?: () => void;
  onFirst?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onLast?: () => void;
  onClose: () => void;
}
```

### Button enablement by `formState`

| State | New | Save | Del/Undo | Execute/Print |
|-------|-----|------|----------|---------------|
| `init` (empty) | Yes | No | No | No |
| `insert` | No | Yes | Undo | No |
| `normal` (loaded draft) | Yes | Yes | Delete | Per screen |
| `posted` | Yes (new doc) | No | No | Print |
| `voided` | Yes (new doc) | No | No | No |

---

## Keyboard hook

- [ ] `useLegacyShortcuts(handlers)` registered on gap pages via `useEffect` + `window.addEventListener("keydown")`
- [ ] Ignore when focus is in `<input>`, `<textarea>`, or editable grid cell (except Enterâ†’Tab behavior in grid â€” see [editable-grid-pattern.md](editable-grid-pattern.md))
- [ ] **F6** (admin only): unlock posting date field â€” SuperAdmin/Developer override with audit log
- [ ] Show shortcut hints in toolbar button tooltips: `toolbar.new` + `(F1)`

---

## Division banner

- [ ] Keep existing [LegacyDivisionFormNav.tsx](../../../frontend/src/features/common/LegacyDivisionFormNav.tsx) above toolbar: `DIVISION : {division}` + optional Prev/Next form buttons
- [ ] Division read from user preference or `X-Division` header for admins

---

## UI Behavior

- [ ] Toolbar: horizontal button row, icon + label, 48px min touch height (warehouse PCs)
- [ ] Disabled buttons: grayed, not clickable
- [ ] Del button label toggles to **Undo** when `formState === "insert"`
- [ ] Posted documents: all edit buttons disabled except New, Print, Close
- [ ] `canEdit === false` (Sales view-only): hide New/Save/Delete; show read-only banner

---

## Localization keys

| Key | id | en |
|-----|-----|-----|
| `toolbar.new` | Baru | New |
| `toolbar.save` | Simpan | Save |
| `toolbar.delete` | Hapus | Delete |
| `toolbar.undo` | Batal | Undo |
| `toolbar.print` | Cetak | Print |
| `toolbar.execute` | Jalankan | Execute |
| `toolbar.close` | Tutup | Close |
| `toolbar.first` | Awal | First |
| `toolbar.previous` | Sebelumnya | Previous |
| `toolbar.next` | Berikutnya | Next |
| `toolbar.last` | Akhir | Last |

---

## How This Matches Existing Patterns

- Build `LegacyTransactionToolbar.tsx` in `src/features/common/`
- Wire into [SalesTransactionFormPage.tsx](../../../frontend/src/features/sales/SalesTransactionFormPage.tsx), [PurchaseTransactionFormPage.tsx](../../../frontend/src/features/purchase/PurchaseTransactionFormPage.tsx), [InventoryTransactionFormPage.tsx](../../../frontend/src/features/inventory/InventoryTransactionFormPage.tsx)
- Permissions from `useAuth().permissions` â€” `canEdit` / `canDelete` per module

---

## Acceptance Criteria

1. F1â€“F5, F9â€“F12, Esc work on all gap transaction screens
2. Toolbar mode matches legacy `FORM_TYPE` rules
3. Posted/voided documents cannot be edited via toolbar
4. All labels localized (id/en)
