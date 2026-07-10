# PRD: PDC Clearance Cancellation

## Summary

Reverse a previously cleared post-dated cheque (Giro). Distinct legacy flow from [pdc-clearance.md](pdc-clearance.md) â€” restores PDC outstanding status and reverses invoice allocations.

**Legacy reference:** `frmCheckGiroClearing` cancellation mode, `GiroClearing` reversal.

**Route:** `/ar/pdc-clearance-cancellation`  
**Permission:** `ar` module, Admin+ for cancellation.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| PDC Cancellation | `/ar/pdc-clearance-cancellation` | Cancel prior giro clearance |

---

## Data Model

```ts
interface PdcClearanceCancellation {
  id: string;
  clearanceId: string;
  giroId: string;
  cancelDate: string;
  reason: string;
  reversedAllocations: PaymentAllocationLine[];
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/ar/pdc-clearances?status=cleared` | List clearances eligible for cancel |
| POST | `/api/ar/pdc-clearances/{id}/cancel` | Reverse clearance |

---

## UI Behavior

### Toolbar â€” mode `transaction`

- [ ] **F4** Browse cleared PDCs (`post-dated-checks`, status=Cleared)
- [ ] **F2** Save cancellation; **F3** not used

### Header

| Field | Lookup type |
|-------|-------------|
| Giro | `post-dated-checks` (Cleared filter) |
| Customer | read-only from giro |
| Original clear date | read-only |

### Allocation grid

- [ ] Read-only display of original invoice allocations
- [ ] Reason text field required

### Dialogs

- [ ] Confirm: "Batalkan kliring giro {number}?" ([dialog-patterns.md](../../shared/ui-foundation/dialog-patterns.md))
- [ ] Block if period closed ([closing-ar.md](closing-ar.md))

---

## Permissions

Admin+ or SuperAdmin.

---

## Localization keys

Namespace: `ar.pdcCancellation.*`

| Key | id | en |
|-----|-----|-----|
| `ar.pdcCancellation.title` | Pembatalan Kliring Giro | PDC Clearance Cancellation |
| `ar.pdcCancellation.confirm` | Batalkan kliring giro {number}? | Cancel clearance for cheque {number}? |
| `ar.pdcCancellation.reason` | Alasan | Reason |

---

## How This Matches Existing Patterns

Companion to [pdc-clearance.md](pdc-clearance.md); foundation PRDs in `ui-foundation/`.

---

## Acceptance Criteria

1. Cancelled clearance restores giro to Outstanding
2. Invoice paid amounts reversed correctly
3. Audit log records cancellation with reason
