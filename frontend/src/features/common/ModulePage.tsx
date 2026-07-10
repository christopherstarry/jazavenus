import { type ModuleNode } from "#/app/modules";
import { LegacySalesReportTabsLayout } from "#/features/reports/shared/LegacySalesReportTabsLayout";
import { HubPage } from "./HubPage";
import { TabsLayout } from "./TabsLayout";
import { ModulePlaceholder } from "./ModulePlaceholder";

/**
 * Decides what to render for a given module node:
 *
 *   1. childLayout === "tabs" + children â†’ tabbed page (TabsLayout decides
 *      whether the active tab uses node.Component, a child Component, or a
 *      placeholder).
 *   2. node.Component                    â†’ render the custom screen.
 *   3. children present                  â†’ hub page with big tile grid.
 *   4. otherwise                         â†’ friendly "coming soon" placeholder.
 */
export function ModulePage({ node }: { node: ModuleNode }) {
  if (node.childLayout === "tabs" && node.children && node.children.length > 0) {
    if (node.legacyReportTabsChrome) {
      return <LegacySalesReportTabsLayout node={node} />;
    }
    return <TabsLayout node={node} />;
  }
  if (node.Component) {
    const C = node.Component;
    return <C />;
  }
  if (node.children && node.children.length > 0) {
    return <HubPage node={node} />;
  }
  return <ModulePlaceholder node={node} />;
}
