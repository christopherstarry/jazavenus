# PRD: Localization (i18n) Framework

## Summary

Introduce `i18next` + `react-i18next` for all **gap** screens (transactions, A/R, inventory docs, new master data, reports). Bahasa Indonesia (`id`) is the default locale carrying legacy VB6 wording; English (`en`) is the translation. Already-built master CRUD pages are **not** retrofitted in this phase.

**Legacy reference:** Indonesian UI strings throughout `UI\Forms\*.frm`.

---

## Screens & URLs

No dedicated route. Locale applies globally via `I18nextProvider` in `main.tsx` / `App.tsx`.

| Setting | Location |
|---------|----------|
| Language preference | `SettingsPanel` Ã¢â€ â€™ User Preferences |
| Persisted | `UserPreferences.language` via `GET/PUT /api/users/me/preferences` |

---

## Library & file structure

```
frontend/src/
  i18n/
    index.ts              # i18next init
    locales/
      id/
        common.json
        toolbar.json
        lookup.json
        dialog.json
        documentStatus.json
        invoiceStatus.json
        pdcStatus.json
        audit.json
        sales.json
        purchase.json
        inventory.json
        ar.json
        reports.json
        masterData.json
        system.json
      en/
        (same files Ã¢â‚¬â€ English translations)
```

### Init (`i18n/index.ts`)

```ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import idCommon from "./locales/id/common.json";
import enCommon from "./locales/en/common.json";
// ... import all namespaces

i18n.use(initReactI18next).init({
  lng: "id",
  fallbackLng: "id",
  defaultNS: "common",
  ns: ["common", "toolbar", "lookup", "dialog", "documentStatus", /* ... */],
  resources: {
    id: { common: idCommon, /* ... */ },
    en: { common: enCommon, /* ... */ },
  },
});
```

---

## Documented namespaces (from naming-conventions.md + new)

| Namespace | Keys | Example |
|-----------|------|---------|
| `documentStatus.*` | Open, Cancelled, Closed | `documentStatus.open` Ã¢â€ â€™ "Terbuka" / "Open" |
| `invoiceStatus.*` | Draft, Posted, Voided | `invoiceStatus.posted` |
| `pdcStatus.*` | Outstanding, Cleared, Bounced | `pdcStatus.outstanding` |
| `audit.action.*` | Create, Update, Delete, Post | `audit.action.post` |
| `toolbar.*` | New, Save, Delete, F-key labels | See [transaction-toolbar-and-shortcuts.md](../ui-foundation/transaction-toolbar-and-shortcuts.md) |
| `lookup.*` | Browse dialog chrome | See [lookup-browse-dialog.md](../ui-foundation/lookup-browse-dialog.md) |
| `dialog.*` | Confirm, validation, business rules | See [dialog-patterns.md](../ui-foundation/dialog-patterns.md) |
| `sales.*` | Sales transaction field labels | Per sales PRD |
| `purchase.*` | Purchase labels | Per purchase PRD |
| `inventory.*` | Inventory labels | Per inventory PRD |
| `ar.*` | A/R labels | Per ar PRD |
| `reports.*` | Report titles, filter labels | Per report catalog |
| `masterData.*` | Gap master screens | Per master-data PRD |
| `system.*` | Preferences, utilities | Per system PRD |

---

## Wiring to settings

- [ ] On app load: read `UserPreferences.language` from API or localStorage cache
- [ ] `i18n.changeLanguage(lang)` when user saves Settings
- [ ] Extend [settings.tsx](../../../frontend/src/lib/settings.tsx) to call `changeLanguage` on save
- [ ] Default `id` when preference missing

---

## Number and date formatting

```ts
export function formatCurrency(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US").format(new Date(iso));
}
```

- [ ] Wrap in `useFormatters()` hook reading current i18n language
- [ ] Grid numeric columns use `formatCurrency` / `formatNumber`

---

## UI Behavior

- [ ] All new gap-screen strings use `t("key")` Ã¢â‚¬â€ no hardcoded Indonesian in JSX
- [ ] Domain PRDs list required keys under **Localization keys** section
- [ ] Both `id.json` and `en.json` entries required before marking PRD complete
- [ ] Report column headers localized via `reports.{reportKey}.columns.{field}`
- [ ] Document status badges use `documentStatus.*` namespace

---

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/users/me/preferences` | Read `language` field |
| PUT | `/api/users/me/preferences` | Save `language: "id" \| "en"` |

---

## Permissions

All authenticated users can change their own language preference.

---

## How This Matches Existing Patterns

- `documentStatus.*` keys already documented in [naming-conventions.md](../../database/naming-conventions.md)
- Settings UI in [settings.tsx](../../../frontend/src/lib/settings.tsx) Ã¢â‚¬â€ add language dropdown
- Backend preferences endpoint implemented in Phase A API work

---

## Acceptance Criteria

1. `i18next` initialized; app renders in `id` by default
2. Language switch in Settings persists and reloads without full page refresh
3. All gap-screen PRDs ship with Localization keys tables
4. Currency and dates format per locale
5. No hardcoded user-visible strings on new gap pages
