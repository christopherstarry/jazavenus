# PRD: Stock Taking

## 1. Summary

Physical stock count: preparation and record entry. Legacy stock opname process.

**Routes:**
- `/inventory/stock-taking-preparation`
- `/inventory/stock-taking-record`

**Permission:** `inventory` module.

## 2. User stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| ST-01 | Warehouse lead | Freeze stock for count | Count is accurate |
| ST-02 | Operator | Enter counted qty per SKU | Variance is calculated |
| ST-03 | System | Post adjustments for variance | Ledger matches physical |

## 3. Business rules

1. Preparation: snapshot expected on-hand per warehouse.
2. Record: enter actual count; compute variance = actual − expected.
3. Post: `StockTakeIn` or `StockTakeOut` movements for variance.

## 4. Status

Backend **Missing**; frontend UI shells only.

## 5. Acceptance criteria

- [ ] Preparation creates count session
- [ ] Record captures variances
- [ ] Post adjusts stock ledger
- [ ] Stock Opname report

---

## 6. Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Preparation | `/inventory/stock-taking-preparation` | Freeze count session |
| Record entry | `/inventory/stock-taking-record` | Enter physical counts |

---

## 7. UI Behavior

### Preparation screen — mode `process`

- [ ] **F5** Execute — create count session snapshot
- [ ] Lookups: Warehouse (`warehouses`), optional Brand/Category filters
- [ ] Read-only grid of expected on-hand

### Record screen — mode `transaction`

- [ ] Load open count session by lookup or session picker
- [ ] Editable **Actual Qty** column; variance computed read-only
- [ ] **F2** Save counts; **F5** Post adjustments

### Dialogs

- [ ] Post confirm: "Posting will adjust stock for N variances"

---

## 8. Permissions

`inventory` module; post may require Admin+.

---

## 9. Localization keys

Namespace: `inventory.stockTaking.*`

| Key | id | en |
|-----|-----|-----|
| `inventory.stockTaking.preparation` | Persiapan Stock Opname | Stock Take Preparation |
| `inventory.stockTaking.record` | Pencatatan Stock Opname | Stock Take Record |
| `inventory.stockTaking.variance` | Selisih | Variance |

---

## 10. How This Matches Existing Patterns

Foundation PRDs; inventory feature shells.
