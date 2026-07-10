import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Database, Lock } from "lucide-react";
import { api } from "#/lib/api";
import { useAuth } from "#/lib/auth";
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
import type { PagedResult } from "#/features/common/CrudPage";

interface ItemDto {
  id: string; sku: string; name: string; barcode: string | null;
  description: string | null; categoryId: string; categoryName: string | null;
  unitId: string; unitCode: string | null;
  standardCost: number | null; standardPrice: number; currency: string;
  reorderLevel: number | null; reorderQuantity: number | null; isActive: boolean;
}
interface RefDto { id: string; code: string; name: string; isActive: boolean; }

const inputLg = "min-h-[48px] text-base rounded-[var(--radius)] border-2 border-input bg-background px-3 w-full focus-visible:outline-none focus-visible:border-ring";
const selectLg = "min-h-[48px] text-base rounded-[var(--radius)] border-2 border-input bg-background px-3 w-full cursor-pointer appearance-none";

export function ItemPage() {
  const queryClient = useQueryClient();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ItemDto | null>(null);
  const [form, setForm] = useState({ sku: "", name: "", barcode: "", description: "", currency: "IDR" });
  const [categoryId, setCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [standardCost, setStandardCost] = useState("0");
  const [standardPrice, setStandardPrice] = useState("0");
  const [reorderLevel, setReorderLevel] = useState("");
  const [reorderQuantity, setReorderQuantity] = useState("");
  const [isActive, setIsActive] = useState(true);

  const cats = useQuery({ queryKey: ["master/categories"], queryFn: () => api.get("master/categories", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });
  const units = useQuery({ queryKey: ["master/units"], queryFn: () => api.get("master/units", { searchParams: { pageSize: 50 } }).json<PagedResult<RefDto>>() });

  const q = useQuery({
    queryKey: ["master/items", page, search],
    queryFn: () => api.get("master/items", { searchParams: { page, pageSize: 20, search } }).json<PagedResult<ItemDto>>(),
    placeholderData: (prev) => prev,
  });

  const createMut = useMutation({
    mutationFn: (dto: Record<string, unknown>) => api.post("master/items", { json: dto }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["master/items"] }); setDialogOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Record<string, unknown> }) => api.put(`master/items/${id}`, { json: dto }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["master/items"] }); setDialogOpen(false); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`master/items/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["master/items"] }),
  });

  function resetForm() {
    setForm({ sku: "", name: "", barcode: "", description: "", currency: "IDR" });
    setCategoryId(""); setUnitId(""); setStandardCost("0"); setStandardPrice("0");
    setReorderLevel(""); setReorderQuantity(""); setIsActive(true); setEditing(null);
  }

  function openCreate() {
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(row: ItemDto) {
    setForm({ sku: row.sku, name: row.name, barcode: row.barcode ?? "", description: row.description ?? "", currency: row.currency });
    setCategoryId(row.categoryId); setUnitId(row.unitId);
    setStandardCost(String(row.standardCost ?? 0)); setStandardPrice(String(row.standardPrice));
    setReorderLevel(String(row.reorderLevel ?? "")); setReorderQuantity(String(row.reorderQuantity ?? ""));
    setIsActive(row.isActive); setEditing(row); setDialogOpen(true);
  }

  async function handleDelete(row: ItemDto) {
    const ok = await confirm({ title: "Delete Item?", description: `Delete ${row.name}? This cannot be undone.`, destructive: true });
    if (ok) deleteMut.mutate(row.id);
  }

  function handleSave() {
    const dto: Record<string, unknown> = {
      sku: form.sku, name: form.name, barcode: form.barcode || null, description: form.description || null,
      categoryId, unitId, currency: form.currency,
      standardCost: Number(standardCost), standardPrice: Number(standardPrice),
      reorderLevel: reorderLevel ? Number(reorderLevel) : null, reorderQuantity: reorderQuantity ? Number(reorderQuantity) : null,
      isActive,
    };
    if (editing) updateMut.mutate({ id: editing.id, dto }); else createMut.mutate(dto);
  }

  const isPending = createMut.isPending || updateMut.isPending;
  const { user } = useAuth();
  const canDelete = user?.isDeveloper || user?.roles.includes("SuperAdmin");
  const catOptions = cats.data?.items ?? [];
  const unitOptions = units.data?.items ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-2xl sm:text-3xl font-bold">Products / Items</CardTitle>
        <Button onClick={openCreate} size="lg" className="w-full sm:w-auto text-base min-h-[48px]">
          <Plus className="h-5 w-5 mr-2" /> New Item
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="search" placeholder="Search by SKU or name…" className="pl-10 h-12 text-base" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {q.isLoading && <Spinner label="Loading items…" />}
        {q.data && q.data.items.length === 0 && <EmptyState icon={Database} title="No items" description="No records found." action={<Button onClick={openCreate} size="lg" className="text-base"><Plus className="h-5 w-5 mr-2" /> New Item</Button>} />}

        {q.data && q.data.items.length > 0 && (
          <>
            {/* Mobile cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {q.data.items.map((row) => (
                <div key={row.id} className="rounded-lg border-2 border-border bg-card p-4 space-y-2" onClick={() => openEdit(row)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base truncate">{row.sku}</div>
                      <div className="text-sm mt-0.5">{row.name}</div>
                      {row.categoryName && <div className="text-sm text-muted-foreground mt-0.5">{row.categoryName}</div>}
                    </div>
                    <Badge tone={row.isActive ? "success" : "destructive"} className="shrink-0 text-xs">
                      {row.isActive ? "Active" : "Locked"}
                    </Badge>
                  </div>
                  <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" className="h-10 flex-1 text-sm" onClick={() => openEdit(row)}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    {canDelete && (
                      <Button variant="outline" size="sm" className="h-10 flex-1 text-sm text-destructive border-destructive/40 hover:bg-destructive/10" onClick={() => handleDelete(row)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono w-[110px] text-base">SKU</TableHead>
                      <TableHead className="text-base">Name</TableHead>
                      <TableHead className="hidden md:table-cell text-base">Category</TableHead>
                      <TableHead className="hidden lg:table-cell text-base w-[100px] text-right">Price</TableHead>
                      <TableHead className="w-[90px] text-base">Status</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {q.data.items.map((row) => (
                      <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(row)}>
                        <TableCell className="font-mono text-base py-3">{row.sku}</TableCell>
                        <TableCell className="text-base py-3 font-medium">{row.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-base py-3">{row.categoryName ?? "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-base py-3 text-right tabular-nums">{Number(row.standardPrice).toLocaleString()}</TableCell>
                        <TableCell className="py-3">
                          <Badge tone={row.isActive ? "success" : "destructive"} className="text-sm px-3 py-1">{row.isActive ? "Active" : "Locked"}</Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={(e) => { e.stopPropagation(); openEdit(row); }} title="Edit"><Pencil className="h-5 w-5" /></Button>
                            {canDelete && (
                              <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(row); }} title="Delete"><Trash2 className="h-5 w-5" /></Button>
                            )}
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

        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o); }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{editing ? "Edit Item" : "New Item"}</DialogTitle>
              <DialogDescription className="text-base">Fill in the product details below.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="i-sku" className="text-base font-medium">SKU *</Label>
                <input id="i-sku" value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} className={inputLg} placeholder="e.g. 02-7" autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-name" className="text-base font-medium">Name *</Label>
                <input id="i-name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputLg} autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-barcode" className="text-base font-medium">Barcode</Label>
                <input id="i-barcode" value={form.barcode} onChange={(e) => setForm((p) => ({ ...p, barcode: e.target.value }))} className={inputLg} autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-currency" className="text-base font-medium">Currency</Label>
                <input id="i-currency" value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className={inputLg} maxLength={3} autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-category" className="text-base font-medium">Category *</Label>
                <select id="i-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectLg}>
                  <option value="">— Select Category —</option>
                  {catOptions.map((c: RefDto) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-unit" className="text-base font-medium">Unit *</Label>
                <select id="i-unit" value={unitId} onChange={(e) => setUnitId(e.target.value)} className={selectLg}>
                  <option value="">— Select Unit —</option>
                  {unitOptions.map((u: RefDto) => <option key={u.id} value={u.id}>{u.code}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-cost" className="text-base font-medium">Standard Cost</Label>
                <input id="i-cost" type="number" value={standardCost} onChange={(e) => setStandardCost(e.target.value)} className={inputLg} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-price" className="text-base font-medium">Standard Price *</Label>
                <input id="i-price" type="number" value={standardPrice} onChange={(e) => setStandardPrice(e.target.value)} className={inputLg} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-reorder-qty" className="text-base font-medium">Reorder Qty</Label>
                <input id="i-reorder-qty" type="number" value={reorderQuantity} onChange={(e) => setReorderQuantity(e.target.value)} className={inputLg} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="i-reorder-level" className="text-base font-medium">Min Level</Label>
                <input id="i-reorder-level" type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} className={inputLg} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="i-description" className="text-base font-medium">Description</Label>
                <textarea id="i-description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={`${inputLg} min-h-[80px] resize-y`} />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer min-h-[48px]">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-6 w-6 rounded border-2 border-input accent-primary" />
                  <span className="text-base font-medium">{isActive ? "Active" : "Locked (inactive)"}</span>
                  {!isActive && <Lock className="h-5 w-5 text-destructive" />}
                </label>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} size="lg" className="w-full sm:w-auto text-base min-h-[48px]">Cancel</Button>
              <Button onClick={handleSave} disabled={!form.sku || !form.name || !categoryId || !unitId || isPending} size="lg" className="w-full sm:w-auto text-base min-h-[48px]">
                {isPending ? "Saving…" : editing ? "Update Item" : "Create Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {confirmDialog}
      </CardContent>
    </Card>
  );
}
