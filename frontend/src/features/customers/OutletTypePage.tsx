import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerLookupDialog } from "./CustomerLookupDialog";

const DIVISION_LABEL = "JAZA VENUS DISTRIBUTION BANDUNG";

type OutletTypeRow = {
  outletType: string;
  description: string;
};

// POC static data — based on screenshot layout (values can be refined later).
const OUTLET_TYPE_POC: readonly OutletTypeRow[] = [
  { outletType: "01", description: "ONLINE SHOP" },
  { outletType: "02", description: "OUTLET HORECA" },
  { outletType: "03", description: "OFFLINE SHOP" },
  { outletType: "04", description: "OUTLET TRADITIONAL" },
  { outletType: "05", description: "OUTLET MODERN" },
] as const;

export function OutletTypePage() {
  const [outletType, setOutletType] = useState("01");
  const [description, setDescription] = useState("ONLINE SHOP");
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <div className="rounded-md border-2 border-border p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">:: Table of Outlet Type</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="outlet-type-code">Outlet Type</Label>
            <div className="flex gap-2 max-w-xl">
              <Input
                id="outlet-type-code"
                value={outletType}
                onChange={(e) => setOutletType(e.target.value)}
                placeholder="01"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 h-12 w-12"
                title="Open outlet type list"
                onClick={() => setLookupOpen(true)}
              >
                <span className="sr-only">Lookup list</span>
                <MoreHorizontal className="h-5 w-5" aria-hidden />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outlet-type-desc">Description</Label>
            <Input
              id="outlet-type-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outlet type description"
            />
          </div>
        </div>
      </div>

      <CustomerLookupDialog<OutletTypeRow>
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        title="Table of Outlet Type"
        initialHint={description}
        rows={OUTLET_TYPE_POC}
        defaultFieldId="description"
        fields={[
          { id: "description", label: "Description", getValue: (r) => r.description },
          { id: "outletType", label: "Outlet Type", getValue: (r) => r.outletType },
        ]}
        columns={[
          { header: "Description", getValue: (r) => r.description, align: "left" },
          { header: "Outlet Type", getValue: (r) => r.outletType, align: "center" },
        ]}
        onSelect={(row) => {
          setOutletType(row.outletType);
          setDescription(row.description);
        }}
      />
    </div>
  );
}

