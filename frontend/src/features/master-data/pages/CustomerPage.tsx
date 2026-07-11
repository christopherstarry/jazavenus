import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Database, Lock, MapPin, Tag, Calendar } from "lucide-react";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { EmptyState } from "#/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "#/components/ui/dialog";
import { Label } from "#/components/ui/label";
import { useConfirm } from "#/components/ui/confirm";
import { toast } from "#/components/ui/use-toast";
import type { PagedResult } from "#/features/common/CrudPage";
import { useMasterDataAccess } from "#/features/master-data/useMasterDataAccess";

interface CustomerDto {
  id: string; code: string; name: string; idNo: string | null;
  taxId: string | null; email: string | null; phone: string | null; phone2: string | null;
  fax: string | null; contactPerson: string | null;
  billingAddress: string | null; shippingAddress: string | null;
  city: string | null; country: string | null;
  creditLimit: number; paymentTermsDays: number;
  areaCode: string | null; salesmanCode: string | null; collectorCode: string | null;
  distributionType: string | null; tradeType: string | null; subTradeType: string | null;
  outletType: string | null; groupOutletCode: string | null; groupOutletTypeCode: string | null;
  priceCode: string | null; discountCode: string | null; warehouseCode: string | null;
  npwpDate: string | null; pkpNumber: string | null; pkpDate: string | null;
  notes: string | null; registeredAt: string | null;
  isActive: boolean;
}
interface RefDto { id: string; code: string; name: string; }
interface AddressDto { id: string; customerId: string; label: string; address: string; city: string | null; country: string | null; isDefault: boolean; isActive: boolean; }
interface BrandDiscDto { id: string; customerId: string; brandCode: string; discountPercent: number; discountPercent2: number; priceCode: string | null; isActive: boolean; }

const inputLg = "min-h-[48px] text-base rounded-[var(--radius)] border-2 border-input bg-background px-3 w-full focus-visible:outline-none focus-visible:border-ring";
const selectLg = "min-h-[48px] text-base rounded-[var(--radius)] border-2 border-input bg-background px-3 w-full cursor-pointer appearance-none focus-visible:outline-none focus-visible:border-ring";
const sectionHead = "text-lg font-bold text-primary border-b-2 pb-2 mb-4 flex items-center gap-2";
const dateLg = "w-full min-h-[48px] bg-transparent pl-10 pr-3 text-base font-medium cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:hidden";

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-sm font-medium">{label}</Label>{children}</div>;
}

