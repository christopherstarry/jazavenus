import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "#/lib/api";
import { describeApiError } from "#/lib/apiErrors";
import { toast } from "#/components/ui/use-toast";
import { Input } from "#/components/ui/input";
import { Card, CardContent } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";
import { LegacyTransactionToolbar, useLegacyShortcuts } from "#/features/common/LegacyTransactionToolbar";
import { cn } from "#/lib/utils";
import "#/features/inventory/inventoryI18n";

const StockTakeStatus = { Counting: 0, Posted: 10 } as const;

interface StockTakeLineDto {
  id?: string;
  lineNumber: number;
  itemId: string;
  itemSku?: string | null;
  itemName?: string | null;
  locationId?: string | null;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
}

interface StockTakeSessionDto {
  id: string;
  number: string;
  division: string;
  status: number;
  warehouseId: string;
  warehouseCode?: string | null;
  sessionDate: string;
  notes?: string | null;
  lines: StockTakeLineDto[];
}

/** Stock Taking Record — enter physical counts against a prepared session, then post variances. See docs/modules/inventory/prds/stock-taking.md. */
export function StockTakingRecordPage() {
  const { t } = useTranslation(["inventory", "dialog"]);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionParam = params.get("session");

  const [sessionId, setSessionId] = useState<string | null>(sessionParam);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [lines, setLines] = useState<StockTakeLineDto[]>([]);
  const [session, setSession] = useState<StockTakeSessionDto | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => setSessionId(sessionParam), [sessionParam]);

  const sessionQuery = useQuery({
    queryKey: ["stock-take", sessionId],
    queryFn: () => api.get(`inventory/stock-takes/${sessionId}`).json<StockTakeSessionDto>(),
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (sessionQuery.data) {
      setSession(sessionQuery.data);
      setLines(sessionQuery.data.lines);
      setDirty(false);
    }
  }, [sessionQuery.data]);

  const isPosted = session?.status === StockTakeStatus.Posted;

  const saveMutation = useMutation({
    mutationFn: async () => {
      await api.put(`inventory/stock-takes/${sessionId}/lines`, {
        json: { lines: lines.map((l) => ({ lineNumber: l.lineNumber, itemId: l.itemId, locationId: l.locationId ?? null, countedQuantity: l.countedQuantity })) },
      });
    },
    onSuccess: () => {
      toast({ title: t("dialog:saveSuccess"), variant: "success" });
      void sessionQuery.refetch();
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      await api.post(`inventory/stock-takes/${sessionId}/post`);
    },
    onSuccess: () => {
      toast({ title: t("dialog:postSuccess"), variant: "success" });
      void sessionQuery.refetch();
    },
    onError: async (err) => toast({ title: t("dialog:genericError"), description: await describeApiError(err), variant: "destructive" }),
  });

  const updateCounted = useCallback((lineNumber: number, value: number) => {
    setLines((prev) => prev.map((l) => (l.lineNumber === lineNumber ? { ...l, countedQuantity: value, variance: value - l.systemQuantity } : l)));
    setDirty(true);
  }, []);

  useLegacyShortcuts({
    onSave: !isPosted && sessionId ? () => saveMutation.mutate() : undefined,
    onBrowse: () => setBrowseOpen(true),
    onExecute: !isPosted && sessionId ? () => postMutation.mutate() : undefined,
    onClose: () => navigate("/inventory"),
  });

  const totalVariance = useMemo(() => lines.reduce((sum, l) => sum + Math.abs(l.variance), 0), [lines]);

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <LegacyDivisionFormNav onPreviousForm={() => {}} onNextForm={() => {}} />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t("inventory:stockTaking.recordTitle")}</h1>
        {session && <Badge tone={isPosted ? "success" : "neutral"}>{session.number}</Badge>}
      </div>

      <LegacyTransactionToolbar
        mode="transaction"
        formState={!session ? "init" : isPosted ? "posted" : "normal"}
        canEdit
        canDelete={false}
        isDirty={dirty}
        isSaving={saveMutation.isPending}
        onNew={() => navigate("/inventory/stock-taking-preparation")}
        onSave={() => saveMutation.mutate()}
        onExecute={() => postMutation.mutate()}
        onClose={() => navigate("/inventory")}
      />

      {!session ? (
        <Card>
          <CardContent className="pt-4 text-center text-muted-foreground">
            <button type="button" className="font-semibold text-primary underline" onClick={() => setBrowseOpen(true)}>
              {t("inventory:stockTaking.loadSession")}
            </button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("inventory:common.item")}</TableHead>
                  <TableHead>{t("inventory:stockTaking.systemQty")}</TableHead>
                  <TableHead>{t("inventory:stockTaking.countedQty")}</TableHead>
                  <TableHead>{t("inventory:stockTaking.variance")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((l) => (
                  <TableRow key={l.lineNumber}>
                    <TableCell>
                      <span className="font-mono">{l.itemSku}</span> <span className="text-muted-foreground">{l.itemName}</span>
                    </TableCell>
                    <TableCell className="font-mono">{l.systemQuantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-9 w-28"
                        value={l.countedQuantity}
                        disabled={isPosted}
                        onChange={(e) => updateCounted(l.lineNumber, Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell className={cn("font-mono", l.variance !== 0 && (l.variance > 0 ? "text-blue-600" : "text-red-600"))}>{l.variance}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-3 text-sm text-muted-foreground">{t("common:total")} |{t("inventory:stockTaking.variance")}|: {totalVariance}</p>
          </CardContent>
        </Card>
      )}

      {browseOpen && <SessionPicker onClose={() => setBrowseOpen(false)} onPick={(id) => { setSessionId(id); setBrowseOpen(false); }} />}
    </div>
  );
}

function SessionPicker({ onPick, onClose }: { onPick: (id: string) => void; onClose: () => void }) {
  const { t } = useTranslation("dialog");
  const query = useQuery({
    queryKey: ["stock-take-sessions"],
    queryFn: () => api.get("inventory/stock-takes", { searchParams: { page: 1, pageSize: 20 } }).json<{ items: StockTakeSessionDto[] }>(),
  });
  return (
    <Card>
      <CardContent className="pt-4">
        {query.isLoading ? (
          <p className="text-muted-foreground">{t("common:loading")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{t("common:status")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data?.items.map((s) => (
                <TableRow key={s.id} className="cursor-pointer" onClick={() => onPick(s.id)}>
                  <TableCell className="font-mono">{s.number}</TableCell>
                  <TableCell>{s.status === StockTakeStatus.Posted ? t("inventory:stockTaking.statusPosted") : t("inventory:stockTaking.statusCounting")}</TableCell>
                  <TableCell />
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <button type="button" className="mt-3 text-sm underline" onClick={onClose}>
          {t("common:close")}
        </button>
      </CardContent>
    </Card>
  );
}
