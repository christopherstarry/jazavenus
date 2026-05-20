import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Database } from "lucide-react";
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

export interface RefField {
  key: string;
  label: string;
  required?: boolean;
  type?: "text" | "number" | "checkbox";
  placeholder?: string;
  className?: string;
}

export interface RefColumn {
  key: string;
  label: string;
  className?: string;
  render?: (value: unknown, row: Record<string, unknown>) => string;
}

interface Props {
  title: string;
  apiPath: string;
  columns: RefColumn[];
  fields: RefField[];
  extraFields?: (dto: Record<string, unknown>, set: (k: string, v: unknown) => void) => React.ReactNode;
  transformDto?: (dto: Record<string, unknown>) => Record<string, unknown>;
  emptyMessage?: string;
  hideStatus?: boolean;
}

export function ReferenceDataPage({ title, apiPath, columns, fields, extraFields, transformDto, emptyMessage, hideStatus }: Props) {
  const queryClient = useQueryClient();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(true);

  const pageSize = 20;

  const q = useQuery({
    queryKey: [apiPath, page, search],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, pageSize };
      if (search) params.search = search;
      return api.get(apiPath, { searchParams: params }).json<PagedResult<Record<string, unknown>>>();
    },
    placeholderData: (prev) => prev,
  });

  const createMut = useMutation({
    mutationFn: async (dto: Record<string, unknown>) => {
      const payload = transformDto ? transformDto(dto) : dto;
      await api.post(apiPath, { json: payload });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [apiPath] }); setDialogOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: Record<string, unknown> }) => {
      const payload = transformDto ? transformDto(dto) : dto;
      await api.put(`${apiPath}/${id}`, { json: payload });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [apiPath] }); setDialogOpen(false); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => { await api.delete(`${apiPath}/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [apiPath] }); },
  });

  function resetForm() {
    const init: Record<string, string> = {};
    fields.forEach((f) => { if (f.type !== "checkbox") init[f.key] = ""; });
    setForm(init);
    setIsActive(true);
    setEditing(null);
  }

  function openCreate() {
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(row: Record<string, unknown>) {
    const init: Record<string, string> = {};
    fields.forEach((f) => { if (f.type !== "checkbox") init[f.key] = String(row[f.key] ?? ""); });
    setForm(init);
    setIsActive(row.isActive !== false);
    setEditing(row);
    setDialogOpen(true);
  }

  async function handleDelete(row: Record<string, unknown>) {
    const ok = await confirm({ title: `Delete ${title}?`, description: `Are you sure you want to delete this ${title.toLowerCase()}? This cannot be undone.`, destructive: true });
    if (ok) deleteMut.mutate(String(row.id));
  }

  async function handleSave() {
    const dto: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.type === "checkbox") return;
      dto[f.key] = f.type === "number" ? Number(form[f.key]) : form[f.key];
    });
    dto.isActive = isActive;
    if (editing) {
      updateMut.mutate({ id: String(editing.id), dto });
    } else {
      createMut.mutate(dto);
    }
  }

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
        <Button onClick={openCreate} size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by code or name…"
            className="pl-9 h-11"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {q.isLoading && <Spinner label={`Loading ${title.toLowerCase()}…`} />}

        {q.data && q.data.items.length === 0 && (
          <EmptyState icon={Database} title={`No ${title.toLowerCase()}`} description={emptyMessage ?? `No records found. Create one to get started.`} action={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> New</Button>} />
        )}

        {q.data && q.data.items.length > 0 && (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col.key} className={col.className ?? ""}>{col.label}</TableHead>
                      ))}
                      {!hideStatus && <TableHead className="w-[80px]">Status</TableHead>}
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {q.data.items.map((row) => (
                      <TableRow key={String(row.id)}>
                        {columns.map((col) => (
                          <TableCell key={col.key} className={col.className ?? ""}>
                            {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                          </TableCell>
                        ))}
                        {!hideStatus && (
                          <TableCell>
                            <Badge tone={row.isActive !== false ? "success" : "destructive"} className="text-xs">
                              {row.isActive !== false ? "Active" : "Locked"}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)} title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(row)} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
              <span className="text-sm text-muted-foreground">
                {q.data.totalCount} entries · Page {q.data.page} of {q.data.totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= q.data.totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

          <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? `Edit ${title}` : `New ${title}`}</DialogTitle>
              <DialogDescription>{editing ? "Update the record details below." : "Fill in the details for the new record."}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {fields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label htmlFor={`f-${f.key}`}>{f.label}{f.required ? "" : " (optional)"}</Label>
                  <Input
                    id={`f-${f.key}`}
                    type={f.type === "number" ? "number" : "text"}
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className={f.className}
                    autoComplete="off"
                  />
                </div>
              ))}
              {extraFields?.(form, (k, v) => setForm((p) => ({ ...p, [k]: String(v) })))}
              {!hideStatus && (
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-5 w-5 rounded border-2 border-input accent-primary"
                  />
                  <span className="text-sm font-medium">{isActive ? "Active" : "Locked"}</span>
                </label>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleSave} disabled={isPending} className="w-full sm:w-auto">
                {isPending ? "Saving…" : editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {confirmDialog}
      </CardContent>
    </Card>
  );
}
