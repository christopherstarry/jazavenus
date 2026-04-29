import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerLookupDialog } from "./CustomerLookupDialog";

const DIVISION_LABEL = "JAZA VENUS DISTRIBUTION BANDUNG";

type SalesmanRow = {
  salesmanCode: string;
  salesmanName: string;
};

// POC dataset (from screenshot; can be refined once you confirm exact list).
const SALESMAN_POC: readonly SalesmanRow[] = [
  { salesmanCode: "0831156028", salesmanName: "HERIYANTO" },
  { salesmanCode: "24", salesmanName: "ABDU PARAGIMB" },
  { salesmanCode: "30", salesmanName: "ACEP NURBHA" },
  { salesmanCode: "73", salesmanName: "ADE CMY" },
  { salesmanCode: "52", salesmanName: "ADIT COTY" },
  { salesmanCode: "40", salesmanName: "AGUNG DJAGO" },
  { salesmanCode: "50", salesmanName: "AGUS-COMERY" },
  { salesmanCode: "21", salesmanName: "ALDI AMY" },
] as const;

export function SalesmanPage() {
  const [salesmanCode, setSalesmanCode] = useState("0831156028");
  const [salesmanName, setSalesmanName] = useState("HERIYANTO");
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <div className="rounded-md border-2 border-border p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">:: Table of Salesman</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="salesman-code">Salesman Code</Label>
            <div className="flex gap-2 max-w-xl">
              <Input
                id="salesman-code"
                value={salesmanCode}
                onChange={(e) => setSalesmanCode(e.target.value)}
                placeholder="Salesman code"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 h-12 w-12"
                title="Open salesman list"
                onClick={() => setLookupOpen(true)}
              >
                <span className="sr-only">Lookup list</span>
                <MoreHorizontal className="h-5 w-5" aria-hidden />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salesman-name">Salesman Name</Label>
            <Input
              id="salesman-name"
              value={salesmanName}
              onChange={(e) => setSalesmanName(e.target.value)}
              placeholder="Salesman name"
            />
          </div>
        </div>
      </div>

      <CustomerLookupDialog<SalesmanRow>
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        title="Table of Salesman"
        initialHint={salesmanName}
        rows={SALESMAN_POC}
        defaultFieldId="salesmanName"
        fields={[
          { id: "salesmanName", label: "Salesman Name", getValue: (r) => r.salesmanName },
          { id: "salesmanCode", label: "Salesman Code", getValue: (r) => r.salesmanCode },
        ]}
        columns={[
          { header: "Salesman Name", getValue: (r) => r.salesmanName, align: "left" },
          { header: "Salesman Code", getValue: (r) => r.salesmanCode, align: "center" },
        ]}
        onSelect={(row) => {
          setSalesmanCode(row.salesmanCode);
          setSalesmanName(row.salesmanName);
        }}
      />
    </div>
  );
}

