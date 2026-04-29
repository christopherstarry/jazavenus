import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DIVISION_LABEL = "JAZA VENUS DISTRIBUTION BANDUNG";

type PrintMode =
  | "ALL_PRICE_CUT"
  | "ALL_PRICE_CUT_P_CB"
  | "ALL_HET1"
  | "ALL_HET1_P_BL_B"
  | "ALL_HET2"
  | "ALL_HET2_P_BL_B";

/**
 * POC UI for legacy "Master Customer (X)" screen.
 * No backend wiring yet — fields are local state only.
 */
export function MasterCustomerPage() {
  const [customerCode, setCustomerCode] = useState("0000000100");
  const [customerName, setCustomerName] = useState("DIN TIK (P7) / BERKAS SRA");
  const [creditLimit, setCreditLimit] = useState("100,747,312.00");
  const [balance, setBalance] = useState("-100,747,312.00");

  const [address, setAddress] = useState("J.RAYA SADANA-SUBANG CITARI BIATBU");
  const [city, setCity] = useState("PURWAKARTA");
  const [areaCode, setAreaCode] = useState("11");
  const [phone1, setPhone1] = useState("0264-208451");
  const [phone2, setPhone2] = useState("0264-208451");
  const [fax, setFax] = useState("—");
  const [email, setEmail] = useState("—");
  const [contactPerson, setContactPerson] = useState("HRG1");
  const [priceCode, setPriceCode] = useState("—");

  const [locked, setLocked] = useState(false);
  const [printMode, setPrintMode] = useState<PrintMode>("ALL_PRICE_CUT");

  const totalSpendCredit = useMemo(() => creditLimit, [creditLimit]);
  const totalBalance = useMemo(() => balance, [balance]);

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <Card className="w-full min-w-0 max-w-full overflow-hidden">
        <CardContent className="pt-4 pb-4 min-w-0 px-3 sm:px-6">
          <fieldset className="border-2 border-border rounded-[var(--radius)] min-w-0 max-w-full p-3 sm:p-5 space-y-4">
            <legend className="text-base sm:text-lg font-bold px-1 max-w-[calc(100%-0.75rem)]">Master Customer</legend>

            <Tabs defaultValue="main" className="w-full min-w-0 max-w-full pt-1">
              <TabsList className="w-full max-w-full min-w-0 justify-start gap-1 flex-nowrap h-auto p-1 bg-muted/20 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] mb-0 shadow-none rounded-md">
                <TabsTrigger value="main" className="shrink-0 text-xs px-2 py-2.5 whitespace-nowrap sm:text-sm sm:px-3 sm:py-3">
                  Main Information
                </TabsTrigger>
                <TabsTrigger value="secondary" className="shrink-0 text-xs px-2 py-2.5 whitespace-nowrap sm:text-sm sm:px-3 sm:py-3">
                  Secondary Information
                </TabsTrigger>
                <TabsTrigger value="address" className="shrink-0 text-xs px-2 py-2.5 whitespace-nowrap sm:text-sm sm:px-3 sm:py-3">
                  Customer Address
                </TabsTrigger>
                <TabsTrigger value="cust-brand" className="shrink-0 text-xs px-2 py-2.5 whitespace-nowrap sm:text-sm sm:px-3 sm:py-3">
                  Cust / Brand
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-12 mt-4 min-w-0">
              <div className="lg:col-span-7 min-w-0 space-y-3">
                <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-code">Customer Code *</Label>
                    <Input id="cust-code" value={customerCode} onChange={(e) => setCustomerCode(e.target.value)} className="w-full max-w-full min-w-0" />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-name">Customer Name</Label>
                    <Input id="cust-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full max-w-full min-w-0" />
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-credit">Credit Limit</Label>
                    <Input id="cust-credit" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} className="w-full max-w-full min-w-0 tabular-nums" />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-balance">Balance</Label>
                    <Input id="cust-balance" value={balance} onChange={(e) => setBalance(e.target.value)} className="w-full max-w-full min-w-0 tabular-nums" />
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <Label htmlFor="cust-address">Address</Label>
                  <Input id="cust-address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full max-w-full min-w-0" />
                </div>

                <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-city">City</Label>
                    <Input id="cust-city" value={city} onChange={(e) => setCity(e.target.value)} className="w-full max-w-full min-w-0" />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-area-section">Area Code *</Label>
                    <div className="flex gap-2 w-full min-w-0 items-stretch">
                      <Input
                        id="cust-area-section"
                        value={areaCode}
                        onChange={(e) => setAreaCode(e.target.value)}
                        placeholder="Area code"
                        autoComplete="off"
                        className="min-w-0 flex-1 max-w-full"
                      />
                      <Button type="button" variant="outline" className="h-11 shrink-0 px-3" aria-label="Lookup area">
                        ...
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-phone1">Phone 1</Label>
                    <Input id="cust-phone1" value={phone1} onChange={(e) => setPhone1(e.target.value)} className="w-full max-w-full min-w-0" />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-phone2">Phone 2</Label>
                    <Input id="cust-phone2" value={phone2} onChange={(e) => setPhone2(e.target.value)} className="w-full max-w-full min-w-0" />
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-fax">Fax</Label>
                    <Input id="cust-fax" value={fax} onChange={(e) => setFax(e.target.value)} className="w-full max-w-full min-w-0" />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-email">Email</Label>
                    <Input id="cust-email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full max-w-full min-w-0" />
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-contact">Contact Person</Label>
                    <Input id="cust-contact" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full max-w-full min-w-0" />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="cust-price-code">Price Code</Label>
                    <Input id="cust-price-code" value={priceCode} onChange={(e) => setPriceCode(e.target.value)} className="w-full max-w-full min-w-0" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    checked={locked}
                    onChange={(e) => setLocked(e.target.checked)}
                    className="h-5 w-5 rounded border-2 border-input accent-primary shrink-0"
                    id="cust-locked"
                  />
                  <Label htmlFor="cust-locked" className="text-base font-semibold">
                    Locked
                  </Label>
                </div>
              </div>

              <div className="lg:col-span-5 min-w-0 space-y-4">
                <div className="rounded-md border-2 border-border p-3 space-y-2 min-w-0">
                  <div className="text-sm font-semibold">Summary</div>
                  <div className="flex flex-col gap-1 min-w-0 sm:flex-row sm:justify-between sm:items-baseline sm:gap-3">
                    <span className="text-sm text-muted-foreground shrink-0">Total Spend Credit</span>
                    <span className="text-sm font-semibold tabular-nums text-right break-all min-w-0">{totalSpendCredit}</span>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 sm:flex-row sm:justify-between sm:items-baseline sm:gap-3">
                    <span className="text-sm text-muted-foreground shrink-0">Total Balance</span>
                    <span className="text-sm font-semibold tabular-nums text-right break-all min-w-0">{totalBalance}</span>
                  </div>
                </div>

                <div className="rounded-md border-2 border-border p-3 space-y-2">
                  <div className="text-sm font-semibold">Print Mode</div>
                  <div className="grid gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={printMode === "ALL_PRICE_CUT"} onChange={() => setPrintMode("ALL_PRICE_CUT")} />
                      <span className="text-sm">All Price Cut</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={printMode === "ALL_PRICE_CUT_P_CB"}
                        onChange={() => setPrintMode("ALL_PRICE_CUT_P_CB")}
                      />
                      <span className="text-sm">All Price Cut (P/C/B)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={printMode === "ALL_HET1"} onChange={() => setPrintMode("ALL_HET1")} />
                      <span className="text-sm">All HET1</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={printMode === "ALL_HET1_P_BL_B"}
                        onChange={() => setPrintMode("ALL_HET1_P_BL_B")}
                      />
                      <span className="text-sm">All HET1 (P/BL/B)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={printMode === "ALL_HET2"} onChange={() => setPrintMode("ALL_HET2")} />
                      <span className="text-sm">All HET2</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={printMode === "ALL_HET2_P_BL_B"}
                        onChange={() => setPrintMode("ALL_HET2_P_BL_B")}
                      />
                      <span className="text-sm">All HET2 (P/BL/B)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </fieldset>
        </CardContent>
      </Card>
    </div>
  );
}

