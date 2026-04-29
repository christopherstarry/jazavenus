import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerLookupDialog } from "./CustomerLookupDialog";

const DIVISION_LABEL = "JAZA VENUS DISTRIBUTION BANDUNG";

type LocationOutletRow = {
  distributionType: string;
  description: string;
};

// POC static data (same style as the legacy popup in your screenshot).
const LOCATION_OUTLET_POC: readonly LocationOutletRow[] = [
  { distributionType: "02", description: "LOKASI TOKO BUKAN DI JALAN UTAMA" },
  { distributionType: "03", description: "LOKASI TOKO DI DALAM PASAR" },
  { distributionType: "01", description: "LOKASI TOKO DI JALAN UTAMA" },
] as const;

export function LocationOutletPage() {
  const [distributionType, setDistributionType] = useState("01");
  const [description, setDescription] = useState("LOKASI TOKO DI JALAN UTAMA");
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <div className="rounded-md border-2 border-border p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">:: Table of Location Outlet</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="location-outlet-dist">Distribution Type</Label>
            <div className="flex gap-2 max-w-xl">
              <Input
                id="location-outlet-dist"
                value={distributionType}
                onChange={(e) => setDistributionType(e.target.value)}
                placeholder="01"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 h-12 w-12"
                onClick={() => setLookupOpen(true)}
              >
                <span className="sr-only">Lookup list</span>
                <MoreHorizontal className="h-5 w-5" aria-hidden />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location-outlet-desc">Description</Label>
            <Input
              id="location-outlet-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Location outlet description"
            />
          </div>
        </div>
      </div>

      <CustomerLookupDialog<LocationOutletRow>
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        title="Table of Location Outlet"
        initialHint={description}
        rows={LOCATION_OUTLET_POC}
        defaultFieldId="description"
        fields={[
          { id: "description", label: "Description", getValue: (r) => r.description },
          { id: "distributionType", label: "Distribution Type", getValue: (r) => r.distributionType },
        ]}
        columns={[
          { header: "Description", getValue: (r) => r.description, align: "left" },
          { header: "Distribution Type", getValue: (r) => r.distributionType, align: "center" },
        ]}
        onSelect={(row) => {
          setDistributionType(row.distributionType);
          setDescription(row.description);
        }}
      />
    </div>
  );
}

