import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { canAccessModule, navigationChildren, type ModuleNode } from "#/app/modules";
import { useAuth } from "#/lib/auth";
import { ModulePlaceholder } from "#/features/common/ModulePlaceholder";
import { LegacyDivisionFormNav } from "#/features/common/LegacyDivisionFormNav";
import { LegacySalesReportToolbar } from "#/features/reports/legacySalesReportChrome";

/**
 * Same URL-driven behaviour as {@link TabsLayout}, but renders the legacy sales
 * report toolbar and division banner *above* the tab strip (matches desktop ERP).
 */
export function LegacySalesReportTabsLayout({ node }: { node: ModuleNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, permissions } = useAuth();

  const children = navigationChildren(node);

  const pathname = location.pathname.replace(/\/$/, "") || "/";

  useEffect(() => {
    if (!node.hideSelfTab || !node.tabsDefaultRedirect) return;

    const base = node.path.replace(/\/$/, "") || node.path;

    if (pathname !== base) return;

    const target = node.tabsDefaultRedirect.replace(/\/$/, "") || "";

    if (!target || pathname === target) return;

    navigate(target, { replace: true });
  }, [navigate, node.hideSelfTab, node.path, node.tabsDefaultRedirect, pathname]);

  type Tab = { value: string; label: string; node: ModuleNode; disabled: boolean };
  const tabs: Tab[] = [];
  if (node.Component && !node.hideSelfTab) {
    tabs.push({ value: node.path, label: node.label, node, disabled: !canAccessModule(node, user, permissions) });
  }
  for (const c of children) {
    tabs.push({ value: c.path, label: c.label, node: c, disabled: !canAccessModule(c, user, permissions) });
  }

  const firstEnabled = tabs.find((t) => !t.disabled);
  const matched =
    tabs
      .map((t) => t.value)
      .filter((p) => location.pathname === p || location.pathname.startsWith(p + "/"))
      .sort((a, b) => b.length - a.length)[0] ??
    firstEnabled?.value ??
    node.path;

  const matchedTab = tabs.find((t) => t.value === matched);
  const active = matchedTab?.disabled ? (firstEnabled?.value ?? node.path) : matched;
  const activeNode = tabs.find((t) => t.value === active)?.node ?? node;

  useEffect(() => {
    if (matchedTab?.disabled && firstEnabled && active !== pathname) {
      navigate(active, { replace: true });
    }
  }, [active, firstEnabled, matchedTab?.disabled, navigate, pathname]);

  const noop = () => {};

  return (
    <div className="min-w-0 space-y-3">
      <LegacySalesReportToolbar toolbarVariant="transaction" />
      <LegacyDivisionFormNav onPreviousForm={noop} onNextForm={noop} />

      <Tabs value={active} onValueChange={(v) => {
        const t = tabs.find((x) => x.value === v);
        if (!t?.disabled) navigate(v);
      }} className="w-full min-w-0 max-w-full space-y-1">
        <TabsList
          aria-label={`${node.label} sections`}
          className="h-auto min-h-12 flex-wrap justify-start gap-1 border-2 border-border bg-muted/40 p-1 sm:p-1.5"
        >
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              disabled={t.disabled}
              title={t.disabled ? "You do not have access to this menu." : undefined}
              className="shrink-0 px-3 py-2 text-xs font-semibold min-h-9 sm:text-sm sm:min-h-10 data-[state=active]:bg-[#EBE7DC] dark:data-[state=active]:bg-card"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={active} forceMount className="w-full min-w-0 max-w-full mt-3 sm:mt-4">
          {activeNode.Component ? (
            <activeNode.Component />
          ) : (
            <ModulePlaceholder node={activeNode} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