export function CustomerPage() {
  const queryClient = useQueryClient();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const { canEdit, canDelete } = useMasterDataAccess();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [idNoError, setIdNoError] = useState("");

  // Main info
  const [mName, setMName] = useState(""); const [mIdNo, setMIdNo] = useState("");
  const [mPhone, setMPhone] = useState(""); const [mPhone2, setMPhone2] = useState("");
  const [mFax, setMFax] = useState(""); const [mEmail, setMEmail] = useState("");
  const [mContact, setMContact] = useState(""); const [mTaxId, setMTaxId] = useState("");
  const [mNpwpDate, setMNpwpDate] = useState(""); const [mPkpNo, setMPkpNo] = useState("");
  const [mPkpDate, setMPkpDate] = useState(""); const [mBilling, setMBilling] = useState("");
  const [mCity, setMCity] = useState(""); const [mCountry, setMCountry] = useState("");
  const [mCredit, setMCredit] = useState("0"); const [mNotes, setMNotes] = useState("");
  const [mRegDate, setMRegDate] = useState("");
  const [mIsActive, setMIsActive] = useState(true);
  const npwpDateRef = useRef<HTMLInputElement>(null);
  const pkpDateRef = useRef<HTMLInputElement>(null);
  const regDateRef = useRef<HTMLInputElement>(null);

  // Secondary info
  const [sArea, setSArea] = useState(""); const [sSalesman, setSSalesman] = useState("");
  const [sCollector, setSCollector] = useState(""); const [sDistrib, setSDistrib] = useState("");
  const [sTrade, setSTrade] = useState(""); const [sSubTrade, setSSubTrade] = useState("");
  const [sOutlet, setSOutlet] = useState(""); const [sGrpOutlet, setSGrpOutlet] = useState("");
  const [sGrpOutletType, setSGrpOutletType] = useState(""); const [sPayTerm, setSPayTerm] = useState("");
  const [sPriceCode, setSPriceCode] = useState(""); const [sDiscCode, setSDiscCode] = useState("");
  const [sWhsCode, setSWhsCode] = useState("");

  // Addresses
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [addrOpen, setAddrOpen] = useState(false); const [editAddr, setEditAddr] = useState<AddressDto | null>(null);
  const [aLabel, setALabel] = useState(""); const [aAddr, setAAddr] = useState(""); const [aCity, setACity] = useState("");

  // Brand discounts
  const [brandDiscs, setBrandDiscs] = useState<BrandDiscDto[]>([]);
  const [bdOpen, setBdOpen] = useState(false); const [editBd, setEditBd] = useState<BrandDiscDto | null>(null);
  const [bdBrand, setBdBrand] = useState(""); const [bdDisc, setBdDisc] = useState("0"); const [bdDisc2, setBdDisc2] = useState("0"); const [bdPrice, setBdPrice] = useState("");

  // Reference data for dropdowns
  const refArea = useQuery({ queryKey: ["master/areas"], queryFn: () => api.get("master/areas", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });
  const refSalesman = useQuery({ queryKey: ["master/salesmen"], queryFn: () => api.get("master/salesmen", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });
  const refCollector = useQuery({ queryKey: ["master/collectors"], queryFn: () => api.get("master/collectors", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });
  const refTrade = useQuery({ queryKey: ["master/trade-types"], queryFn: () => api.get("master/trade-types", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });
  const refSubTrade = useQuery({ queryKey: ["master/sub-trade-types"], queryFn: () => api.get("master/sub-trade-types", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });
  const refDistrib = useQuery({ queryKey: ["master/distribution-types"], queryFn: () => api.get("master/distribution-types", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });
  const refOutlet = useQuery({ queryKey: ["master/outlet-types"], queryFn: () => api.get("master/outlet-types", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });
  const refGrpOutlet = useQuery({ queryKey: ["master/outlet-groups"], queryFn: () => api.get("master/outlet-groups", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });
  const refGrpOutletType = useQuery({ queryKey: ["master/outlet-group-types"], queryFn: () => api.get("master/outlet-group-types", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });
  const refPayTerm = useQuery({ queryKey: ["master/payment-terms"], queryFn: () => api.get("master/payment-terms", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });
  const refBrand = useQuery({ queryKey: ["master/brands"], queryFn: () => api.get("master/brands", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });

  const q = useQuery({
    queryKey: ["master/customers", page, search],
    queryFn: () => api.get("master/customers", { searchParams: { page, pageSize: 20, search } }).json<PagedResult<CustomerDto>>(),
    placeholderData: (prev) => prev,
  });

  function mapForm(): Record<string, unknown> {
    return {
      code: editing?.code ?? crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase(),
      name: mName, idNo: mIdNo || null,
      phone: mPhone || null, phone2: mPhone2 || null, fax: mFax || null, email: mEmail || null, contactPerson: mContact || null,
      taxId: mTaxId || null, npwpDate: mNpwpDate ? new Date(mNpwpDate).toISOString() : null,
      pkpNumber: mPkpNo || null, pkpDate: mPkpDate ? new Date(mPkpDate).toISOString() : null,
      billingAddress: mBilling || null, city: mCity || null, country: mCountry || null,
      creditLimit: Number(mCredit), notes: mNotes || null, registeredAt: mRegDate ? new Date(mRegDate).toISOString() : null,
      isActive: mIsActive,
      areaCode: sArea || null, salesmanCode: sSalesman || null, collectorCode: sCollector || null,
      distributionType: sDistrib || null, tradeType: sTrade || null, subTradeType: sSubTrade || null,
      outletType: sOutlet || null, groupOutletCode: sGrpOutlet || null, groupOutletTypeCode: sGrpOutletType || null,
      priceCode: sPriceCode || null, discountCode: sDiscCode || null, warehouseCode: sWhsCode || null,
      paymentTermsDays: Number(sPayTerm),
    };
  }

  async function handleSave() {
    setIdNoError("");
    if (sTrade !== "01" && mIdNo && mIdNo.length !== 16) {
      setIdNoError("ID No (NIK) must be exactly 16 digits.");
      return;
    }
    setSaving(true);
    try {
      const dto = mapForm();
      if (editing) {
        await api.put(`master/customers/${editing.id}`, { json: dto }).json();
        queryClient.invalidateQueries({ queryKey: ["master/customers"] });
      } else {
        const created = await api.post("master/customers", { json: dto }).json<CustomerDto>();
        queryClient.invalidateQueries({ queryKey: ["master/customers"] });
        openEdit(created);
        return;
      }
      setDialogOpen(false);
    } catch (err: any) {
      const body = await err.response?.json().catch(() => ({}));
      if (body?.title === "duplicate_id_no") setIdNoError(body.detail ?? "NIK already exists");
      else setIdNoError(body?.detail ?? err.message ?? "Save failed");
    } finally { setSaving(false); }
  }

  function resetForm() {
    setEditing(null); setMName(""); setMIdNo(""); setMPhone(""); setMPhone2(""); setMFax(""); setMEmail(""); setMContact("");
    setMTaxId(""); setMNpwpDate(""); setMPkpNo(""); setMPkpDate(""); setMBilling(""); setMCity(""); setMCountry("");
    setMCredit("0"); setMNotes(""); setMRegDate(""); setMIsActive(true);
    setSArea(""); setSSalesman(""); setSCollector(""); setSDistrib(""); setSTrade(""); setSSubTrade("");
    setSOutlet(""); setSGrpOutlet(""); setSGrpOutletType(""); setSPayTerm(""); setSPriceCode(""); setSDiscCode(""); setSWhsCode("");
    setAddresses([]); setBrandDiscs([]); setIdNoError("");
  }

  function openCreate() { resetForm(); setDialogOpen(true); }

  function openEdit(row: CustomerDto) {
    resetForm(); setEditing(row);
    setMName(row.name); setMIdNo(row.idNo ?? ""); setMPhone(row.phone ?? ""); setMPhone2(row.phone2 ?? "");
    setMFax(row.fax ?? ""); setMEmail(row.email ?? ""); setMContact(row.contactPerson ?? "");
    setMTaxId(row.taxId ?? ""); setMNpwpDate(row.npwpDate ?? ""); setMPkpNo(row.pkpNumber ?? ""); setMPkpDate(row.pkpDate ?? "");
    setMBilling(row.billingAddress ?? ""); setMCity(row.city ?? ""); setMCountry(row.country ?? "");
    setMCredit(String(row.creditLimit)); setMNotes(row.notes ?? ""); setMRegDate(row.registeredAt ?? ""); setMIsActive(row.isActive);
    setSArea(row.areaCode ?? ""); setSSalesman(row.salesmanCode ?? ""); setSCollector(row.collectorCode ?? "");
    setSDistrib(row.distributionType ?? ""); setSTrade(row.tradeType ?? ""); setSSubTrade(row.subTradeType ?? "");
    setSOutlet(row.outletType ?? ""); setSGrpOutlet(row.groupOutletCode ?? ""); setSGrpOutletType(row.groupOutletTypeCode ?? "");
    setSPayTerm(String(row.paymentTermsDays)); setSPriceCode(row.priceCode ?? ""); setSDiscCode(row.discountCode ?? ""); setSWhsCode(row.warehouseCode ?? "");
    loadAddresses(row.id); loadBrandDiscs(row.id); setDialogOpen(true);
  }

  async function loadAddresses(cid: string) {
    const d = await api.get(`master/customers/${cid}/addresses`).json<PagedResult<AddressDto>>().catch(() => null);
    if (d) setAddresses(d.items);
  }
  async function loadBrandDiscs(cid: string) {
    const d = await api.get(`master/customers/${cid}/brand-discounts`).json<PagedResult<BrandDiscDto>>().catch(() => null);
    if (d) setBrandDiscs(d.items);
  }

  async function handleDelete(row: CustomerDto) {
    const ok = await confirm({ title: "Delete Customer?", description: `Delete ${row.name}?`, destructive: true });
    if (!ok) return;
    try {
      await api.delete(`master/customers/${row.id}`);
      queryClient.invalidateQueries({ queryKey: ["master/customers"] });
    } catch (err) {
      toast({ title: "Delete failed", description: await describeApiError(err), variant: "destructive" });
    }
  }

  // Address handlers
  function openAddAddr() { setEditAddr(null); setALabel(""); setAAddr(""); setACity(""); setAddrOpen(true); }
  function openEditAddr(a: AddressDto) { setEditAddr(a); setALabel(a.label); setAAddr(a.address); setACity(a.city ?? ""); setAddrOpen(true); }
  async function saveAddr() {
    if (!editing) return;
    if (editAddr) await api.put(`master/customers/${editing.id}/addresses/${editAddr.id}`, { json: { customerId: editing.id, label: aLabel, address: aAddr, city: aCity } }).json();
    else await api.post(`master/customers/${editing.id}/addresses`, { json: { customerId: editing.id, label: aLabel, address: aAddr, city: aCity } }).json();
    setAddrOpen(false); loadAddresses(editing.id);
  }
  async function delAddr(a: AddressDto) {
    if (!editing) return;
    const ok = await confirm({ title: "Delete address?", description: "", destructive: true });
    if (!ok) return;
    try {
      await api.delete(`master/customers/${editing.id}/addresses/${a.id}`);
      loadAddresses(editing.id);
    } catch (err) {
      toast({ title: "Delete failed", description: await describeApiError(err), variant: "destructive" });
    }
  }

  // Brand discount handlers
  function openAddBd() { setEditBd(null); setBdBrand(""); setBdDisc("0"); setBdDisc2("0"); setBdPrice(""); setBdOpen(true); }
  function openEditBd(b: BrandDiscDto) { setEditBd(b); setBdBrand(b.brandCode); setBdDisc(String(b.discountPercent)); setBdDisc2(String(b.discountPercent2)); setBdPrice(b.priceCode ?? ""); setBdOpen(true); }
  async function saveBd() {
    if (!editing) return;
    const dto = { customerId: editing.id, brandCode: bdBrand, discountPercent: Number(bdDisc), discountPercent2: Number(bdDisc2), priceCode: bdPrice || null };
    if (editBd) await api.put(`master/customers/${editing.id}/brand-discounts/${editBd.id}`, { json: dto }).json();
    else await api.post(`master/customers/${editing.id}/brand-discounts`, { json: dto }).json();
    setBdOpen(false); loadBrandDiscs(editing.id);
  }
  async function delBd(b: BrandDiscDto) {
    if (!editing) return;
    const ok = await confirm({ title: "Delete brand discount?", description: "", destructive: true });
    if (!ok) return;
    try {
      await api.delete(`master/customers/${editing.id}/brand-discounts/${b.id}`);
      loadBrandDiscs(editing.id);
    } catch (err) {
      toast({ title: "Delete failed", description: await describeApiError(err), variant: "destructive" });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-2xl sm:text-3xl font-bold">Customers</CardTitle>
        {canEdit && (
        <Button onClick={openCreate} size="lg" className="w-full sm:w-auto text-base min-h-[48px]">
          <Plus className="h-5 w-5 mr-2" /> New Customer
        </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="search" placeholder="Search by code or name…" className="pl-10 h-12 text-base" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {q.isLoading && <Spinner label="Loading customers…" />}
        {q.data && q.data.items.length === 0 && <EmptyState icon={Database} title="No customers" description="No records found." action={canEdit ? <Button onClick={openCreate} size="lg" className="text-base"><Plus className="h-5 w-5 mr-2" /> New Customer</Button> : undefined} />}
        {q.data && q.data.items.length > 0 && (
          <>
            {/* Mobile cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {q.data.items.map((row) => (
                <div key={row.id} className="rounded-lg border-2 border-border bg-card p-4 space-y-2" onClick={() => openEdit(row)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base truncate">{row.code.slice(0, 8)}</div>
                      <div className="text-sm mt-0.5">{row.name}</div>
                      {row.city && <div className="text-sm text-muted-foreground mt-0.5">{row.city}</div>}
                    </div>
                    <Badge tone={row.isActive ? "success" : "destructive"} className="shrink-0 text-xs">{row.isActive ? "Active" : "Locked"}</Badge>
                  </div>
                  <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" className="h-10 flex-1 text-sm" onClick={() => openEdit(row)}><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                    {canDelete && <Button variant="outline" size="sm" className="h-10 flex-1 text-sm text-destructive border-destructive/40" onClick={() => handleDelete(row)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>}
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <div className="min-w-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono w-[130px] text-base">Code</TableHead>
                      <TableHead className="text-base">Name</TableHead>
                      <TableHead className="hidden md:table-cell text-base">City</TableHead>
                      <TableHead className="hidden lg:table-cell text-base">Phone</TableHead>
                      <TableHead className="w-[90px] text-base">Status</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {q.data.items.map((row) => (
                      <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(row)}>
                        <TableCell className="font-mono text-base py-3">{row.code.slice(0, 8)}</TableCell>
                        <TableCell className="text-base py-3 font-medium">{row.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-base py-3">{row.city ?? "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-base py-3">{row.phone ?? "—"}</TableCell>
                        <TableCell className="py-3"><Badge tone={row.isActive ? "success" : "destructive"} className="text-sm px-3 py-1">{row.isActive ? "Active" : "Locked"}</Badge></TableCell>
                        <TableCell className="py-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={(e) => { e.stopPropagation(); openEdit(row); }} title="Edit"><Pencil className="h-5 w-5" /></Button>
                            {canDelete && <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(row); }} title="Delete"><Trash2 className="h-5 w-5" /></Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <span className="text-base text-muted-foreground">{q.data.totalCount} entries · Page {q.data.page} of {q.data.totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="lg" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="min-h-[44px] text-base"><ChevronLeft className="h-5 w-5" /></Button>
                <Button variant="outline" size="lg" disabled={page >= q.data.totalPages} onClick={() => setPage((p) => p + 1)} className="min-h-[44px] text-base"><ChevronRight className="h-5 w-5" /></Button>
              </div>
            </div>
          </>
        )}

        {/* ==================== MAIN DIALOG ==================== */}
        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) { resetForm(); setDialogOpen(false); } }}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader><DialogTitle className="text-2xl">{editing ? `Edit Customer — ${editing.name}` : "New Customer"}</DialogTitle>
              <DialogDescription className="text-base">Fill in the customer details below.</DialogDescription></DialogHeader>

            {/* ===== MAIN INFORMATION ===== */}
            <div className={sectionHead}><MapPin className="h-5 w-5" /> Main Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <F label="Name *"><input value={mName} onChange={(e) => setMName(e.target.value)} className={inputLg} /></F>
              <F label="ID No (NIK)">
                <input value={mIdNo} onChange={(e) => setMIdNo(e.target.value.replace(/\D/g, "").slice(0, 16))} className={inputLg} placeholder="16 digits" maxLength={16} />
                {idNoError && <p className="text-sm text-destructive mt-1">{idNoError}</p>}
              </F>
              <F label="Phone"><input value={mPhone} onChange={(e) => setMPhone(e.target.value)} className={inputLg} /></F>
              <F label="Phone 2"><input value={mPhone2} onChange={(e) => setMPhone2(e.target.value)} className={inputLg} /></F>
              <F label="Fax"><input value={mFax} onChange={(e) => setMFax(e.target.value)} className={inputLg} /></F>
              <F label="Email"><input type="email" value={mEmail} onChange={(e) => setMEmail(e.target.value)} className={inputLg} /></F>
              <F label="Contact Person"><input value={mContact} onChange={(e) => setMContact(e.target.value)} className={inputLg} /></F>
              <F label="NPWP / Tax ID"><input value={mTaxId} onChange={(e) => setMTaxId(e.target.value)} className={inputLg} /></F>
              <F label="NPWP Date">
                <div className="relative flex items-center min-h-[48px] rounded-[var(--radius)] border-2 border-input bg-background cursor-pointer" onClick={() => npwpDateRef.current?.showPicker()}>
                  <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input ref={npwpDateRef} type="date" value={mNpwpDate} onChange={(e) => setMNpwpDate(e.target.value)} className={dateLg} />
                </div>
              </F>
              <F label="PKP No"><input value={mPkpNo} onChange={(e) => setMPkpNo(e.target.value)} className={inputLg} /></F>
              <F label="PKP Date">
                <div className="relative flex items-center min-h-[48px] rounded-[var(--radius)] border-2 border-input bg-background cursor-pointer" onClick={() => pkpDateRef.current?.showPicker()}>
                  <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input ref={pkpDateRef} type="date" value={mPkpDate} onChange={(e) => setMPkpDate(e.target.value)} className={dateLg} />
                </div>
              </F>
              <F label="Credit Limit"><input type="number" value={mCredit} onChange={(e) => setMCredit(e.target.value)} className={inputLg} /></F>
              <F label="Register Date">
                <div className="relative flex items-center min-h-[48px] rounded-[var(--radius)] border-2 border-input bg-background cursor-pointer" onClick={() => regDateRef.current?.showPicker()}>
                  <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input ref={regDateRef} type="date" value={mRegDate} onChange={(e) => setMRegDate(e.target.value)} className={dateLg} />
                </div>
              </F>
              <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                <Label className="text-sm font-medium">Billing Address</Label>
                <textarea value={mBilling} onChange={(e) => setMBilling(e.target.value)} className={`${inputLg} min-h-[80px] resize-y`} />
              </div>
              <F label="City"><input value={mCity} onChange={(e) => setMCity(e.target.value)} className={inputLg} /></F>
              <F label="Country"><input value={mCountry} onChange={(e) => setMCountry(e.target.value)} className={inputLg} /></F>
              <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                <Label className="text-sm font-medium">Notes</Label>
                <textarea value={mNotes} onChange={(e) => setMNotes(e.target.value)} className={`${inputLg} min-h-[60px] resize-y`} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="flex items-center gap-3 cursor-pointer min-h-[48px]">
                  <input type="checkbox" checked={mIsActive} onChange={(e) => setMIsActive(e.target.checked)} className="h-6 w-6 rounded border-2 border-input accent-primary" />
                  <span className="text-base font-medium">{mIsActive ? "Active" : "Locked (blacklisted)"}</span>
                  {!mIsActive && <Lock className="h-5 w-5 text-destructive" />}
                </label>
              </div>
            </div>

            {/* ===== SECONDARY INFORMATION ===== */}
            <div className={sectionHead}><Tag className="h-5 w-5" /> Secondary Information</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <F label="Area"><select value={sArea} onChange={(e) => setSArea(e.target.value)} className={selectLg}><option value="">— Select —</option>{(refArea.data?.items ?? []).map((r: RefDto) => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}</select></F>
              <F label="Salesman"><select value={sSalesman} onChange={(e) => setSSalesman(e.target.value)} className={selectLg}><option value="">— Select —</option>{(refSalesman.data?.items ?? []).map((r: RefDto) => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}</select></F>
              <F label="Collector"><select value={sCollector} onChange={(e) => setSCollector(e.target.value)} className={selectLg}><option value="">— Select —</option>{(refCollector.data?.items ?? []).map((r: RefDto) => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}</select></F>
              <F label="Trade Type"><select value={sTrade} onChange={(e) => setSTrade(e.target.value)} className={selectLg}><option value="">— Select —</option>{(refTrade.data?.items ?? []).map((r: RefDto) => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}</select></F>
              <F label="Sub Trade"><select value={sSubTrade} onChange={(e) => setSSubTrade(e.target.value)} className={selectLg}><option value="">— Select —</option>{(refSubTrade.data?.items ?? []).map((r: RefDto) => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}</select></F>
              <F label="Distribution"><select value={sDistrib} onChange={(e) => setSDistrib(e.target.value)} className={selectLg}><option value="">— Select —</option>{(refDistrib.data?.items ?? []).map((r: RefDto) => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}</select></F>
              <F label="Outlet Type"><select value={sOutlet} onChange={(e) => setSOutlet(e.target.value)} className={selectLg}><option value="">— Select —</option>{(refOutlet.data?.items ?? []).map((r: RefDto) => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}</select></F>
              <F label="Outlet Group"><select value={sGrpOutlet} onChange={(e) => setSGrpOutlet(e.target.value)} className={selectLg}><option value="">— Select —</option>{(refGrpOutlet.data?.items ?? []).map((r: RefDto) => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}</select></F>
              <F label="Outlet Group Type"><select value={sGrpOutletType} onChange={(e) => setSGrpOutletType(e.target.value)} className={selectLg}><option value="">— Select —</option>{(refGrpOutletType.data?.items ?? []).map((r: RefDto) => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}</select></F>
              <F label="Payment Term"><select value={sPayTerm} onChange={(e) => setSPayTerm(e.target.value)} className={selectLg}><option value="">— Select —</option>{(refPayTerm.data?.items ?? []).map((r: RefDto) => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}</select></F>
              <F label="Price Code"><input value={sPriceCode} onChange={(e) => setSPriceCode(e.target.value)} className={inputLg} /></F>
              <F label="Discount Code"><input value={sDiscCode} onChange={(e) => setSDiscCode(e.target.value)} className={inputLg} /></F>
              <F label="Warehouse Code"><input value={sWhsCode} onChange={(e) => setSWhsCode(e.target.value)} className={inputLg} /></F>
            </div>

            {/* ===== CUSTOMER ADDRESSES ===== */}
            <div className={`${sectionHead} justify-between`}>
              <span><MapPin className="h-5 w-5" /> Customer Addresses</span>
              <Button variant="outline" size="sm" className="h-10 text-sm" onClick={openAddAddr}><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
            <div className="mb-6 space-y-2">
              {addresses.length === 0 && <p className="text-sm text-muted-foreground py-2">No addresses added yet.</p>}
              {addresses.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-2 rounded-lg border-2 border-border bg-card p-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-sm">{a.label}</span>
                    <p className="text-sm text-muted-foreground truncate">{a.address}{a.city ? `, ${a.city}` : ""}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditAddr(a)}><Pencil className="h-4 w-4" /></Button>
                    {canDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => delAddr(a)}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                </div>
              ))}
            </div>

            {/* ===== BRAND DISCOUNTS ===== */}
            <div className={`${sectionHead} justify-between`}>
              <span><Tag className="h-5 w-5" /> Brand Discounts</span>
              <Button variant="outline" size="sm" className="h-10 text-sm" onClick={openAddBd}><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
            <div className="mb-4">
              {brandDiscs.length === 0 && <p className="text-sm text-muted-foreground py-2">No brand discounts added yet.</p>}
              {brandDiscs.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>Brand</TableHead><TableHead>Disc %</TableHead><TableHead>Disc 2 %</TableHead><TableHead>Price Code</TableHead><TableHead className="w-[80px]"></TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {brandDiscs.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-mono">{b.brandCode}</TableCell>
                          <TableCell>{b.discountPercent}</TableCell>
                          <TableCell>{b.discountPercent2}</TableCell>
                          <TableCell>{b.priceCode ?? "—"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditBd(b)}><Pencil className="h-4 w-4" /></Button>
                              {canDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => delBd(b)}><Trash2 className="h-4 w-4" /></Button>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3 pt-2 border-t-2 pt-4">
              <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }} size="lg" className="w-full sm:w-auto text-base min-h-[48px]">Cancel</Button>
              <Button onClick={handleSave} disabled={!mName || saving} size="lg" className="w-full sm:w-auto text-base min-h-[48px]">
                {saving ? "Saving…" : editing ? "Update Customer" : "Create Customer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Address mini-dialog */}
        <Dialog open={addrOpen} onOpenChange={setAddrOpen}>
          <DialogContent className="sm:max-w-md p-4 sm:p-6">
            <DialogHeader><DialogTitle>{editAddr ? "Edit Address" : "Add Address"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <F label="Label"><input value={aLabel} onChange={(e) => setALabel(e.target.value)} className={inputLg} placeholder="e.g. MAIN, INVOICE" /></F>
              <F label="Address"><textarea value={aAddr} onChange={(e) => setAAddr(e.target.value)} className={`${inputLg} min-h-[60px] resize-y`} /></F>
              <F label="City"><input value={aCity} onChange={(e) => setACity(e.target.value)} className={inputLg} /></F>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2"><Button variant="outline" onClick={() => setAddrOpen(false)} className="w-full sm:w-auto">Cancel</Button><Button onClick={saveAddr} className="w-full sm:w-auto">{editAddr ? "Update" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Brand discount mini-dialog */}
        <Dialog open={bdOpen} onOpenChange={setBdOpen}>
          <DialogContent className="sm:max-w-md p-4 sm:p-6">
            <DialogHeader><DialogTitle>{editBd ? "Edit Brand Discount" : "Add Brand Discount"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <F label="Brand Code">
                <select value={bdBrand} onChange={(e) => setBdBrand(e.target.value)} className={selectLg}>
                  <option value="">— Select Brand —</option>{(refBrand.data?.items ?? []).map((r: RefDto) => <option key={r.code} value={r.code}>{r.code} - {r.name}</option>)}
                </select>
              </F>
              <F label="Discount %"><input type="number" value={bdDisc} onChange={(e) => setBdDisc(e.target.value)} className={inputLg} /></F>
              <F label="Discount 2 %"><input type="number" value={bdDisc2} onChange={(e) => setBdDisc2(e.target.value)} className={inputLg} /></F>
              <F label="Price Code"><input value={bdPrice} onChange={(e) => setBdPrice(e.target.value)} className={inputLg} /></F>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2"><Button variant="outline" onClick={() => setBdOpen(false)} className="w-full sm:w-auto">Cancel</Button><Button onClick={saveBd} className="w-full sm:w-auto">{editBd ? "Update" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {confirmDialog}
      </CardContent>
    </Card>
  );
}
