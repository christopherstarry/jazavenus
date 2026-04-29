import { useNavigate, useLocation } from "react-router";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { type ModuleNode } from "@/app/modules";
import { useAuth, hasRole } from "@/lib/auth";
import { ModulePlaceholder } from "./ModulePlaceholder";

/**
 * Renders a parent page whose children should appear as horizontal tabs
 * (e.g. Customer → Class Outlet, Group, Location, … Master Customer).
 *
 * - The parent's own component (if any) is shown on its plain path
 *   (the FIRST tab). E.g. /master/customer renders CustomersPage.
 * - Each child path swaps the active tab; we keep the URL in sync so
 *   breadcrumbs and refreshes work.
 *
 * Tabs render the leaf component directly to avoid bouncing back through
 * ModulePage (which would loop, since the parent itself is a "tabs" node).
 */
export function TabsLayout({ node }: { node: ModuleNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const visible = (node.children ?? []).filter(
    (c) => !c.superAdminOnly || hasRole(user, "SuperAdmin"),
  );

  // Build the list of tabs. The parent itself is the first tab when it
  // has its own component (its label uses the parent's plain name).
  type Tab = { value: string; label: string; node: ModuleNode };
  const tabs: Tab[] = [];
  if (node.Component && !node.hideSelfTab) {
    tabs.push({ value: node.path, label: node.label, node });
  }
  for (const c of visible) {
    tabs.push({ value: c.path, label: c.label, node: c });
  }

  const active = tabs
    .map((t) => t.value)
    .filter((p) => location.pathname === p || location.pathname.startsWith(p + "/"))
    .sort((a, b) => b.length - a.length)[0]
    ?? tabs[0]?.value
    ?? node.path;

  const activeNode = tabs.find((t) => t.value === active)?.node ?? node;

  return (
    <Tabs value={active} onValueChange={(v) => navigate(v)} className="space-y-1">
      <TabsList aria-label={`${node.label} sections`}>
        {tabs.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={active} forceMount>
        {activeNode.Component
          ? <activeNode.Component />
          : <ModulePlaceholder node={activeNode} />}
      </TabsContent>
    </Tabs>
  );
}
