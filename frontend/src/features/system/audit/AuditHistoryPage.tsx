import { useState, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, FileText, EyeOff, Calendar } from "lucide-react";
import { api } from "#/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { Badge } from "#/components/ui/badge";
import { EmptyState } from "#/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { AuditLogDetailDialog } from "#/features/system/audit/AuditLogDetailDialog";
import type { PagedResult } from "#/features/common/CrudPage";

interface AuditLogDto {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  entity: string;
  entityId: string | null;
  entityCode: string | null;
  module: string | null;
  notes: string;
  occurredAtUtc: string;
  ipAddress: string | null;
  beforeJson: string | null;
  afterJson: string | null;
  changesJson: string | null;
}

const ENTITY_GROUPS = [
  { key: "", label: "All" },
  { key: "customer", label: "Customers" },
  { key: "customer_address", label: "Addresses" },
  { key: "product", label: "Products" },
  { key: "product_price", label: "Prices" },
  { key: "product_discount", label: "Discounts" },
  { key: "brand", label: "Brands" },
  { key: "supplier", label: "Suppliers" },
  { key: "salesman", label: "Salesmen" },
  { key: "collector", label: "Collectors" },
  { key: "area", label: "Areas" },
  { key: "warehouse", label: "Warehouses" },
  { key: "bank", label: "Banks" },
  { key: "payment_term", label: "Payment Terms" },
  { key: "outlet_type", label: "Outlet Types" },
  { key: "outlet_group", label: "Outlet Groups" },
  { key: "trade_type", label: "Trade Types" },
  { key: "price_tier", label: "Price Tiers" },
  { key: "discount_code", label: "Discount Codes" },
  { key: "unit_of_measure", label: "UOM" },
  { key: "tax_registration", label: "Tax Registrations" },
  { key: "purchase_order", label: "Purchase Orders" },
  { key: "goods_receipt", label: "Goods Receipts" },
  { key: "sales_order", label: "Sales Orders" },
  { key: "delivery", label: "Deliveries" },
  { key: "invoice", label: "Invoices" },
  { key: "payment", label: "Payments" },
  { key: "stock_movement", label: "Stock Movements" },
  { key: "user", label: "Users" },
];

const MODULE_LABELS: Record<string, string> = {
  master: "Master Data",
  purchase: "Purchase",
  sales: "Sales",
  inventory: "Inventory",
  ar: "Accounts Receivable",
  system: "System",
};

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  Create: { label: "Created", icon: "âž•", color: "text-green-600" },
  Update: { label: "Updated", icon: "âœï¸", color: "text-amber-600" },
  Delete: { label: "Deleted", icon: "ðŸ—‘ï¸", color: "text-red-600" },
  Post: { label: "Posted", icon: "âœ…", color: "text-blue-600" },
  Void: { label: "Voided", icon: "â›”", color: "text-red-700" },
};

function toISODateString(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function formatDateTime(utc: string): string {
  const d = new Date(utc);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `Today ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return `Yesterday ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

export function AuditHistoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return toISODateString(d);
  });
  const [dateTo, setDateTo] = useState(() => toISODateString(new Date()));
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);

  const q = useQuery({
    queryKey: ["audit-logs", page, search, entity, action, dateFrom, dateTo],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, pageSize: 20 };
      if (search) params.search = search;
      if (entity) params.entity = entity;
      if (action) params.action = action;
      params.from = dateFrom;
      params.to = dateTo;
      return api.get("audit-logs", { searchParams: params }).json<PagedResult<AuditLogDto>>();
    },
    placeholderData: keepPreviousData,
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle className="text-2xl">Activity History</CardTitle>
          {q.data && (
            <p className="text-sm text-muted-foreground mt-1">
              {q.data.totalCount} total events â€” {dateFrom} to {dateTo}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Action filter buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "", label: "All" },
            { key: "Create", label: "âž• Created" },
            { key: "Update", label: "âœï¸ Updated" },
            { key: "Delete", label: "ðŸ—‘ï¸ Deleted" },
            { key: "Post", label: "âœ… Posted" },
            { key: "Void", label: "â›” Voided" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => { setAction(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${action === f.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">From</span>
            <div
              className="relative flex items-center min-h-[44px] sm:w-[170px] rounded-[var(--radius)] border-2 border-input bg-background cursor-pointer"
              onClick={() => fromRef.current?.showPicker()}
            >
              <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                ref={fromRef}
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full min-h-[44px] bg-transparent pl-10 pr-3 text-base font-medium cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">To</span>
            <div
              className="relative flex items-center min-h-[44px] sm:w-[170px] rounded-[var(--radius)] border-2 border-input bg-background cursor-pointer"
              onClick={() => toRef.current?.showPicker()}
            >
              <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                ref={toRef}
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full min-h-[44px] bg-transparent pl-10 pr-3 text-base font-medium cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>
        </div>

        {/* Entity dropdown + Search */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={entity}
            onChange={(e) => { setEntity(e.target.value); setPage(1); }}
            className="flex h-11 w-full max-w-xs rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium cursor-pointer"
          >
            {ENTITY_GROUPS.map((g) => (
              <option key={g.key} value={g.key}>{g.label}</option>
            ))}
          </select>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by user or entity codeâ€¦"
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {q.isLoading && (
          <div className="flex justify-center py-12">
            <Spinner label="Loading activityâ€¦" />
          </div>
        )}

        {q.data && q.data.items.length === 0 && (
          <EmptyState icon={FileText} title="No activity" description="No audit records match your search." />
        )}

        {q.data && q.data.items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[130px]">When</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                    <TableHead className="w-[140px]">Module</TableHead>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Who</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.items.map((log) => {
                    const act = ACTION_LABELS[log.action] ?? { label: log.action, icon: "â€¢", color: "" };
                    return (
                      <TableRow key={log.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedLog(log)}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateTime(log.occurredAtUtc)}
                        </TableCell>
                        <TableCell>
                          <span className={`text-base ${act.color}`}>
                            {act.icon} {act.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge tone="neutral" className="text-xs">
                            {ENTITY_GROUPS.find((g) => g.key === log.entity)?.label
                              ?? MODULE_LABELS[log.module ?? ""] ?? log.entity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.entityCode || (
                            log.entityId ? <span className="text-muted-foreground text-xs">(ID: {log.entityId.slice(0, 8)}â€¦)</span> : "â€”"
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{log.userName}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View details">
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                {q.data.totalCount} entries Â· Page {q.data.page} of {q.data.totalPages}
              </span>
              <div className="flex items-center gap-2">
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

        {selectedLog && (
          <AuditLogDetailDialog
            log={selectedLog}
            open={!!selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </CardContent>
    </Card>
  );
}
