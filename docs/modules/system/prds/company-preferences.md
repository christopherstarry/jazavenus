# PRD: Company Preferences

## Summary

Company-wide settings and fiscal period configuration. Legacy "Preferences" screen â€” division defaults, fiscal year, document series prefixes, tax settings.

**Route:** `/system/company-preferences`  
**Permission:** SuperAdmin.

---

## Screens & URLs

| Screen | Route | Purpose |
|--------|-------|---------|
| Company Preferences | `/system/company-preferences` | Edit company and fiscal settings |

---

## Data Model

```ts
interface CompanyPreferences {
  companyName: string;
  address: string;
  npwp: string;
  defaultDivision: string;
  fiscalYearStartMonth: number;
  currentFiscalYear: number;
  documentSeries: DocumentSeriesConfig[];
}

interface DocumentSeriesConfig {
  documentType: string;
  prefix: string;
  nextNumber: number;
  padding: number;
}
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/system/preferences` | Read settings |
| PUT | `/api/system/preferences` | Update settings |
| GET | `/api/system/fiscal-periods` | List periods |
| POST | `/api/system/fiscal-periods` | Create period |

---

## UI Behavior

### Toolbar â€” mode `master`

- [ ] **F2** Save all tabs; no New/Delete on company record

### Tabs

1. **Company** â€” name, address, NPWP
2. **Fiscal** â€” year start, current period (`fiscal-periods` grid)
3. **Document Series** â€” editable grid: type, prefix, next #

### Lookups

| Field | Lookup type |
|-------|-------------|
| Default division | division select (admin) |

### Dialogs

- [ ] Save confirm for fiscal period changes
- [ ] Warn if changing series mid-year

---

## Permissions

SuperAdmin only.

---

## Localization keys

Namespace: `system.preferences.*`

| Key | id | en |
|-----|-----|-----|
| `system.preferences.title` | Preferensi Perusahaan | Company Preferences |
| `system.preferences.fiscalYear` | Tahun Fiskal | Fiscal Year |
| `system.preferences.documentSeries` | Seri Dokumen | Document Series |

---

## How This Matches Existing Patterns

Master toolbar on system route; [i18n-framework.md](../../shared/localization/i18n-framework.md).

---

## Acceptance Criteria

1. Preferences persist and affect document numbering
2. Fiscal periods drive period-end and AR closing
