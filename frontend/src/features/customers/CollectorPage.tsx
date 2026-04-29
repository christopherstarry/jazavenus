import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerLookupDialog } from "./CustomerLookupDialog";

const DIVISION_LABEL = "JAZA VENUS DISTRIBUTION BANDUNG";

type CollectorRow = {
  collectorCode: string;
  collectorName: string;
};

// POC dataset — exact values can be refined later.
const COLLECTOR_POC: readonly CollectorRow[] = [
  { collectorCode: "01", collectorName: "COLLECTOR A" },
  { collectorCode: "02", collectorName: "COLLECTOR B" },
  { collectorCode: "03", collectorName: "COLLECTOR C" },
] as const;

export function CollectorPage() {
  const [collectorCode, setCollectorCode] = useState("01");
  const [collectorName, setCollectorName] = useState("COLLECTOR A");
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <div className="rounded-md border-2 border-border p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">:: Table of Collector</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="collector-code">Collector Code</Label>
            <div className="flex gap-2 max-w-xl">
              <Input
                id="collector-code"
                value={collectorCode}
                onChange={(e) => setCollectorCode(e.target.value)}
                placeholder="01"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 h-12 w-12"
                title="Open collector list"
                onClick={() => setLookupOpen(true)}
              >
                <span className="sr-only">Lookup list</span>
                <MoreHorizontal className="h-5 w-5" aria-hidden />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collector-name">Collector Name</Label>
            <Input
              id="collector-name"
              value={collectorName}
              onChange={(e) => setCollectorName(e.target.value)}
              placeholder="Collector name"
            />
          </div>
        </div>
      </div>

      <CustomerLookupDialog<CollectorRow>
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        title="Table of Collector"
        initialHint={collectorName}
        rows={COLLECTOR_POC}
        defaultFieldId="collectorName"
        fields={[
          { id: "collectorName", label: "Collector Name", getValue: (r) => r.collectorName },
          { id: "collectorCode", label: "Collector Code", getValue: (r) => r.collectorCode },
        ]}
        columns={[
          { header: "Collector Name", getValue: (r) => r.collectorName, align: "left" },
          { header: "Collector Code", getValue: (r) => r.collectorCode, align: "center" },
        ]}
        onSelect={(row) => {
          setCollectorCode(row.collectorCode);
          setCollectorName(row.collectorName);
        }}
      />
    </div>
  );
}

