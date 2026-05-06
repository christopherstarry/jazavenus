import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "#/components/ui/tabs";
import { canAccessModule, navigationChildren, type ModuleNode } from "#/app/modules";
import { useAuth } from "#/lib/auth";
import { ModulePlaceholder } from "./ModulePlaceholder";

/**
 * Renders a parent page whose children should appear as horizontal tabs
 * (e.g. Customer → Class Outlet, Group, Location, … Master Customer).
 *
 * - The parent's own component (if any) is shown on its plain path as the FIRST
 *   tab, unless hideSelfTab (e.g. Product: only subtabs like Brand, Master Product).
 *   Redirect tabsDefaultRedirect when user lands exactly on parent path without a leaf.
 * - Each child path swaps the active tab; we keep the URL in sync so
 *   breadcrumbs and refreshes work.
 *
 * Tabs render the leaf component directly to avoid bouncing back through
 * ModulePage (which would loop, since the parent itself is a "tabs" node).
 */
export function TabsLayout({ node }: { node: ModuleNode }) {
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

  // Build the list of tabs. The parent itself is the first tab when it
  // has its own component (its label uses the parent's plain name).
  type Tab = { value: string; label: string; node: ModuleNode; disabled: boolean };
  const tabs: Tab[] = [];
  if (node.Component && !node.hideSelfTab) {
    tabs.push({ value: node.path, label: node.label, node, disabled: !canAccessModule(node, user, permissions) });
  }
  for (const c of children) {
    tabs.push({ value: c.path, label: c.label, node: c, disabled: !canAccessModule(c, user, permissions) });
  }

  const firstEnabled = tabs.find((t) => !t.disabled);
  const matched = tabs
    .map((t) => t.value)
    .filter((p) => location.pathname === p || location.pathname.startsWith(p + "/"))
    .sort((a, b) => b.length - a.length)[0]
    ?? firstEnabled?.value
    ?? node.path;

  const matchedTab = tabs.find((t) => t.value === matched);
  const active = matchedTab?.disabled ? (firstEnabled?.value ?? node.path) : matched;
  const activeNode = tabs.find((t) => t.value === active)?.node ?? node;

  useEffect(() => {
    if (matchedTab?.disabled && firstEnabled && active !== pathname) {
      navigate(active, { replace: true });
    }
  }, [active, firstEnabled, matchedTab?.disabled, navigate, pathname]);

  return (
    <Tabs value={active} onValueChange={(v) => {
      const t = tabs.find((x) => x.value === v);
      if (!t?.disabled) navigate(v);
    }} className="w-full min-w-0 max-w-full space-y-1">
      <TabsList aria-label={`${node.label} sections`}>
        {tabs.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            disabled={t.disabled}
            title={t.disabled ? "You do not have access to this menu." : undefined}
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* min-w-0: critical on mobile — nested grids/inputs otherwise keep min-width:auto and spill past viewport */}
      <TabsContent value={active} forceMount className="w-full min-w-0 max-w-full">
        {activeNode.Component
          ? <activeNode.Component />
          : <ModulePlaceholder node={activeNode} />}
      </TabsContent>
    </Tabs>
  );
}
