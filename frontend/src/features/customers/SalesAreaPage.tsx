import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerLookupDialog } from "./CustomerLookupDialog";

const DIVISION_LABEL = "JAZA VENUS DISTRIBUTION BANDUNG";

type SalesAreaRow = {
  salesAreaCode: string;
  description: string;
};

// POC dataset from screenshot popup (approx; refine later).
const SALES_AREA_POC: readonly SalesAreaRow[] = [
  { salesAreaCode: "01", description: "BANDUNG TIMUR" },
  { salesAreaCode: "02", description: "BANDUNG UTARA" },
  { salesAreaCode: "03", description: "BANDUNG BARAT" },
  { salesAreaCode: "04", description: "BANDUNG SELATAN" },
  { salesAreaCode: "05", description: "CIAWI" },
] as const;

export function SalesAreaPage() {
  const [salesAreaCode, setSalesAreaCode] = useState("01");
  const [description, setDescription] = useState("BANDUNG TIMUR");
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <div className="rounded-md border-2 border-border p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">:: Table of Sales Area</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sales-area-code">Sales Area</Label>
            <div className="flex gap-2 max-w-xl">
              <Input
                id="sales-area-code"
                value={salesAreaCode}
                onChange={(e) => setSalesAreaCode(e.target.value)}
                placeholder="01"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 h-12 w-12"
                title="Open sales area list"
                onClick={() => setLookupOpen(true)}
              >
                <span className="sr-only">Lookup list</span>
                <MoreHorizontal className="h-5 w-5" aria-hidden />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sales-area-desc">Description</Label>
            <Input
              id="sales-area-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sales area description"
            />
          </div>
        </div>
      </div>

      <CustomerLookupDialog<SalesAreaRow>
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        title="Table of Sales Area"
        initialHint={description}
        rows={SALES_AREA_POC}
        defaultFieldId="description"
        fields={[
          { id: "description", label: "Description", getValue: (r) => r.description },
          { id: "salesAreaCode", label: "Sales Area", getValue: (r) => r.salesAreaCode },
        ]}
        columns={[
          { header: "Description", getValue: (r) => r.description, align: "left" },
          { header: "Area Code", getValue: (r) => r.salesAreaCode, align: "center" },
        ]}
        onSelect={(row) => {
          setSalesAreaCode(row.salesAreaCode);
          setDescription(row.description);
        }}
      />
    </div>
  );
}

