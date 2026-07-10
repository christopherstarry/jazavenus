import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { useConfirm } from "#/components/ui/confirm";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { Card, CardContent } from "#/components/ui/card";
import { LegacyTransactionToolbar, useLegacyShortcuts, type FormState } from "#/features/common/LegacyTransactionToolbar";
import { LookupDialog, type LookupItem } from "#/features/common/LookupDialog";
import { EditableLineGrid, toSubmitLines, type EditableLineRow } from "#/features/common/EditableLineGrid";
import "#/features/master-data/masterDataI18n";

interface ExtraDiscountLineDto {
  id?: string;
  lineNumber: number;
  customerId?: string | null;
  customerName?: string | null;
  brandId?: string | null;
  brandCode?: string | null;
  itemId?: string | null;
  itemSku?: string | null;
  discount2Percent: number;
  discount3Percent: number;
}

interface ExtraDiscountDto {
  id: string;
  code: string;
  name: string;
  division: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  notes?: string | null;
  lines: ExtraDiscountLineDto[];
}

interface LineRow extends EditableLineRow {
  customerId?: string | null;
  customerCode: string;
  customerName: string;
  brandId?: string | null;
  brandCode: string;
  itemId?: string | null;
  itemCode: string;
  discount2Percent: number;
  discount3Percent: number;
}

function makeEmptyLine(lineNumber: number): LineRow {
  return {
    lineNumber, _status: "insert", customerCode: "", customerName: "", brandCode: "", itemCode: "",
    discount2Percent: 0, discount3Percent: 0,
  };
}

