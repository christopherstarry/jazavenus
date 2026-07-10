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
