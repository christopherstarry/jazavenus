import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerLookupDialog } from "./CustomerLookupDialog";

const DIVISION_LABEL = "JAZA VENUS DISTRIBUTION BANDUNG";

type MarketTypeRow = {
  marketType: string;
  description: string;
};

// POC static data (from screenshot popup + main field).
const MARKET_TYPE_POC: readonly MarketTypeRow[] = [
  { marketType: "01", description: "MODERN TRADE" },
  { marketType: "02", description: "GENERAL TRADE" },
  { marketType: "03", description: "OTHERS TRADE" },
  { marketType: "04", description: "SALON" },
] as const;

export function MarketTypePage() {
  const [marketType, setMarketType] = useState("01");
  const [description, setDescription] = useState("MODERN TRADE");
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <div className="rounded-md border-2 border-border p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">:: Table of Market Type</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="market-type-code">Market Type</Label>
            <div className="flex gap-2 max-w-xl">
              <Input
                id="market-type-code"
                value={marketType}
                onChange={(e) => setMarketType(e.target.value)}
                placeholder="01"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 h-12 w-12"
                title="Open market type list"
                onClick={() => setLookupOpen(true)}
              >
                <MoreHorizontal className="h-5 w-5" aria-hidden />
                <span className="sr-only">Lookup list</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="market-type-description">Description</Label>
            <Input
              id="market-type-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Market type description"
            />
          </div>
        </div>
      </div>

      <CustomerLookupDialog<MarketTypeRow>
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        title="Table of Market Type"
        initialHint={description}
        rows={MARKET_TYPE_POC}
        defaultFieldId="description"
        fields={[
          { id: "description", label: "Description", getValue: (r) => r.description },
          { id: "marketType", label: "Market Type", getValue: (r) => r.marketType },
        ]}
        columns={[
          { header: "Description", getValue: (r) => r.description, align: "left" },
          { header: "Trade Type", getValue: (r) => r.marketType, align: "center" },
        ]}
        onSelect={(row) => {
          setMarketType(row.marketType);
          setDescription(row.description);
        }}
      />
    </div>
  );
}

