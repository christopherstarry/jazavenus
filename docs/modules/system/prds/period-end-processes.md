# PRD: Period-End Processes

## Summary

Bundled monthly and day-end batch processes. Legacy "Monthly Process" and "Day-End Process" utilities — stock valuation snapshot, AR summary rollups, period locks.

**Route:** `/system/period-end-processes`  
**Permission:** SuperAdmin.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Period-End Processes | `/system/period-end-processes` | Run month-end and day-end jobs |

Tabbed: **Monthly Process** | **Day-End Process**

---

## Data Model

```ts
interface PeriodEndJob {
  jobType: "monthly" | "dayEnd";
  fiscalYear: number;
  fiscalMonth: number;
  division: string;
  steps: PeriodEndStep[];
}

interface PeriodEndStep {
  stepId: string;
  name: string;
  status: "pending" | "running" | "done" | "failed";
  message?: string;
}
```

**Monthly steps (legacy):** Stock valuation, AR monthly summary, commit inventory planning snapshot.  
**Day-end steps:** Daily sales rollup, daily stock movement summary, cashier close (if applicable).

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/system/period-end/monthly` | Run monthly process |
| POST | `/api/system/period-end/day-end` | Run day-end process |
| GET | `/api/system/period-end/status` | Job status poll |

---

## UI Behavior

### Toolbar — mode `process`

- [ ] **F5** Execute selected tab's process
- [ ] Period selectors via `fiscal-periods` lookup

### Step checklist UI

- [ ] Read-only step list with status icons
- [ ] Log panel showing legacy-style progress messages
- [ ] Block if prior month not closed ([closing-ar.md](../ar/closing-ar.md))

### Dialogs

- [ ] Confirm before execute
- [ ] Error dialog with failed step detail

---

## Permissions

SuperAdmin only.

---

## Localization keys

Namespace: `system.periodEnd.*`

| Key | id | en |
|-----|-----|-----|
| `system.periodEnd.title` | Proses Akhir Periode | Period-End Processes |
| `system.periodEnd.monthly` | Proses Bulanan | Monthly Process |
| `system.periodEnd.dayEnd` | Proses Akhir Hari | Day-End Process |
| `system.periodEnd.running` | Menjalankan... | Running... |

---

## How This Matches Existing Patterns

Process toolbar; coordinates with [company-preferences.md](company-preferences.md) fiscal config.

---

## Acceptance Criteria

1. Monthly process runs all steps atomically or rolls back
2. Day-end idempotent (safe to re-run)
3. Status pollable from UI