/** Extra Discount (P2/P3) master — legacy extra discount rules. See docs/modules/master-data/prds/extra-discount.md. */
export function ExtraDiscountPage() {
  const { t } = useTranslation(["masterData", "dialog"]);
  const navigate = useNavigate();
  const { confirm, dialog } = useConfirm();

  const [browseOpen, setBrowseOpen] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [effectiveTo, setEffectiveTo] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineRow[]>([]);
  const [dirty, setDirty] = useState(false);

  const isNew = docId === null;
  const formState: FormState = isNew ? (dirty ? "insert" : "init") : "normal";
  const markDirty = useCallback(() => setDirty(true), []);

  const listQuery = useQuery({
    queryKey: ["extra-discounts-nav"],
    queryFn: () => api.get("master/extra-discounts", { searchParams: { page: 1, pageSize: 50 } }).json<{ items: ExtraDiscountDto[] }>(),
  });
  const navList = listQuery.data?.items ?? [];
  const navIndex = navList.findIndex((x) => x.id === docId);

  const resetForm = useCallback(() => {
    setDocId(null);
    setCode("");
    setName("");
    setEffectiveFrom(new Date().toISOString().slice(0, 10));
    setEffectiveTo("");
    setNotes("");
    setLines([]);
    setDirty(false);
  }, []);

  const loadDoc = useCallback((dto: ExtraDiscountDto) => {
    setDocId(dto.id);
    setCode(dto.code);
    setName(dto.name);
    setEffectiveFrom(dto.effectiveFrom.slice(0, 10));
    setEffectiveTo(dto.effectiveTo?.slice(0, 10) ?? "");
    setNotes(dto.notes ?? "");
    setLines(dto.lines.map((l) => ({
      id: l.id, lineNumber: l.lineNumber, _status: "unchanged",
      customerId: l.customerId, customerCode: "", customerName: l.customerName ?? "",
      brandId: l.brandId, brandCode: l.brandCode ?? "",
      itemId: l.itemId, itemCode: l.itemSku ?? "",
      discount2Percent: l.discount2Percent, discount3Percent: l.discount3Percent,
    })));
    setDirty(false);
  }, []);

  const openDoc = useCallback(async (id: string) => loadDoc(await api.get(`master/extra-discounts/${id}`).json<ExtraDiscountDto>()), [loadDoc]);

  const goTo = useCallback((idx: number) => {
    const target = navList[Math.max(0, Math.min(navList.length - 1, idx))];
    if (target) void openDoc(target.id);
  }, [navList, openDoc]);

  const buildPayload = useCallback(
    () => ({
      code, name,
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom).toISOString() : null,
      effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : null,
      isActive: true,
      notes: notes || null,
      lines: toSubmitLines(lines).map((l) => ({
        lineNumber: l.lineNumber, customerId: l.customerId ?? null, brandId: l.brandId ?? null, itemId: l.itemId ?? null,
        discount2Percent: l.discount2Percent, discount3Percent: l.discount3Percent,
      })),
    }),
    [code, name, effectiveFrom, effectiveTo, notes, lines],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload();
      if (!payload.code || !payload.name) throw new Error(t("common:required"));
      if (isNew) loadDoc(await api.post("master/extra-discounts", { json: payload }).json<ExtraDiscountDto>());
      else {
        await api.put(`master/extra-discounts/${docId}`, { json: payload });
        await openDoc(docId!);
      }
      await listQuery.refetch();
    },
    onSuccess: () => toast({ title: t("dialog:saveSuccess"), variant: "success" }),
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`master/extra-discounts/${docId}`),
    onSuccess: async () => {
      toast({ title: t("dialog:deleteSuccess"), variant: "success" });
      resetForm();
      await listQuery.refetch();
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const handleSave = useCallback(async () => {
    if (!isNew) {
      const ok = await confirm({ title: t("dialog:confirmSave"), description: "" });
      if (!ok) return;
    }
    saveMutation.mutate();
  }, [isNew, confirm, saveMutation, t]);

  const handleDelete = useCallback(async () => {
    if (isNew) return;
    const ok = await confirm({ title: t("dialog:confirmDelete"), description: code, destructive: true });
    if (!ok) return;
    deleteMutation.mutate();
  }, [isNew, confirm, deleteMutation, code, t]);

  const handleNew = useCallback(async () => {
    if (dirty) {
      const ok = await confirm({ title: t("masterData:extraDiscount.newDocPrompt"), description: "" });
      if (!ok) return;
    }
    resetForm();
  }, [dirty, confirm, resetForm, t]);

  useLegacyShortcuts({
    onNew: handleNew,
    onSave: handleSave,
    onDelete: !isNew ? handleDelete : undefined,
    onUndo: isNew ? resetForm : undefined,
    onBrowse: () => setBrowseOpen(true),
    onFirst: () => goTo(0),
    onPrevious: () => goTo(navIndex - 1),
    onNext: () => goTo(navIndex + 1),
    onLast: () => goTo(navList.length - 1),
    onClose: () => navigate("/master"),
  });

  const columns = useMemo<ColumnDef<LineRow>[]>(
    () => [
      {
        accessorKey: "customerCode",
        header: t("masterData:extraDiscount.customer"),
        cell: ({ row }) => (
          <LineFk
            code={row.original.customerCode}
            name={row.original.customerName}
            type="customers"
            onSelect={(item) => {
              setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, customerId: item.id, customerCode: item.code, customerName: item.name, _status: l._status === "unchanged" ? "update" : l._status } : l)));
              markDirty();
            }}
          />
        ),
      },
      {
        accessorKey: "brandCode",
        header: t("masterData:extraDiscount.brand"),
        cell: ({ row }) => (
          <LineFk
            code={row.original.brandCode}
            type="brands"
            onSelect={(item) => {
              setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, brandId: item.id, brandCode: item.code, _status: l._status === "unchanged" ? "update" : l._status } : l)));
              markDirty();
            }}
          />
        ),
      },
      {
        accessorKey: "itemCode",
        header: t("masterData:extraDiscount.item"),
        cell: ({ row }) => (
          <LineFk
            code={row.original.itemCode}
            type="items"
            onSelect={(item) => {
              setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, itemId: item.id, itemCode: item.code, _status: l._status === "unchanged" ? "update" : l._status } : l)));
              markDirty();
            }}
          />
        ),
      },
      {
        accessorKey: "discount2Percent",
        header: t("masterData:extraDiscount.disc2"),
        cell: ({ row }) => (
          <Input type="number" className="h-9 w-20" value={row.original.discount2Percent}
            onChange={(e) => { const v = Number(e.target.value); setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, discount2Percent: v, _status: l._status === "unchanged" ? "update" : l._status } : l))); markDirty(); }} />
        ),
      },
      {
        accessorKey: "discount3Percent",
        header: t("masterData:extraDiscount.disc3"),
        cell: ({ row }) => (
          <Input type="number" className="h-9 w-20" value={row.original.discount3Percent}
            onChange={(e) => { const v = Number(e.target.value); setLines((prev) => prev.map((l, i) => (i === row.index ? { ...l, discount3Percent: v, _status: l._status === "unchanged" ? "update" : l._status } : l))); markDirty(); }} />
        ),
      },
    ],
    [t, markDirty],
  );

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <h1 className="text-lg font-bold">{t("masterData:extraDiscount.title")}</h1>

      <LegacyTransactionToolbar
        mode="master"
        formState={formState}
        canEdit
        canDelete
        isDirty={dirty}
        isSaving={saveMutation.isPending}
        onNew={handleNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onUndo={resetForm}
        onFirst={() => goTo(0)}
        onPrevious={() => goTo(navIndex - 1)}
        onNext={() => goTo(navIndex + 1)}
        onLast={() => goTo(navList.length - 1)}
        onClose={() => navigate("/master")}
      />

      <Card>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("masterData:extraDiscount.code")}</Label>
            <Input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); markDirty(); }} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs uppercase tracking-wide">{t("masterData:extraDiscount.name")}</Label>
            <Input value={name} onChange={(e) => { setName(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("masterData:extraDiscount.effectiveFrom")}</Label>
            <Input type="date" value={effectiveFrom} onChange={(e) => { setEffectiveFrom(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wide">{t("masterData:extraDiscount.effectiveTo")}</Label>
            <Input type="date" value={effectiveTo} onChange={(e) => { setEffectiveTo(e.target.value); markDirty(); }} />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label className="text-xs uppercase tracking-wide">{t("masterData:extraDiscount.notes")}</Label>
            <Textarea value={notes} onChange={(e) => { setNotes(e.target.value); markDirty(); }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <EditableLineGrid columns={columns} rows={lines} onRowsChange={(next) => { setLines(next); markDirty(); }} makeEmptyRow={makeEmptyLine} />
        </CardContent>
      </Card>

      <LookupDialog type="extra-discounts" open={browseOpen} onOpenChange={setBrowseOpen} onSelect={(item) => item.id && void openDoc(item.id)} />
      {dialog}
    </div>
  );
}

function LineFk({ code, name, type, onSelect }: { code: string; name?: string; type: "customers" | "brands" | "items"; onSelect: (item: LookupItem) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-w-[10rem] items-center gap-2">
      <Input readOnly className="h-9 w-20 font-mono" value={code} placeholder="—" onClick={() => setOpen(true)} />
      {name && <span className="truncate text-sm text-muted-foreground">{name}</span>}
      <LookupDialog type={type} open={open} onOpenChange={setOpen} onSelect={onSelect} />
    </div>
  );
}
