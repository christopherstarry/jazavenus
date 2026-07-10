import { useSettings } from "#/lib/settings";

function localeFor(language: string) {
  return language === "id" ? "id-ID" : "en-US";
}

export function formatCurrency(value: number, language: string) {
  return new Intl.NumberFormat(localeFor(language), {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, language: string) {
  return new Intl.NumberFormat(localeFor(language)).format(value);
}

export function formatDate(iso: string | Date, language: string) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(localeFor(language), { dateStyle: "medium" }).format(d);
}

/** Locale-aware number/currency/date formatting bound to the current UI language preference. */
export function useFormatters() {
  const { language } = useSettings();
  return {
    language,
    currency: (value: number) => formatCurrency(value, language),
    number: (value: number) => formatNumber(value, language),
    date: (iso: string | Date) => formatDate(iso, language),
  };
}
