# PRD: Dialog and Confirmation Patterns

## Summary

Standardize confirm, validation, business-rule, and success feedback dialogs across all gap screens to match legacy `MsgBox` wording and flow. Uses existing `confirm.tsx` and `dialog.tsx`; legacy Indonesian phrasing is the default `id` locale.

**Legacy reference:** `frmCustomer.frm`, `frmOrderEntry.frm`, `RuleModule.bas` (`CheckLocked`, credit/overdue prompts).

---

## Dialog types

### 1. Confirm delete

- [ ] **Trigger:** F3 Delete on saved document, or trash on master row
- [ ] **Message (id):** `Apakah Anda ingin menghapus data ini?` 
- [ ] **Message (en):** `Do you want to delete this record?`
- [ ] **Buttons:** Ya / Tidak (Yes / No)
- [ ] **Implementation:** `useConfirm()` from [confirm.tsx](../../../frontend/src/components/ui/confirm.tsx)

### 2. Confirm save / update

- [ ] **Trigger:** F2 Save on existing record
- [ ] **Message (id):** `Apakah Anda ingin memperbarui data ini?`
- [ ] **Buttons:** Ya / Tidak

### 3. Confirm new document after save

- [ ] **Trigger:** After successful save on transaction form (legacy `Entry New Document?`)
- [ ] **Message (id):** `Buat dokumen baru?`
- [ ] **Buttons:** Ya / Tidak Ã¢â‚¬â€ Yes clears form for new entry

### 4. Business rule Ã¢â‚¬â€ credit limit (Yes/No/Cancel)

- [ ] **Trigger:** Credit check fails on SO/DO/Invoice save or post
- [ ] **Message (id):** `Pelanggan melebihi batas kredit. Lanjutkan?`
- [ ] **Buttons:** Ya / Tidak / Batal
- [ ] **Yes:** requires SuperAdmin or Admin override; audit log entry with reason

### 5. Business rule Ã¢â‚¬â€ overdue invoices (Yes/No/Cancel)

- [ ] **Trigger:** Overdue check fails
- [ ] **Message (id):** `Pelanggan memiliki faktur jatuh tempo. Lanjutkan?`
- [ ] **Buttons:** Ya / Tidak / Batal

### 6. Validation error

- [ ] **Trigger:** Client or server validation failure
- [ ] **Title (id):** `Sales Inventory` (legacy app name) or `Kesalahan Validasi`
- [ ] **Style:** `dialog.tsx` alert variant or toast destructive
- [ ] **Show:** first error message + field highlights

### 7. Program / server error

- [ ] **Trigger:** Unhandled API error
- [ ] **Message pattern (id):** `Terjadi Kesalahan Program:` + detail (legacy format)
- [ ] **Retry:** where applicable (network errors)

### 8. Locked record

- [ ] **Trigger:** Edit posted/closed period document
- [ ] **Message (id):** `Data telah dikunci untuk transaksi` (legacy `CheckLocked`)

### 9. Success toast

- [ ] **After save/post/void:** toast success Ã¢â‚¬â€ `Data berhasil disimpan` / `Document posted`
- [ ] Use existing toast from `components/ui` if present; else add shadcn toast

### 10. Admin re-authentication (F6 date unlock)

- [ ] **Trigger:** SuperAdmin presses F6 to unlock posting date
- [ ] **Modal:** Employee ID + Password (legacy `frmUserAuthentification.frm`)
- [ ] **API:** `POST /api/auth/login` verify or dedicated unlock endpoint

---

## API error mapping

| HTTP | UI treatment |
|------|----------------|
| 400 | Inline validation / toast with `ProblemDetails.detail` |
| 401 | Redirect to `/login` |
| 403 | Toast "Akses dibatasi" + disabled actions |
| 404 | Toast "Data tidak ditemukan" |
| 409 | Business rule dialog (credit, stock, closed period) |

---

## Localization keys

Namespace: `dialog.*`

| Key | id | en |
|-----|-----|-----|
| `dialog.confirmDelete` | Apakah Anda ingin menghapus data ini? | Do you want to delete this record? |
| `dialog.confirmSave` | Apakah Anda ingin memperbarui data ini? | Do you want to update this record? |
| `dialog.newDocument` | Buat dokumen baru? | Entry new document? |
| `dialog.creditLimit` | Pelanggan melebihi batas kredit. Lanjutkan? | Customer exceeds credit limit. Continue? |
| `dialog.overdue` | Pelanggan memiliki faktur jatuh tempo. Lanjutkan? | Customer has overdue invoices. Continue? |
| `dialog.locked` | Data telah dikunci untuk transaksi | Data has been locked for transaction |
| `dialog.yes` | Ya | Yes |
| `dialog.no` | Tidak | No |
| `dialog.cancel` | Batal | Cancel |
| `dialog.saveSuccess` | Data berhasil disimpan | Data saved successfully |

---

## How This Matches Existing Patterns

- [confirm.tsx](../../../frontend/src/components/ui/confirm.tsx) Ã¢â‚¬â€ extend for Yes/No/Cancel variant
- [dialog.tsx](../../../frontend/src/components/ui/dialog.tsx) Ã¢â‚¬â€ validation and admin auth modals
- i18n: [i18n-framework.md](../localization/i18n-framework.md)

---

## Acceptance Criteria

1. All gap screens use shared dialog helpers, not ad-hoc `window.confirm`
2. Legacy Indonesian strings available as default locale
3. Credit/overdue prompts support three-button flow with audit on override
4. 409 responses from API show user-friendly business messages
