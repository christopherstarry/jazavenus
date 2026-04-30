import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  MoreHorizontal,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table";
import { cn } from "#/lib/utils";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";
import {
  LOOKUP_DEFAULT_PAGE_SIZE,
  LOOKUP_DIALOG_CONTENT_CLASS,
  LOOKUP_DIALOG_SCROLL_BODY_CLASS,
  LookupDialogResultScroll,
  LookupPaginationBar,
} from "#/components/ui/lookup-dialog-chrome";

const inputDense =
  "h-9 w-full min-w-0 rounded-[var(--radius)] border-2 border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:border-ring";
const selectDense =
  "h-9 w-full min-w-0 rounded-[var(--radius)] border-2 border-input bg-background px-2 text-sm font-medium";

export type ProductLookupRow = {
  itemCode: string;
  itemName: string;
  hpp: number;
  het: number;
  het2: number;
  het3: number;
  het4: number;
  het5: number;
};

function buildLookupCatalog(): ProductLookupRow[] {
  const cimory: ProductLookupRow[] = [
    {
      itemCode: "CM-001",
      itemName: "CIMORY EAT MILK 80GR CHOCOLATE",
      hpp: 5400,
      het: 6000,
      het2: 5900,
      het3: 5800,
      het4: 5700,
      het5: 5600,
    },
    {
      itemCode: "CM-002",
      itemName: "CIMORY FRUTAS JELLY DRINK 120ML MANGO",
      hpp: 2880,
      het: 3200,
      het2: 3150,
      het3: 3100,
      het4: 3050,
      het5: 3000,
    },
    {
      itemCode: "CM-003",
      itemName: "CIMORY GRAB & GO YOGHURT 70ML STRAWBERRY",
      hpp: 7198,
      het: 8000,
      het2: 7900,
      het3: 7800,
      het4: 7700,
      het5: 7600,
    },
    {
      itemCode: "CM-004",
      itemName: "CIMORY UHT MILK 200ML CHOCOLATE",
      hpp: 4500,
      het: 5000,
      het2: 4950,
      het3: 4900,
      het4: 4850,
      het5: 4800,
    },
  ];
  const rest: ProductLookupRow[] = [];
  for (let i = 5; i <= 120; i++) {
    const base = 2000 + (i % 40) * 150;
    rest.push({
      itemCode: `POC-${String(i).padStart(4, "0")}`,
      itemName: `Sample Product Line ${i} — testing pagination`,
      hpp: base,
      het: Math.round(base * 1.1),
      het2: Math.round(base * 1.08),
      het3: Math.round(base * 1.06),
      het4: Math.round(base * 1.04),
      het5: Math.round(base * 1.02),
    });
  }
  return [...cimory, ...rest];
}

const ALL_LOOKUP: ProductLookupRow[] = buildLookupCatalog();

type HeaderRecord = {
  productCode: string;
  description: string;
  aliasName: string;
  barcode: string;
  divisiCode: string;
  divisiName: string;
  supplierCode: string;
  supplierName: string;
  brandCode: string;
  brandName: string;
  categoryCode: string;
  categoryName: string;
  subCatCode: string;
  subCatName: string;
  minLevel: string;
  reorderQty: string;
  lastSaleDate: string;
  lastPurchDate: string;
  registerDate: string;
  pcs: string;
  inner: string;
  box: string;
  uom: string;
};

