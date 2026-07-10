import { describe, expect, it } from "vitest";
import i18n from "#/i18n";

const DOMAIN_NAMESPACES = ["sales", "purchase", "inventory", "ar", "reports", "masterData", "system"] as const;

describe("domain i18n namespaces", () => {
  it("registers all gap-screen namespaces at bootstrap", () => {
    for (const ns of DOMAIN_NAMESPACES) {
      expect(i18n.hasResourceBundle("id", ns)).toBe(true);
      expect(i18n.hasResourceBundle("en", ns)).toBe(true);
    }
  });

  it("resolves representative keys in id and en", () => {
    expect(i18n.t("sales:common.newDocPrompt", { lng: "id" })).not.toMatch(/^sales:/);
    expect(i18n.t("sales:common.newDocPrompt", { lng: "en" })).not.toMatch(/^sales:/);
    expect(i18n.t("ar:paymentMethod.cash", { lng: "id" })).toBe("Tunai");
    expect(i18n.t("ar:paymentMethod.cash", { lng: "en" })).toBe("Cash");
  });
});
