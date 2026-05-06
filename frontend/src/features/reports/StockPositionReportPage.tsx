import { useId, useState } from "react";
import { Button } from "#/components/ui/button";
import { CodeBrowseRow, LegacySalesReportChrome } from "#/features/reports/legacySalesReportChrome";
import { LegacyReportBeigePanel } from "#/features/reports/LegacyReportBeigePanel";

type StockDimension = "by-product" | "by-brand" | "by-division" | "by-principle";

/** Legacy Stock Position Report — Brand / Supplier / Warehouse + option radios + Update Data note. */
export function StockPositionReportPage() {
  const uid = useId();
  const noop = () => {};

  const [brand, setBrand] = useState("");
  const [brandDesc, setBrandDesc] = useState("");
  const [brandAll, setBrandAll] = useState(false);

  const [supplier, setSupplier] = useState("");
  const [supplierDesc, setSupplierDesc] = useState("");
  const [supplierAll, setSupplierAll] = useState(false);

  const [warehouse, setWarehouse] = useState("");
  const [warehouseDesc, setWarehouseDesc] = useState("");
  const [warehouseAll, setWarehouseAll] = useState(false);

  const [dimension, setDimension] = useState<StockDimension>("by-principle");

  return (
    <LegacySalesReportChrome toolbarVariant="transaction" onPreviousForm={noop} onNextForm={noop}>
      <LegacyReportBeigePanel title="Stock Position Report" footerNote="POC: Update Data / Execute are not wired yet.">
        <CodeBrowseRow
          label="Brand"
          inputId={`spr-brand-${uid}`}
          value={brand}
          onChange={setBrand}
          description={brandDesc}
          onDescriptionChange={setBrandDesc}
          allChecked={brandAll}
          onAllChange={setBrandAll}
          showAll
          allCheckboxLabel="All Brand"
        />
        <CodeBrowseRow
          label="Supplier"
          inputId={`spr-supplier-${uid}`}
          value={supplier}
          onChange={setSupplier}
          description={supplierDesc}
          onDescriptionChange={setSupplierDesc}
          allChecked={supplierAll}
          onAllChange={setSupplierAll}
          showAll
          allCheckboxLabel="All Supplier"
        />
        <CodeBrowseRow
          label="Warehouse Code"
          inputId={`spr-wh-${uid}`}
          value={warehouse}
          onChange={setWarehouse}
          description={warehouseDesc}
          onDescriptionChange={setWarehouseDesc}
          allChecked={warehouseAll}
          onAllChange={setWarehouseAll}
          showAll
          allCheckboxLabel="All Gudang"
        />

        <fieldset className="space-y-2 rounded-md border-2 border-border bg-background/60 px-3 py-2 dark:bg-background/40">
          <legend className="px-1 text-xs font-semibold text-muted-foreground">Option Report</legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {(
              [
                ["by-product", "By Product"],
                ["by-brand", "By Brand"],
                ["by-division", "By Division"],
                ["by-principle", "By Principle"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="radio"
                  name={`spr-opt-${uid}`}
                  checked={dimension === value}
                  onChange={() => setDimension(value)}
                  className="h-4 w-4 border-2 border-input accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <p className="text-sm font-medium leading-snug text-destructive">
          Note : Lakukan Update Data Sebelum Mengeluarkan Laporan Posisi Stock
        </p>

        <Button type="button" variant="outline" size="sm" className="border-2 font-semibold" disabled>
          Update Data
        </Button>

        <div
          className="min-h-[min(35vh,18rem)] rounded-md border-2 border-[#C9C5BA] bg-[#E8E4D9] dark:border-border dark:bg-muted/15"
          aria-hidden
        />
      </LegacyReportBeigePanel>
    </LegacySalesReportChrome>
  );
}