const DEMO_HEADERS: HeaderRecord[] = [
  {
    productCode: "02-7",
    description: "GATSBY STYLING POMADE 75 GR SILVER/SUPREME GREASE",
    aliasName: "GATSBY STYLING POMADE 75 GR SILVER, COKLAT",
    barcode: "",
    divisiCode: "02",
    divisiName: "Trading",
    supplierCode: "SBYTK",
    supplierName: "SURABAYA / PERKASA JAYA",
    brandCode: "02",
    brandName: "GATSBY",
    categoryCode: "03",
    categoryName: "COSMETIC",
    subCatCode: "03",
    subCatName: "COSMETIC",
    minLevel: "0",
    reorderQty: "0",
    lastSaleDate: "2026-04-29",
    lastPurchDate: "2025-11-20",
    registerDate: "2026-04-30",
    pcs: "48",
    inner: "1",
    box: "1",
    uom: "PCS",
  },
  {
    productCode: "CM-001",
    description: "CIMORY EAT MILK 80GR CHOCOLATE",
    aliasName: "CIMORY EAT MILK CHOCO 80G",
    barcode: "8999999111111",
    divisiCode: "01",
    divisiName: "FMCG",
    supplierCode: "JKT-01",
    supplierName: "JAKARTA / DAIRY SUPPLY",
    brandCode: "CM",
    brandName: "CIMORY",
    categoryCode: "04",
    categoryName: "DAIRY",
    subCatCode: "01",
    subCatName: "UHT & MILK",
    minLevel: "10",
    reorderQty: "24",
    lastSaleDate: "2026-04-28",
    lastPurchDate: "2026-04-15",
    registerDate: "2025-01-10",
    pcs: "24",
    inner: "2",
    box: "6",
    uom: "PCS",
  },
  {
    productCode: "POC-0015",
    description: "Sample Product Line 15 — testing pagination",
    aliasName: "",
    barcode: "",
    divisiCode: "02",
    divisiName: "Trading",
    supplierCode: "BDG-99",
    supplierName: "BANDUNG / SAMPEL CV",
    brandCode: "SP",
    brandName: "SAMPLE",
    categoryCode: "99",
    categoryName: "MISC",
    subCatCode: "99",
    subCatName: "MISC",
    minLevel: "0",
    reorderQty: "0",
    lastSaleDate: "",
    lastPurchDate: "",
    registerDate: "2026-01-01",
    pcs: "1",
    inner: "1",
    box: "1",
    uom: "PCS",
  },
];

function applyRowToState(
  setters: {
    setProductCode: (v: string) => void;
    setDescription: (v: string) => void;
    setAliasName: (v: string) => void;
    setBarcode: (v: string) => void;
  },
  row: ProductLookupRow
) {
  setters.setProductCode(row.itemCode);
  setters.setDescription(row.itemName);
  setters.setAliasName("");
  setters.setBarcode("");
}

function applyHeader(r: HeaderRecord, set: (u: (p: HeaderRecord) => HeaderRecord) => void) {
  set(() => ({ ...r }));
}

