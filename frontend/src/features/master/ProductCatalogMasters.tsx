import { CodeDescriptionMasterPage } from "#/features/common/CodeDescriptionMasterPage";
import type { CodeDescriptionRow } from "#/features/common/CodeDescriptionMasterPage";

function withPocRows(
  base: CodeDescriptionRow[],
  extra: number,
  label: string
): CodeDescriptionRow[] {
  const out = [...base];
  for (let i = 1; i <= extra; i++) {
    out.push({
      code: `POC-${String(i).padStart(3, "0")}`,
      description: `${label} ${String(i).padStart(3, "0")}`,
    });
  }
  return out;
}

/* ─── Product Category (legacy sample + pagination) ─── */

const CATEGORY_CORE: CodeDescriptionRow[] = [
  { code: "01", description: "SALON" },
  { code: "02", description: "OTHERS" },
  { code: "03", description: "COSMETIC" },
  { code: "04", description: "TOILETRIES" },
  { code: "05", description: "FARMASI" },
  { code: "06", description: "LIPSTICK" },
  { code: "07", description: "FOOD" },
  { code: "99", description: "UNDEFINE" },
];

const ALL_PRODUCT_CATEGORIES = withPocRows(CATEGORY_CORE, 95, "POC Category");

const DEMO_PRODUCT_CATEGORIES: CodeDescriptionRow[] = [
  ALL_PRODUCT_CATEGORIES.find((r) => r.code === "01")!,
  ALL_PRODUCT_CATEGORIES.find((r) => r.code === "03")!,
  ALL_PRODUCT_CATEGORIES.find((r) => r.code === "07")!,
];

export function ProductCategoryPage() {
  return (
    <CodeDescriptionMasterPage
      pageTitle=":: Table of Product Category"
      codeLabel="Category ID"
      codeInputId="product-category-code"
      descriptionInputId="product-category-desc"
      lookupDialogTitle="Table of Product Category"
      codeColumnLabel="Category Code"
      allRows={ALL_PRODUCT_CATEGORIES}
      demoCycle={DEMO_PRODUCT_CATEGORIES}
    />
  );
}

/* ─── Sub Product Category (same list shape as VB reference) ─── */

const SUBCATEGORY_CORE: CodeDescriptionRow[] = [
  { code: "01", description: "SALON" },
  { code: "02", description: "OTHERS" },
  { code: "03", description: "COSMETIC" },
  { code: "04", description: "TOILETRIES" },
  { code: "05", description: "FARMASI" },
  { code: "06", description: "LIPSTICK" },
  { code: "07", description: "FOOD" },
  { code: "99", description: "UNDEFINE" },
];

const ALL_SUB_PRODUCT_CATEGORIES = withPocRows(SUBCATEGORY_CORE, 92, "POC Sub category");

const DEMO_SUB_PRODUCT_CATEGORIES: CodeDescriptionRow[] = [
  ALL_SUB_PRODUCT_CATEGORIES.find((r) => r.code === "01")!,
  ALL_SUB_PRODUCT_CATEGORIES.find((r) => r.code === "03")!,
  ALL_SUB_PRODUCT_CATEGORIES.find((r) => r.code === "99")!,
];

export function SubProductCategoryPage() {
  return (
    <CodeDescriptionMasterPage
      pageTitle=":: Table of Sub Product Category"
      codeLabel="Sub Category Code"
      codeInputId="sub-product-category-code"
      descriptionInputId="sub-product-category-desc"
      lookupDialogTitle="Table of Sub Product Category"
      codeColumnLabel="Sub Category Code"
      allRows={ALL_SUB_PRODUCT_CATEGORIES}
      demoCycle={DEMO_SUB_PRODUCT_CATEGORIES}
    />
  );
}

/* ─── Price ─── */

const PRICE_CORE: CodeDescriptionRow[] = [
  { code: "HPP", description: "Harga Beli Baru" },
  { code: "HPPOLD", description: "Harga Beli Lama" },
  { code: "HET", description: "Harga HET1 Baru" },
  { code: "HETOLD", description: "Harga HET1 Lama" },
  { code: "HET2", description: "Harga HET2 Baru" },
  { code: "RETAIL", description: "Harga Retail" },
  { code: "GROSIR", description: "Harga Grosir" },
];

const ALL_PRICES = withPocRows(PRICE_CORE, 96, "POC Price type");

const DEMO_PRICES: CodeDescriptionRow[] = [
  ALL_PRICES.find((r) => r.code === "HET")!,
  ALL_PRICES.find((r) => r.code === "HPP")!,
  ALL_PRICES.find((r) => r.code === "HETOLD")!,
];

export function ProductPricePage() {
  return (
    <CodeDescriptionMasterPage
      pageTitle=":: Table of Price"
      codeLabel="Price Code"
      codeInputId="product-price-code"
      descriptionInputId="product-price-desc"
      lookupDialogTitle="Table of Price"
      codeColumnLabel="Price Code"
      allRows={ALL_PRICES}
      demoCycle={DEMO_PRICES}
    />
  );
}

/* ─── Discount ─── */

const DISCOUNT_CORE: CodeDescriptionRow[] = [
  { code: "C", description: "Discount Permata" },
  { code: "A", description: "Discount Standart 1" },
  { code: "B", description: "Discount Standart 2" },
  { code: "D", description: "Discount Promo Q1" },
  { code: "E", description: "Discount Weekend" },
];

const ALL_DISCOUNTS = withPocRows(DISCOUNT_CORE, 97, "POC Discount");

const DEMO_DISCOUNTS: CodeDescriptionRow[] = [
  ALL_DISCOUNTS.find((r) => r.code === "A")!,
  ALL_DISCOUNTS.find((r) => r.code === "B")!,
  ALL_DISCOUNTS.find((r) => r.code === "C")!,
];

export function ProductDiscountPage() {
  return (
    <CodeDescriptionMasterPage
      pageTitle=":: Table of Discount"
      codeLabel="Discount Code"
      codeInputId="product-discount-code"
      descriptionInputId="product-discount-desc"
      lookupDialogTitle="Table of Discount"
      codeColumnLabel="Discount Code"
      allRows={ALL_DISCOUNTS}
      demoCycle={DEMO_DISCOUNTS}
    />
  );
}
