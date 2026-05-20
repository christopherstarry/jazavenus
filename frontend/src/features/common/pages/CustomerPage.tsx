import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Database, Lock } from "lucide-react";
import { api } from "#/lib/api";
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

interface CustomerDto {
  id: string; code: string; name: string; taxId: string | null;
  email: string | null; phone: string | null;
  billingAddress: string | null; shippingAddress: string | null;
  city: string | null; country: string | null;
  creditLimit: number; paymentTermsDays: number; isActive: boolean;
}

const inputLg = "min-h-[48px] text-base rounded-[var(--radius)] border-2 border-input bg-background px-3 w-full focus-visible:outline-none focus-visible:border-ring";

export function CustomerPage() {
  const queryClient = useQueryClient();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerDto | null>(null);
  const [form, setForm] = useState({ code: "", name: "", taxId: "", email: "", phone: "", billingAddress: "", shippingAddress: "", city: "", country: "" });
  const [creditLimit, setCreditLimit] = useState("0");
  const [paymentTermsDays, setPaymentTermsDays] = useState("30");
  const [isActive, setIsActive] = useState(true);

  const q = useQuery({
    queryKey: ["master/customers", page, search],
    queryFn: () => api.get("master/customers", { searchParams: { page, pageSize: 20, search } }).json<PagedResult<CustomerDto>>(),
    placeholderData: (prev) => prev,
  });

  const createMut = useMutation({
    mutationFn: (dto: Record<string, unknown>) => api.post("master/customers", { json: dto }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["master/customers"] }); setDialogOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Record<string, unknown> }) => api.put(`master/customers/${id}`, { json: dto }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["master/customers"] }); setDialogOpen(false); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`master/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["master/customers"] }),
  });

  function openCreate() {
    setForm({ code: "", name: "", taxId: "", email: "", phone: "", billingAddress: "", shippingAddress: "", city: "", country: "" });
    setCreditLimit("0"); setPaymentTermsDays("30"); setIsActive(true); setEditing(null); setDialogOpen(true);
  }

  function openEdit(row: CustomerDto) {
    setForm({ code: row.code, name: row.name, taxId: row.taxId ?? "", email: row.email ?? "", phone: row.phone ?? "", billingAddress: row.billingAddress ?? "", shippingAddress: row.shippingAddress ?? "", city: row.city ?? "", country: row.country ?? "" });
    setCreditLimit(String(row.creditLimit)); setPaymentTermsDays(String(row.paymentTermsDays)); setIsActive(row.isActive); setEditing(row); setDialogOpen(true);
  }

  async function handleDelete(row: CustomerDto) {
    const ok = await confirm({ title: "Delete Customer?", description: `Delete ${row.name}? This cannot be undone.`, destructive: true });
    if (ok) deleteMut.mutate(row.id);
  }

  function handleSave() {
    const dto: Record<string, unknown> = { ...form, creditLimit: Number(creditLimit), paymentTermsDays: Number(paymentTermsDays), isActive };
    if (editing) updateMut.mutate({ id: editing.id, dto }); else createMut.mutate(dto);
  }

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-2xl sm:text-3xl font-bold">Customers</CardTitle>
        <Button onClick={openCreate} size="lg" className="w-full sm:w-auto text-base min-h-[48px]">
          <Plus className="h-5 w-5 mr-2" /> New Customer
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="search" placeholder="Search by code or name…" className="pl-10 h-12 text-base" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {q.isLoading && <Spinner label="Loading customers…" />}
        {q.data && q.data.items.length === 0 && <EmptyState icon={Database} title="No customers" description="No records found." action={<Button onClick={openCreate} size="lg" className="text-base"><Plus className="h-5 w-5 mr-2" /> New Customer</Button>} />}

        {q.data && q.data.items.length > 0 && (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
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
                        <TableCell className="font-mono text-base py-3">{row.code}</TableCell>
                        <TableCell className="text-base py-3 font-medium">{row.name}</TableCell>
                        <TableCell className="hidden md:table-cell text-base py-3">{row.city ?? "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-base py-3">{row.phone ?? "—"}</TableCell>
                        <TableCell className="py-3">
                          <Badge tone={row.isActive ? "success" : "destructive"} className="text-sm px-3 py-1">{row.isActive ? "Active" : "Locked"}</Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10" onClick={(e) => { e.stopPropagation(); openEdit(row); }} title="Edit"><Pencil className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(row); }} title="Delete"><Trash2 className="h-5 w-5" /></Button>
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{editing ? "Edit Customer" : "New Customer"}</DialogTitle>
              <DialogDescription className="text-base">Fill in the customer details below.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-4">
              {([["code", "Code *"], ["name", "Name *"], ["taxId", "Tax ID"], ["email", "Email"], ["phone", "Phone"]] as const).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={`c-${key}`} className="text-base font-medium">{label}</Label>
                  <input id={`c-${key}`} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} className={inputLg} autoComplete="off" />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label htmlFor="c-creditLimit" className="text-base font-medium">Credit Limit</Label>
                <input id="c-creditLimit" type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} className={inputLg} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-paymentTerms" className="text-base font-medium">Payment Terms (days)</Label>
                <input id="c-paymentTerms" type="number" value={paymentTermsDays} onChange={(e) => setPaymentTermsDays(e.target.value)} className={inputLg} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="c-billingAddress" className="text-base font-medium">Billing Address</Label>
                <textarea id="c-billingAddress" value={form.billingAddress} onChange={(e) => setForm((p) => ({ ...p, billingAddress: e.target.value }))} className={`${inputLg} min-h-[80px] resize-y`} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="c-shippingAddress" className="text-base font-medium">Shipping Address</Label>
                <textarea id="c-shippingAddress" value={form.shippingAddress} onChange={(e) => setForm((p) => ({ ...p, shippingAddress: e.target.value }))} className={`${inputLg} min-h-[80px] resize-y`} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-city" className="text-base font-medium">City</Label>
                <input id="c-city" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className={inputLg} autoComplete="off" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-country" className="text-base font-medium">Country</Label>
                <input id="c-country" value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} className={inputLg} autoComplete="off" />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer min-h-[48px]">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-6 w-6 rounded border-2 border-input accent-primary" />
                  <span className="text-base font-medium">{isActive ? "Active" : "Locked (blacklisted)"}</span>
                  {!isActive && <Lock className="h-5 w-5 text-destructive" />}
                </label>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} size="lg" className="w-full sm:w-auto text-base min-h-[48px]">Cancel</Button>
              <Button onClick={handleSave} disabled={!form.code || !form.name || isPending} size="lg" className="w-full sm:w-auto text-base min-h-[48px]">
                {isPending ? "Saving…" : editing ? "Update Customer" : "Create Customer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {confirmDialog}
      </CardContent>
    </Card>
  );
}