/** Master Product — legacy-style detail form; product list only in ⋯ lookup with pagination (POC). */
export function ItemsPage() {
  const navigate = useNavigate();
  const [recordIdx, setRecordIdx] = useState(0);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [salesItem, setSalesItem] = useState("Yes");
  const [purchaseItem, setPurchaseItem] = useState("Yes");
  const [returnItem, setReturnItem] = useState("Yes");
  const [maxLevel, setMaxLevel] = useState("");

  const [form, setForm] = useState<HeaderRecord>(DEMO_HEADERS[0]!);

  const setField = <K extends keyof HeaderRecord>(key: K, value: HeaderRecord[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const cycleRecord = useCallback((i: number) => {
    const n = DEMO_HEADERS.length;
    const idx = ((i % n) + n) % n;
    setRecordIdx(idx);
    applyHeader(DEMO_HEADERS[idx]!, setForm);
  }, []);

  const vcrCount = DEMO_HEADERS.length;

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-md border-2 border-border bg-card px-2 py-2 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 px-3 text-sm"
          title="New"
          onClick={() => cycleRecord(recordIdx)}
        >
          <FilePlus className="h-3.5 w-3.5" />
          <span className="ml-1.5 hidden font-semibold sm:inline">New</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 px-3 text-sm"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="ml-1.5 hidden font-semibold sm:inline">Del</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 px-3 text-sm"
          title="Save"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="ml-1.5 hidden font-semibold sm:inline">Save</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 border-primary/60 px-3 text-sm"
          title="Execute"
        >
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span className="ml-1.5 hidden font-semibold md:inline">Exec</span>
        </Button>

        <div className="mx-1 hidden h-7 w-px shrink-0 bg-border sm:block" aria-hidden />
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title="First record"
            onClick={() => cycleRecord(0)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title="Previous record"
            onClick={() => cycleRecord(recordIdx - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title="Next record"
            onClick={() => cycleRecord(recordIdx + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title="Last record"
            onClick={() => cycleRecord(vcrCount - 1)}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
          title="Close"
          onClick={() => navigate(-1)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <LegacyDivisionFormNav
        onPreviousForm={() => cycleRecord(recordIdx - 1)}
        onNextForm={() => cycleRecord(recordIdx + 1)}
      />

      <div className="rounded-md border-2 border-border bg-card p-3 sm:p-4">
        <h2 className="mb-3 text-lg font-bold tracking-tight">:: Master Product</h2>

        <Tabs defaultValue="main" className="w-full">
          {/* Extra py so overflow-y-hidden on TabsList does not clip rounded bottom borders */}
          <TabsList className="mb-2 h-auto w-full flex-wrap justify-start gap-2 border-0 bg-transparent px-0 py-1.5 sm:mb-3">
            {(["main", "inventory", "price", "discount"] as const).map((id) => (
              <TabsTrigger
                key={id}
                value={id}
                className={cn(
                  "min-h-0 shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold",
                  /* Override global TabsTrigger underline + negative margin — full closed border */
                  "mb-0 border-2 border-solid border-border bg-transparent shadow-none",
                  "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                  "data-[state=active]:border-primary data-[state=active]:bg-muted/50 data-[state=active]:text-primary",
                )}
              >
                {id === "main" && "Main Information"}
                {id === "inventory" && "Inventory Information"}
                {id === "price" && "Price Information"}
                {id === "discount" && "Discount Information"}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="main" className="mt-0 space-y-4 focus-visible:outline-none">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <Label htmlFor="prod-code" className="text-xs">
                  Product Code
                </Label>
                <div className="flex max-w-md gap-1.5">
                  <input
                    id="prod-code"
                    value={form.productCode}
                    onChange={(e) => setField("productCode", e.target.value)}
                    className={cn(inputDense, "flex-1 font-mono tabular-nums")}
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    title="Product lookup"
                    onClick={() => setLookupOpen(true)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 rounded-md border border-border bg-muted/20 px-3 py-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={locked}
                    onChange={(e) => setLocked(e.target.checked)}
                    className="h-4 w-4 rounded border-2 border-input accent-primary"
                  />
                  Lock This Product
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="prod-desc" className="text-xs">
                Description
              </Label>
              <input
                id="prod-desc"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                className={inputDense}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="alias" className="text-xs">
                  Alias Name
                </Label>
                <input
                  id="alias"
                  value={form.aliasName}
                  onChange={(e) => setField("aliasName", e.target.value)}
                  className={inputDense}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="barcode" className="text-xs">
                  Barcode
                </Label>
                <input
                  id="barcode"
                  value={form.barcode}
                  onChange={(e) => setField("barcode", e.target.value)}
                  className={inputDense}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label className="text-xs">Sales Item</Label>
                <select
                  value={salesItem}
                  onChange={(e) => setSalesItem(e.target.value)}
                  className={selectDense}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Purchase Item</Label>
                <select
                  value={purchaseItem}
                  onChange={(e) => setPurchaseItem(e.target.value)}
                  className={selectDense}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Return Item</Label>
                <select
                  value={returnItem}
                  onChange={(e) => setReturnItem(e.target.value)}
                  className={selectDense}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <CodeNameRow
              label="Divisi"
              codeId="divisi-code"
              code={form.divisiCode}
              name={form.divisiName}
              onCode={(v) => setField("divisiCode", v)}
              onName={(v) => setField("divisiName", v)}
            />
            <CodeNameRow
              label="Supplier Code"
              codeId="supp-code"
              code={form.supplierCode}
              name={form.supplierName}
              onCode={(v) => setField("supplierCode", v)}
              onName={(v) => setField("supplierName", v)}
              showLookup
            />
            <CodeNameRow
              label="Brand Code"
              codeId="brand-code"
              code={form.brandCode}
              name={form.brandName}
              onCode={(v) => setField("brandCode", v)}
              onName={(v) => setField("brandName", v)}
              showLookup
            />
            <CodeNameRow
              label="Category Code"
              codeId="cat-code"
              code={form.categoryCode}
              name={form.categoryName}
              onCode={(v) => setField("categoryCode", v)}
              onName={(v) => setField("categoryName", v)}
              showLookup
            />
            <CodeNameRow
              label="Sub Category Code"
              codeId="subcat-code"
              code={form.subCatCode}
              name={form.subCatName}
              onCode={(v) => setField("subCatCode", v)}
              onName={(v) => setField("subCatName", v)}
              showLookup
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="max-lvl" className="text-xs">
                  Max Level
                </Label>
                <input
                  id="max-lvl"
                  value={maxLevel}
                  onChange={(e) => setMaxLevel(e.target.value)}
                  className={inputDense}
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="min-lvl" className="text-xs">
                  Min Level
                </Label>
                <input
                  id="min-lvl"
                  value={form.minLevel}
                  onChange={(e) => setField("minLevel", e.target.value)}
                  className={inputDense}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reorder" className="text-xs">
                  Reorder Qty
                </Label>
                <input
                  id="reorder"
                  value={form.reorderQty}
                  onChange={(e) => setField("reorderQty", e.target.value)}
                  className={inputDense}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <DateField
                id="last-sale"
                label="Last Sale Date"
                value={form.lastSaleDate}
                onChange={(v) => setField("lastSaleDate", v)}
              />
              <DateField
                id="last-purch"
                label="Last Purch Date"
                value={form.lastPurchDate}
                onChange={(v) => setField("lastPurchDate", v)}
              />
              <DateField
                id="reg-date"
                label="Register Date"
                value={form.registerDate}
                onChange={(v) => setField("registerDate", v)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="pcs" className="text-xs">
                  Pcs
                </Label>
                <input
                  id="pcs"
                  value={form.pcs}
                  onChange={(e) => setField("pcs", e.target.value)}
                  className={inputDense}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="inner" className="text-xs">
                  Inner
                </Label>
                <input
                  id="inner"
                  value={form.inner}
                  onChange={(e) => setField("inner", e.target.value)}
                  className={inputDense}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="box" className="text-xs">
                  Box
                </Label>
                <input
                  id="box"
                  value={form.box}
                  onChange={(e) => setField("box", e.target.value)}
                  className={inputDense}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="uom" className="text-xs">
                  Unit of Measure
                </Label>
                <input
                  id="uom"
                  value={form.uom}
                  onChange={(e) => setField("uom", e.target.value)}
                  className={inputDense}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="inventory"
            className="mt-0 text-sm text-muted-foreground focus-visible:outline-none"
          >
            <p>
              POC: Inventory Information tab (warehouse levels, batch, etc.) — wire when backend is
              ready.
            </p>
          </TabsContent>
          <TabsContent
            value="price"
            className="mt-0 text-sm text-muted-foreground focus-visible:outline-none"
          >
            <p>
              POC: Price Information tab (HET tiers, list prices) — use product lookup on Main for
              HPP/HET sample values.
            </p>
          </TabsContent>
          <TabsContent
            value="discount"
            className="mt-0 text-sm text-muted-foreground focus-visible:outline-none"
          >
            <p>POC: Discount Information tab — not implemented in this demo.</p>
          </TabsContent>
        </Tabs>
      </div>

      <p className="text-xs text-muted-foreground">
        POC: ~120 dummy lines in product lookup with pagination (Item Name, HPP, HET…HET5). Main
        form matches legacy Master Product layout.
      </p>

      <ProductLookupDialog
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        onSelect={(row) => {
          applyRowToState(
            {
              setProductCode: (v) => setField("productCode", v),
              setDescription: (v) => setField("description", v),
              setAliasName: (v) => setField("aliasName", v),
              setBarcode: (v) => setField("barcode", v),
            },
            row
          );
        }}
      />
    </div>
  );
}

function CodeNameRow({
  label,
  codeId,
  code,
  name,
  onCode,
  onName,
  showLookup,
}: {
  label: string;
  codeId: string;
  code: string;
  name: string;
  onCode: (v: string) => void;
  onName: (v: string) => void;
  showLookup?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,8rem)_1fr] sm:items-end">
      <div className="space-y-1">
        <Label htmlFor={codeId} className="text-xs">
          {label}
        </Label>
        <div className="flex gap-1.5">
          <input
            id={codeId}
            value={code}
            onChange={(e) => onCode(e.target.value)}
            className={cn(inputDense, "font-mono tabular-nums")}
          />
          {showLookup ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 opacity-50"
              disabled
              title="POC: not wired"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="space-y-1 sm:pb-px">
        <Label className="text-xs text-muted-foreground sm:sr-only">&nbsp;</Label>
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          className={inputDense}
          readOnly={false}
        />
      </div>
    </div>
  );
}

function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="relative w-full">
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputDense, "pr-9")}
        />
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
          aria-hidden
        />
      </div>
    </div>
  );
}

type FieldKey = "itemName" | "itemCode";
type MatchKey = "contains" | "equals" | "startsWith";

function ProductLookupDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (row: ProductLookupRow) => void;
}) {
  const [field, setField] = useState<FieldKey>("itemName");
  const [match, setMatch] = useState<MatchKey>("contains");
  const [autoSearch, setAutoSearch] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(LOOKUP_DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (!open) return;
    setFilterText("");
    setAppliedQuery("");
    setSelectedIdx(0);
    setPage(0);
  }, [open]);

  useEffect(() => {
    if (!open || !autoSearch) return;
    setAppliedQuery(filterText);
    setPage(0);
    setSelectedIdx(0);
  }, [filterText, autoSearch, open]);

  const rows = useMemo(() => {
    const raw = appliedQuery.trim();
    if (!raw) return [...ALL_LOOKUP];
    const q = raw.toLowerCase();
    const test = (value: string) => {
      const v = value.toLowerCase();
      switch (match) {
        case "equals":
          return v === q;
        case "startsWith":
          return v.startsWith(q);
        default:
          return v.includes(q);
      }
    };
    return ALL_LOOKUP.filter((row) =>
      field === "itemName" ? test(row.itemName) : test(row.itemCode)
    );
  }, [appliedQuery, field, match]);

  useEffect(() => {
    setPage(0);
    setSelectedIdx(0);
  }, [field, match]);

  useEffect(() => {
    const pc = Math.max(1, Math.ceil(rows.length / pageSize));
    setPage((p) => Math.min(p, pc - 1));
  }, [rows.length, pageSize]);

  const sliceStart = page * pageSize;
  const pagedRows = rows.slice(sliceStart, sliceStart + pageSize);

  useEffect(() => {
    if (rows.length === 0) return;
    const start = page * pageSize;
    const endEx = Math.min(rows.length, start + pageSize);
    setSelectedIdx((i) => {
      if (i >= start && i < endEx) return i;
      return Math.min(start, rows.length - 1);
    });
  }, [page, pageSize, rows.length]);

  useEffect(() => {
    if (selectedIdx >= rows.length) setSelectedIdx(Math.max(0, rows.length - 1));
  }, [rows.length, selectedIdx]);

  const handleFind = () => {
    setAppliedQuery(filterText);
    setSelectedIdx(0);
    setPage(0);
  };

  const handleApply = () => {
    const row = rows[selectedIdx];
    if (row) onSelect(row);
    onOpenChange(false);
  };

  const fmt = (n: number) => n.toLocaleString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(LOOKUP_DIALOG_CONTENT_CLASS, "max-w-[min(100vw-1rem,88rem)]")}>
        <DialogHeader className="shrink-0 pr-10 pb-2">
          <DialogTitle className="sr-only">Product lookup</DialogTitle>
          <p className="text-base font-bold">Master Product</p>
        </DialogHeader>

        <div className={LOOKUP_DIALOG_SCROLL_BODY_CLASS}>
          <div className="space-y-2 rounded-md border-2 bg-muted/30 px-3 py-2.5">
            <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Criteria
            </div>
            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <div className="min-w-[9rem] space-y-1">
                <Label htmlFor="pl-field" className="text-xs uppercase tracking-wide">
                  Field
                </Label>
                <select
                  id="pl-field"
                  value={field}
                  onChange={(e) => setField(e.target.value as FieldKey)}
                  className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
                >
                  <option value="itemName">Description</option>
                  <option value="itemCode">Product Code</option>
                </select>
              </div>
              <div className="min-w-[9rem] space-y-1">
                <Label htmlFor="pl-match" className="text-xs uppercase tracking-wide">
                  Match
                </Label>
                <select
                  id="pl-match"
                  value={match}
                  onChange={(e) => setMatch(e.target.value as MatchKey)}
                  className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium"
                >
                  <option value="contains">Contains</option>
                  <option value="equals">Equals</option>
                  <option value="startsWith">Starts with</option>
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-11 shrink-0"
                onClick={handleFind}
              >
                Find
              </Button>
              <label className="inline-flex min-h-[3rem] cursor-pointer items-center gap-2 shrink-0">
                <input
                  type="checkbox"
                  checked={autoSearch}
                  onChange={(e) => setAutoSearch(e.target.checked)}
                  className="h-5 w-5 rounded border-2 border-input accent-primary"
                />
                <span className="text-base font-semibold">Auto Search</span>
              </label>
            </div>
            <div className="pt-1">
              <Label htmlFor="pl-filter" className="sr-only">
                Search
              </Label>
              <Input
                id="pl-filter"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={(e) => {
                  if (!autoSearch && e.key === "Enter") handleFind();
                }}
                placeholder="Try CIMORY or POC-…"
                className="h-11 max-w-xl text-base"
              />
            </div>
          </div>

          <LookupDialogResultScroll
            footer={
              rows.length > 0 ? (
                <LookupPaginationBar
                  total={rows.length}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(sz) => {
                    setPageSize(sz);
                    setPage(0);
                  }}
                />
              ) : null
            }
          >
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[14rem] whitespace-nowrap">Item Name</TableHead>
                    <TableHead className="whitespace-nowrap text-right">HPP</TableHead>
                    <TableHead className="whitespace-nowrap text-right">HET</TableHead>
                    <TableHead className="whitespace-nowrap text-right">HET2</TableHead>
                    <TableHead className="whitespace-nowrap text-right">HET3</TableHead>
                    <TableHead className="whitespace-nowrap text-right">HET4</TableHead>
                    <TableHead className="whitespace-nowrap text-right">HET5</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        No rows match. Change criteria or search text.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedRows.map((row, idx) => {
                      const abs = sliceStart + idx;
                      return (
                        <TableRow
                          key={`${row.itemCode}\0${abs}`}
                          role="button"
                          tabIndex={0}
                          data-state={selectedIdx === abs ? "selected" : undefined}
                          className={cn("cursor-pointer", selectedIdx === abs && "bg-accent")}
                          onClick={() => setSelectedIdx(abs)}
                          onDoubleClick={() => {
                            onSelect(row);
                            onOpenChange(false);
                          }}
                        >
                          <TableCell className="max-w-[24rem] py-3">
                            <span className="font-mono text-muted-foreground text-xs">
                              {row.itemCode}
                            </span>
                            <span className="ml-2">{row.itemName}</span>
                          </TableCell>
                          <TableCell className="py-3 text-right tabular-nums">
                            {fmt(row.hpp)}
                          </TableCell>
                          <TableCell className="py-3 text-right tabular-nums">
                            {fmt(row.het)}
                          </TableCell>
                          <TableCell className="py-3 text-right tabular-nums">
                            {fmt(row.het2)}
                          </TableCell>
                          <TableCell className="py-3 text-right tabular-nums">
                            {fmt(row.het3)}
                          </TableCell>
                          <TableCell className="py-3 text-right tabular-nums">
                            {fmt(row.het4)}
                          </TableCell>
                          <TableCell className="py-3 text-right tabular-nums">
                            {fmt(row.het5)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </LookupDialogResultScroll>
        </div>

        <DialogFooter className="shrink-0 flex-col gap-3 border-t-2 border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="mr-auto text-sm text-muted-foreground">
            {rows.length} row{rows.length === 1 ? "" : "s"}
          </p>
          <div className="flex w-full flex-wrap justify-end gap-3 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-w-[8rem]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="lg"
              className="min-w-[8rem]"
              onClick={handleApply}
              disabled={rows.length === 0}
            >
              OK
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
