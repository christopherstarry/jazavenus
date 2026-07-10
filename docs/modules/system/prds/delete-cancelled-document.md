# PRD: Delete Cancelled Document

## Summary

Administrative utility to permanently purge cancelled documents from the database. Legacy utility screen for housekeeping after void/cancel.

**Route:** `/system/delete-cancelled-document`  
**Permission:** SuperAdmin only.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Delete Cancelled Document | `/system/delete-cancelled-document` | Purge cancelled docs by type and date |

---

## Data Model

```ts
interface DeleteCancelledRequest {
  documentType: "SO" | "DO" | "INV" | "PO" | "GRN" | "BPB" | "BBK" | "TRANSFER";
  dateFrom: string;
  dateTo: string;
  division: string;
  dryRun: boolean;
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/system/delete-cancelled-documents/preview` | Count affected docs |
| POST | `/api/system/delete-cancelled-documents` | Execute purge |

---

## UI Behavior

### Toolbar â€” mode `process`

- [ ] **F5** Execute (after preview)
- [ ] **Dry Run** checkbox â€” preview only

### Form

| Field | Control |
|-------|---------|
| Document type | dropdown |
| Date range | date pickers |
| Division | division select |

### Results grid

- [ ] Preview: Doc #, Type, Date, Customer/Supplier
- [ ] Execute: progress bar + deleted count

### Dialogs

- [ ] Strong confirm: "Hapus permanen N dokumen dibatalkan?" ([dialog-patterns.md](../../shared/ui-foundation/dialog-patterns.md))
- [ ] Require re-auth (admin password)

---

## Permissions

SuperAdmin only; audit log mandatory.

---

## Localization keys

Namespace: `system.deleteCancelled.*`

| Key | id | en |
|-----|-----|-----|
| `system.deleteCancelled.title` | Hapus Dokumen Dibatalkan | Delete Cancelled Documents |
| `system.deleteCancelled.dryRun` | Simulasi (Dry Run) | Dry Run |
| `system.deleteCancelled.confirm` | Hapus permanen {count} dokumen? | Permanently delete {count} documents? |

---

## How This Matches Existing Patterns

Process toolbar; destructive action uses dialog patterns.

---

## Acceptance Criteria

1. Only Cancelled status documents deleted
2. Dry run shows accurate count
3. Full audit trail of purge action
