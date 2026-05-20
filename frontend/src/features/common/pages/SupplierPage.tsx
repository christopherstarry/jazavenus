import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Database } from "lucide-react";
import { api } from "#/lib/api";
import { useAuth } from "#/lib/auth";
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

interface SupplierDto {
  id: string; code: string; name: string; taxId: string | null;
  email: string | null; phone: string | null; address: string | null;
  city: string | null; country: string | null;
  paymentTermsDays: number; isActive: boolean;
}

export function SupplierPage() {
  const queryClient = useQueryClient();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierDto | null>(null);
  const [form, setForm] = useState({ code: "", name: "", taxId: "", email: "", phone: "", address: "", city: "" });

  const q = useQuery({
    queryKey: ["master/suppliers", page, search],
    queryFn: () => api.get("master/suppliers", { searchParams: { page, pageSize: 20, search } }).json<PagedResult<SupplierDto>>(),
    placeholderData: (prev) => prev,
  });

  const createMut = useMutation({
    mutationFn: (dto: typeof form) => api.post("master/suppliers", { json: dto }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["master/suppliers"] }); setDialogOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: typeof form }) => api.put(`master/suppliers/${id}`, { json: dto }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["master/suppliers"] }); setDialogOpen(false); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`master/suppliers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["master/suppliers"] }),
  });

  function resetForm() { setForm({ code: "", name: "", taxId: "", email: "", phone: "", address: "", city: "" }); setEditing(null); }
  function openCreate() { resetForm(); setDialogOpen(true); }

  function openEdit(row: SupplierDto) { setForm({ code: row.code, name: row.name, taxId: row.taxId ?? "", email: row.email ?? "", phone: row.phone ?? "", address: row.address ?? "", city: row.city ?? "" }); setEditing(row); setDialogOpen(true); }

  async function handleDelete(row: SupplierDto) {
    const ok = await confirm({ title: "Delete Supplier?", description: `Delete ${row.name}? This cannot be undone.`, destructive: true });
    if (ok) deleteMut.mutate(row.id);
  }

  async function handleSave() {
    const dto = { ...form };
    if (editing) updateMut.mutate({ id: editing.id, dto });
    else createMut.mutate(dto);
  }

  const isPending = createMut.isPending || updateMut.isPending;
  const { user } = useAuth();
  const canDelete = user?.isDeveloper || user?.roles.includes("SuperAdmin");

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-xl sm:text-2xl">Suppliers</CardTitle>
        <Button onClick={openCreate} size="sm" className="w-full sm:w-auto"><Plus className="h-4 w-4 mr-1" /> New</Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search by code or name…" className="pl-9 h-11" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {q.isLoading && <Spinner label="Loading suppliers…" />}
        {q.data && q.data.items.length === 0 && <EmptyState icon={Database} title="No suppliers" description="No records found." action={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New</Button>} />}

        {q.data && q.data.items.length > 0 && (
          <>
            {/* Mobile cards */}
            <div className="flex flex-col gap-3 sm:hidden">
              {q.data.items.map((row) => (
                <div key={row.id} className="rounded-lg border-2 border-border bg-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base truncate">{row.code}</div>
                      <div className="text-sm mt-0.5">{row.name}</div>
                      {row.city && <div className="text-sm text-muted-foreground mt-0.5">{row.city}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono w-[120px]">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">City</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono">{row.code}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{row.city ?? "—"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{row.phone ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                          {canDelete && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(row)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
              <span className="text-sm text-muted-foreground">{q.data.totalCount} entries · Page {q.data.page} of {q.data.totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" disabled={page >= q.data.totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        )}

        <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Supplier" : "New Supplier"}</DialogTitle>
              <DialogDescription>{editing ? "Update supplier details." : "Fill in the supplier details."}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              {([["code", "Code"], ["name", "Name"], ["taxId", "Tax ID"], ["email", "Email"], ["phone", "Phone"], ["address", "Address"], ["city", "City"]] as const).map(([key, label]) => (
                <div key={key} className={`space-y-1 ${key === "address" ? "sm:col-span-2" : ""}`}>
                  <Label htmlFor={`s-${key}`}>{label}</Label>
                  <Input id={`s-${key}`} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} autoComplete="off" />
                </div>
              ))}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleSave} disabled={isPending} className="w-full sm:w-auto">{isPending ? "Saving…" : editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {confirmDialog}
      </CardContent>
    </Card>
  );
}
