import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Term } from "@/components/ui/tooltip";
import { hasRole, useAuth } from "@/lib/auth";
import { formatNumber } from "@/lib/utils";
import {
  ArrowRight, Truck, ArrowLeftRight, FileText, Boxes, AlertTriangle,
  TrendingUp, Wallet, Receipt, CalendarClock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FinancialSummary {
  totalARDue: number; revenueMTD: number; revenueYTD: number;
  openInvoices: number; overdueInvoices: number;
}

interface LowStockRow { itemId: string; sku: string; name: string; onHand: number; reorderLevel: number | null; }

export function DashboardPage() {
  const { user } = useAuth();
  const isSuperAdmin = hasRole(user, "SuperAdmin");

  const summary = useQuery({
    queryKey: ["financial-summary"],
    queryFn: () => api.get("reports/financial-summary").json<FinancialSummary>(),
    enabled: isSuperAdmin,
  });

  const lowStock = useQuery({
    queryKey: ["low-stock"],
    queryFn: () => api.get("reports/low-stock").json<LowStockRow[]>(),
  });

  const greeting = greetingFor(new Date());
  const firstName = user?.fullName.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-muted-foreground">{greeting}, {firstName}</h2>
        <p className="text-base sm:text-lg mt-1">Here's what needs your attention today.</p>
      </div>

      {/* Quick actions — the 4 most-used screens, big and obvious */}
      <section aria-labelledby="quick-actions">
        <h3 id="quick-actions" className="sr-only">Quick actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction to="/inbound"  icon={Truck}         title="Receive goods"   subtitle="Record stock coming in" />
          <QuickAction to="/outbound" icon={ArrowLeftRight} title="Send goods"     subtitle="Deliver to a customer" />
          <QuickAction to="/invoices" icon={FileText}      title="Create invoice"  subtitle="Bill a customer" />
          <QuickAction to="/items"    icon={Boxes}         title="Add an item"     subtitle="New product in master data" />
        </div>
      </section>

      {/* Financial stats - SuperAdmin only */}
      {isSuperAdmin && (
        <section aria-labelledby="financials" className="space-y-3">
          <h3 id="financials" className="text-xl font-bold">Money this period</h3>
          {summary.isLoading && <Spinner label="Loading financials…" />}
          {summary.data && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Stat icon={Wallet}        title={<>Owed to us (<Term name="A/R">Accounts Receivable — money customers still owe you.</Term>)</>}
                    value={formatNumber(summary.data.totalARDue)} prefix="Rp" />
              <Stat icon={TrendingUp}    title="Revenue this month" value={formatNumber(summary.data.revenueMTD)} prefix="Rp" />
              <Stat icon={TrendingUp}    title="Revenue this year"  value={formatNumber(summary.data.revenueYTD)} prefix="Rp" />
              <Stat icon={Receipt}       title="Open invoices"      value={summary.data.openInvoices} />
              <Stat icon={CalendarClock} title="Overdue invoices"   value={summary.data.overdueInvoices} tone={summary.data.overdueInvoices > 0 ? "warning" : "neutral"} />
            </div>
          )}
        </section>
      )}

      {/* Low stock */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-warning" />
            Stock running low
          </CardTitle>
          <CardDescription>Items that have dropped below the reorder level you set on each item.</CardDescription>
        </CardHeader>
        <CardContent>
          {lowStock.isLoading && <Spinner label="Checking stock levels…" />}
          {lowStock.data && lowStock.data.length === 0 && (
            <div className="flex items-center gap-3 text-base text-success">
              <span className="size-3 rounded-full bg-success" aria-hidden />
              All items are above their reorder level. Nothing to do here.
            </div>
          )}
          {lowStock.data && lowStock.data.length > 0 && (
            <ul className="divide-y-2">
              {lowStock.data.map((r) => (
                <li key={r.itemId} className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-base font-bold">{r.sku}</div>
                    <div className="text-base text-muted-foreground">{r.name}</div>
                  </div>
                  <div className="text-right">
                    <Badge tone="warning">On hand: {formatNumber(r.onHand)}</Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      Reorder at: {r.reorderLevel ?? "—"}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 11) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function QuickAction({ to, icon: Icon, title, subtitle }: { to: string; icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <Link
      to={to}
      className="group relative rounded-[var(--radius)] border-2 bg-card p-4 sm:p-5 transition-colors hover:border-primary hover:bg-primary/5 focus-visible:border-primary"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-full bg-primary/10 p-2.5 sm:p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden />
      </div>
      <div className="mt-3 text-base sm:text-lg font-bold leading-tight">{title}</div>
      <div className="text-sm sm:text-base text-muted-foreground leading-tight">{subtitle}</div>
    </Link>
  );
}

function Stat({
  icon: Icon, title, value, prefix, tone = "neutral",
}: {
  icon: LucideIcon;
  title: ReactNode;
  value: string | number;
  prefix?: string;
  tone?: "neutral" | "warning";
}) {
  return (
    <Card>
      <CardContent className="pt-5 sm:pt-6">
        <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate">{title}</span>
        </div>
        <div className={"mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold tabular-nums break-words " + (tone === "warning" ? "text-warning" : "")}>
          {prefix && <span className="text-base sm:text-xl font-semibold mr-1 text-muted-foreground">{prefix}</span>}
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
