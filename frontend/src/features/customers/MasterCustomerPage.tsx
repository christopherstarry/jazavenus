import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "#/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "#/components/ui/table";
import { cn } from "#/lib/utils";

const DIVISION_LABEL = "JAZA VENUS DISTRIBUTION BANDUNG";

type PrintMode =
  | "ALL_PRICE_CUT"
  | "ALL_PRICE_CUT_P_CB"
  | "ALL_HET1"
  | "ALL_HET1_P_BL_B"
  | "ALL_HET2"
  | "ALL_HET2_P_BL_B";

type AddressRow = {
  id: string;
  addCode: string;
  addressName: string;
  address: string;
  city: string;
  areaCode: string;
  postalCode: string;
};

type DiscBrandRow = {
  id: string;
  brandCode: string;
  brandName: string;
  discount: string;
  discount2: string;
  priceCode: string;
};

function newId(): string {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * POC UI for legacy "Master Customer (X)" screen.
 * Main Information layout is frozen; Secondary / Customer Address / Disc. Brand evolve separately.
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

  /* ─── Secondary Information ─── */
  const [registerDate, setRegisterDate] = useState("2012-11-13");
  const [termCodeDays, setTermCodeDays] = useState("0");
  const [notes, setNotes] = useState("");
  const [npwpNumber, setNpwpNumber] = useState("");
  const [npwpDate, setNpwpDate] = useState("");
  const [pkpNumber, setPkpNumber] = useState("");
  const [pkpDate, setPkpDate] = useState("");
  const [locationOutlet, setLocationOutlet] = useState("");
  const LOCATION_OUTLET_LABEL_PREVIEW = "TOKO KELONTONG";
  const [openCustBy, setOpenCustBy] = useState("");
  const [classOutlet, setClassOutlet] = useState("");
  const CLASS_OUTLET_LABEL_PREVIEW = "RETAILER";
  const [marketType, setMarketType] = useState("");
  const [outletType, setOutletType] = useState("");
  const [channelOutlet, setChannelOutlet] = useState("");
  const [groupOutlet, setGroupOutlet] = useState("");

  /* ─── Customer Address (multi-line grid) ─── */
  const [addressRows, setAddressRows] = useState<AddressRow[]>(() => [
    {
      id: newId(),
      addCode: "01",
      addressName: "MAIN",
      address: "JL. CONT CONTOH CONTO 1",
      city: "KOTA BANDUNG",
      areaCode: "BDG",
      postalCode: "40111",
    },
    {
      id: newId(),
      addCode: "02",
      addressName: "INVOICE",
      address: "JL. SAMPLE ALAM — LOK PENAGIHAN",
      city: "BANDUNG BARAT",
      areaCode: "BDG-W",
      postalCode: "40559",
    },
  ]);

  /* ─── Disc. Brand ─── */
  const [discBrandRows, setDiscBrandRows] = useState<DiscBrandRow[]>(() => [
    { id: newId(), brandCode: "ADS", brandName: "ADIDAS", discount: ".00", discount2: ".00", priceCode: "HRG2" },
    { id: newId(), brandCode: "E6", brandName: "BLACK PLUS", discount: "1.00", discount2: "15.00", priceCode: "HRG1" },
    { id: newId(), brandCode: "cmy", brandName: "CIMORY", discount: "3.00", discount2: ".00", priceCode: "HRG1" },
    { id: newId(), brandCode: "CSN", brandName: "CUSSONS", discount: ".00", discount2: "15.00", priceCode: "HRG3" },
    { id: newId(), brandCode: "DI", brandName: "RIVERA", discount: "20.00", discount2: ".00", priceCode: "HRG1" },
  ]);

  const totalSpendCredit = useMemo(() => creditLimit, [creditLimit]);
  const totalBalance = useMemo(() => balance, [balance]);

  function upsertAddressRow(id: string, patch: Partial<AddressRow>) {
    setAddressRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function upsertDiscRow(id: string, patch: Partial<DiscBrandRow>) {
    setDiscBrandRows((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  /** Tab strip sits directly under the fieldset legend (top of panel), matching default TabsList underline. */
  const customerTabsListClass = cn(
    "mb-4 mt-2 w-full max-w-full min-w-0 justify-start gap-1 flex-nowrap overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]",
    "h-auto rounded-md bg-muted/20 p-1 shadow-none",
  );

  return (
    <div className="space-y-4 w-full min-w-0 max-w-full">
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <Card className="w-full min-w-0 max-w-full overflow-hidden">
        <CardContent className="pt-4 pb-4 min-w-0 px-3 sm:px-6">
          <Tabs defaultValue="main" className="w-full min-w-0 max-w-full">
            <fieldset className="border-2 border-border rounded-[var(--radius)] min-w-0 max-w-full p-3 sm:p-5 space-y-0">
              <legend className="text-base sm:text-lg font-bold px-1 mb-0 max-w-[calc(100%-0.75rem)]">
                Master Customer
              </legend>

              <TabsList className={customerTabsListClass} aria-label="Master Customer sections">
                <TabsTrigger value="main" className="shrink-0 whitespace-nowrap text-xs px-3 py-2.5 sm:text-sm">
                  Main Information
                </TabsTrigger>
                <TabsTrigger value="secondary" className="shrink-0 whitespace-nowrap text-xs px-3 py-2.5 sm:text-sm">
                  Secondary Information
                </TabsTrigger>
                <TabsTrigger value="address" className="shrink-0 whitespace-nowrap text-xs px-3 py-2.5 sm:text-sm">
                  Customer Address
                </TabsTrigger>
                <TabsTrigger value="disc-brand" className="shrink-0 whitespace-nowrap text-xs px-3 py-2.5 sm:text-sm">
                  Disc. Brand
                </TabsTrigger>
              </TabsList>

              <TabsContent value="main" className="mt-4 mb-0 space-y-0 focus-visible:outline-none">
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-12 min-w-0">
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
              </TabsContent>

              <TabsContent value="secondary" className="mt-4 mb-0 focus-visible:outline-none">
                <div className="space-y-6 min-w-0">
                  <p className="text-sm text-muted-foreground">
                    Registration dates, taxation, outlet classification — separated from Main Information for clearer entry.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="sec-register-date">Register Date</Label>
                      <Input id="sec-register-date" type="date" value={registerDate} onChange={(e) => setRegisterDate(e.target.value)} className="tabular-nums" />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="sec-term">Term Code (Hari)</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="sec-term"
                          value={termCodeDays}
                          onChange={(e) => setTermCodeDays(e.target.value)}
                          className="tabular-nums min-w-0 flex-1"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Hari</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="sec-notes">Notes</Label>
                    <textarea
                      id="sec-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="flex w-full min-w-0 rounded-md border-2 border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="sec-npwp">NPWP Number</Label>
                      <Input id="sec-npwp" value={npwpNumber} onChange={(e) => setNpwpNumber(e.target.value)} />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="sec-npwp-d">NPWP Date</Label>
                      <Input id="sec-npwp-d" type="date" value={npwpDate} onChange={(e) => setNpwpDate(e.target.value)} />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="sec-pkp">PKP Number</Label>
                      <Input id="sec-pkp" value={pkpNumber} onChange={(e) => setPkpNumber(e.target.value)} />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="sec-pkp-d">PKP Date</Label>
                      <Input id="sec-pkp-d" type="date" value={pkpDate} onChange={(e) => setPkpDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="rounded-md border-2 border-dashed border-border/80 p-4 space-y-4 bg-muted/20">
                    <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                      Outlet &amp; classification
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 min-w-0">
                      <div className="space-y-2 min-w-0 sm:col-span-2 lg:col-span-1">
                        <Label htmlFor="sec-loc">Location Outlet</Label>
                        <div className="flex gap-2">
                          <Input id="sec-loc" value={locationOutlet} onChange={(e) => setLocationOutlet(e.target.value)} className="min-w-0 flex-1" />
                          <Button type="button" variant="outline" className="shrink-0 px-3" aria-label="Lookup location outlet">
                            ...
                          </Button>
                        </div>
                        {LOCATION_OUTLET_LABEL_PREVIEW && (
                          <p className="text-xs text-muted-foreground truncate" title={LOCATION_OUTLET_LABEL_PREVIEW}>
                            {LOCATION_OUTLET_LABEL_PREVIEW}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 min-w-0">
                        <Label htmlFor="sec-open">Open Cust By</Label>
                        <div className="flex gap-2">
                          <Input id="sec-open" value={openCustBy} onChange={(e) => setOpenCustBy(e.target.value)} className="min-w-0 flex-1" />
                          <Button type="button" variant="outline" className="shrink-0 px-3">
                            ...
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 min-w-0">
                        <Label htmlFor="sec-class">Class Outlet</Label>
                        <div className="flex gap-2">
                          <Input id="sec-class" value={classOutlet} onChange={(e) => setClassOutlet(e.target.value)} className="min-w-0 flex-1" />
                          <Button type="button" variant="outline" className="shrink-0 px-3">
                            ...
                          </Button>
                        </div>
                        {CLASS_OUTLET_LABEL_PREVIEW && (
                          <p className="text-xs text-muted-foreground truncate">{CLASS_OUTLET_LABEL_PREVIEW}</p>
                        )}
                      </div>
                      <div className="space-y-2 min-w-0">
                        <Label htmlFor="sec-market">Market Type (X)</Label>
                        <div className="flex gap-2">
                          <Input id="sec-market" value={marketType} onChange={(e) => setMarketType(e.target.value)} className="min-w-0 flex-1" />
                          <Button type="button" variant="outline" className="shrink-0 px-3">
                            ...
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 min-w-0">
                        <Label htmlFor="sec-outlet-type">Outlet Type</Label>
                        <div className="flex gap-2">
                          <Input id="sec-outlet-type" value={outletType} onChange={(e) => setOutletType(e.target.value)} className="min-w-0 flex-1" />
                          <Button type="button" variant="outline" className="shrink-0 px-3">
                            ...
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 min-w-0">
                        <Label htmlFor="sec-channel">Channel Outlet</Label>
                        <div className="flex gap-2">
                          <Input id="sec-channel" value={channelOutlet} onChange={(e) => setChannelOutlet(e.target.value)} className="min-w-0 flex-1" />
                          <Button type="button" variant="outline" className="shrink-0 px-3">
                            ...
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 min-w-0">
                        <Label htmlFor="sec-group">Group Outlet</Label>
                        <div className="flex gap-2">
                          <Input id="sec-group" value={groupOutlet} onChange={(e) => setGroupOutlet(e.target.value)} className="min-w-0 flex-1" />
                          <Button type="button" variant="outline" className="shrink-0 px-3">
                            ...
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="address" className="mt-4 mb-0 focus-visible:outline-none">
                <div className="space-y-3 min-w-0">
                  <p className="text-sm font-medium">
                    Customer Address <span className="text-muted-foreground font-normal">— multiple rows per outlet / invoice address</span>
                  </p>
                  <div className="min-w-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-10 whitespace-nowrap pl-3 pr-2" />
                          <TableHead>Add. Code</TableHead>
                          <TableHead>Address Name *</TableHead>
                          <TableHead className="min-w-[12rem]">Address *</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Area</TableHead>
                          <TableHead>Postal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {addressRows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="py-2 pl-2 pr-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                aria-label={`Remove address ${row.addressName}`}
                                onClick={() => setAddressRows((r) => r.filter((x) => x.id !== row.id))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={row.addCode}
                                onChange={(e) => upsertAddressRow(row.id, { addCode: e.target.value })}
                                className="h-10 min-w-[4rem]"
                                aria-label="Address code"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={row.addressName}
                                onChange={(e) => upsertAddressRow(row.id, { addressName: e.target.value })}
                                className="h-10 min-w-[6rem]"
                                aria-label="Address name"
                              />
                            </TableCell>
                            <TableCell className="p-2 min-w-[14rem]">
                              <Input
                                value={row.address}
                                onChange={(e) => upsertAddressRow(row.id, { address: e.target.value })}
                                className="h-10 w-full max-w-xl"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={row.city}
                                onChange={(e) => upsertAddressRow(row.id, { city: e.target.value })}
                                className="h-10 min-w-[8rem]"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={row.areaCode}
                                onChange={(e) => upsertAddressRow(row.id, { areaCode: e.target.value })}
                                className="h-10 min-w-[4rem]"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={row.postalCode}
                                onChange={(e) => upsertAddressRow(row.id, { postalCode: e.target.value })}
                                className="h-10 min-w-[5rem] tabular-nums"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground max-w-prose">
                      <span className="font-semibold text-foreground">Tip:</span> Select a grid row and use{" "}
                      <kbd className="rounded border border-border bg-muted px-1 font-mono text-[0.65rem]">Insert</kbd> /{" "}
                      <kbd className="rounded border border-border bg-muted px-1 font-mono text-[0.65rem]">Delete</kbd> keys when wired to shortcuts — or use the buttons.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() =>
                        setAddressRows((r) => [
                          ...r,
                          {
                            id: newId(),
                            addCode: "",
                            addressName: "",
                            address: "",
                            city: "",
                            areaCode: "",
                            postalCode: "",
                          },
                        ])
                      }
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      Add row
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="disc-brand" className="mt-4 mb-0 focus-visible:outline-none">
                <div className="space-y-3 min-w-0">
                  <p className="text-sm font-medium">
                    Disc. Brand <span className="text-muted-foreground font-normal">— discounts &amp; price list per brand</span>
                  </p>
                  <div className="min-w-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-10 pl-3 pr-2" />
                          <TableHead>Brand Code *</TableHead>
                          <TableHead>Brand Name</TableHead>
                          <TableHead className="tabular-nums text-right">Discount</TableHead>
                          <TableHead className="tabular-nums text-right">Discount2</TableHead>
                          <TableHead>Price Code</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {discBrandRows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="py-2 pl-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                aria-label={`Remove brand row ${row.brandCode}`}
                                onClick={() => setDiscBrandRows((r) => r.filter((x) => x.id !== row.id))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={row.brandCode}
                                onChange={(e) => upsertDiscRow(row.id, { brandCode: e.target.value })}
                                className="h-10 min-w-[5rem]"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={row.brandName}
                                onChange={(e) => upsertDiscRow(row.id, { brandName: e.target.value })}
                                className="h-10 min-w-[10rem]"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={row.discount}
                                onChange={(e) => upsertDiscRow(row.id, { discount: e.target.value })}
                                className="h-10 min-w-[5rem] text-right tabular-nums"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={row.discount2}
                                onChange={(e) => upsertDiscRow(row.id, { discount2: e.target.value })}
                                className="h-10 min-w-[5rem] text-right tabular-nums"
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <Input
                                value={row.priceCode}
                                onChange={(e) => upsertDiscRow(row.id, { priceCode: e.target.value })}
                                className="h-10 min-w-[5rem]"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() =>
                      setDiscBrandRows((r) => [
                        ...r,
                        { id: newId(), brandCode: "", brandName: "", discount: "", discount2: "", priceCode: "" },
                      ])
                    }
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Add brand line
                  </Button>
                </div>
              </TabsContent>
            </fieldset>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
