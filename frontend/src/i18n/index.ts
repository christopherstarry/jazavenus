import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import idCommon from "./locales/id/common.json";
import idToolbar from "./locales/id/toolbar.json";
import idLookup from "./locales/id/lookup.json";
import idDialog from "./locales/id/dialog.json";
import idGrid from "./locales/id/grid.json";
import idDocumentStatus from "./locales/id/documentStatus.json";

import enCommon from "./locales/en/common.json";
import enToolbar from "./locales/en/toolbar.json";
import enLookup from "./locales/en/lookup.json";
import enDialog from "./locales/en/dialog.json";
import enGrid from "./locales/en/grid.json";
import enDocumentStatus from "./locales/en/documentStatus.json";

export const I18N_NAMESPACES = ["common", "toolbar", "lookup", "dialog", "grid", "documentStatus"] as const;

/**
 * Bahasa Indonesia (`id`) is the default locale and carries the legacy VB6 wording verbatim.
 * English (`en`) is the translation. New domain namespaces (sales.*, purchase.*, ...) are
 * registered per-module via `registerNamespace` as each gap screen is built, so no screen ever
 * ships with hardcoded strings pending translation.
 */
void i18n.use(initReactI18next).init({
  lng: "id",
  fallbackLng: "id",
  defaultNS: "common",
  ns: [...I18N_NAMESPACES],
  resources: {
    id: {
      common: idCommon,
      toolbar: idToolbar,
      lookup: idLookup,
      dialog: idDialog,
      grid: idGrid,
      documentStatus: idDocumentStatus,
    },
    en: {
      common: enCommon,
      toolbar: enToolbar,
      lookup: enLookup,
      dialog: enDialog,
      grid: enGrid,
      documentStatus: enDocumentStatus,
    },
  },
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Register a domain namespace's resource bundles (called once per module as it's built). */
export function registerNamespace(ns: string, idResource: Record<string, unknown>, enResource: Record<string, unknown>) {
  i18n.addResourceBundle("id", ns, idResource, true, true);
  i18n.addResourceBundle("en", ns, enResource, true, true);
}

import { registerDomainNamespaces } from "./registerDomainNamespaces";
registerDomainNamespaces(registerNamespace);

export default i18n;
