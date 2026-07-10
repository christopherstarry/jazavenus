# PRD: Closing A/R

## 1. Summary

Period-end A/R closing. Legacy `frmClosingAR`, `ClosingAR` table.

**Route:** `/system/closing-ar-entry`  
**Permission:** SuperAdmin.

## 2. Business rules

1. Close month: lock AR transactions for period.
2. Record closing date, next period start.
3. Update `Invoiceh` monthly aggregates (legacy); new app computes live.
4. Prevent back-dated payments after close.

## 3. Status

Backend **Missing**; frontend Coming Soon.

## 4. Acceptance criteria

- [ ] Close AR period for year/month
- [ ] Block new payments in closed period
- [ ] Recalculate AR balance tool works after close
