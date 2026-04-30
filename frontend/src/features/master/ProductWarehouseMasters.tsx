import { CodeDescriptionMasterPage } from "#/features/common/CodeDescriptionMasterPage";
import type { CodeDescriptionRow } from "#/features/common/CodeDescriptionMasterPage";

function withPocRows(base: CodeDescriptionRow[], extra: number, label: string): CodeDescriptionRow[] {
  const out = [...base];
  for (let i = 1; i <= extra; i++) {
    out.push({
      code: `${String(base.length + i).padStart(3, "0")}`,
      description: `${label} ${String(i).padStart(3, "0")}`,
    });
  }
  return out;
}

/* ─── Warehouse Type ─── */

const WH_TYPE_CORE: CodeDescriptionRow[] = [
  { code: "0", description: "Main" },
  { code: "1", description: "Return" },
  { code: "3", description: "Consignment" },
  { code: "2", description: "Transit" },
];

export const ALL_WH_TYPES = withPocRows(WH_TYPE_CORE, 94, "POC Warehouse type");

const DEMO_WH_TYPES = [
  ALL_WH_TYPES.find((r) => r.code === "0")!,
  ALL_WH_TYPES.find((r) => r.code === "1")!,
  ALL_WH_TYPES.find((r) => r.code === "3")!,
];

export function WarehouseTypePage() {
  return (
    <CodeDescriptionMasterPage
      pageTitle=":: Table of Warehouse Type"
      codeLabel="Warehouse Type"
      codeInputId="wh-type-code"
      descriptionInputId="wh-type-desc"
      lookupDialogTitle="Table of Warehouse Type"
      codeColumnLabel="Code"
      allRows={ALL_WH_TYPES}
      demoCycle={DEMO_WH_TYPES}
      checkboxLabel="Check On Hand in Consignment"
    />
  );
}

/* ─── Unit of Measure ─── */

const UOM_CORE: CodeDescriptionRow[] = [
  { code: "2", description: "PCS" },
  { code: "48", description: "BAG" },
  { code: "7", description: "BOX" },
  { code: "57", description: "KRT" },
  { code: "20", description: "LMBR" },
  { code: "01", description: "UNIT" },
  { code: "03", description: "KG" },
];

const ALL_UOMS = withPocRows(UOM_CORE, 95, "POC UOM");

const DEMO_UOMS = [
  ALL_UOMS.find((r) => r.code === "2")!,
  ALL_UOMS.find((r) => r.code === "48")!,
  ALL_UOMS.find((r) => r.code === "7")!,
];

export function UnitOfMeasurePage() {
  return (
    <CodeDescriptionMasterPage
      pageTitle=":: Table of Master UOM"
      codeLabel="Unit of Measure"
      codeInputId="uom-code"
      descriptionInputId="uom-desc"
      lookupDialogTitle="Master Unit Of Measure"
      codeColumnLabel="UOM"
      allRows={ALL_UOMS}
      demoCycle={DEMO_UOMS}
    />
  );
}
