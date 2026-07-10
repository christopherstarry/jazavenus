import idSales from "#/i18n/locales/id/sales.json";
import enSales from "#/i18n/locales/en/sales.json";
import idPurchase from "#/i18n/locales/id/purchase.json";
import enPurchase from "#/i18n/locales/en/purchase.json";
import idInventory from "#/i18n/locales/id/inventory.json";
import enInventory from "#/i18n/locales/en/inventory.json";
import idAr from "#/i18n/locales/id/ar.json";
import enAr from "#/i18n/locales/en/ar.json";
import idReports from "#/i18n/locales/id/reports.json";
import enReports from "#/i18n/locales/en/reports.json";
import idMasterData from "#/i18n/locales/id/masterData.json";
import enMasterData from "#/i18n/locales/en/masterData.json";
import idSystem from "#/i18n/locales/id/system.json";
import enSystem from "#/i18n/locales/en/system.json";

type RegisterFn = (ns: string, idResource: Record<string, unknown>, enResource: Record<string, unknown>) => void;

/** Register all gap-screen domain namespaces at bootstrap (Phases 1–6). */
export function registerDomainNamespaces(register: RegisterFn) {
  register("sales", idSales, enSales);
  register("purchase", idPurchase, enPurchase);
  register("inventory", idInventory, enInventory);
  register("ar", idAr, enAr);
  register("reports", idReports, enReports);
  register("masterData", idMasterData, enMasterData);
  register("system", idSystem, enSystem);
}
