import { type ModuleNode } from "@/app/modules";
import { HubPage } from "./HubPage";
import { TabsLayout } from "./TabsLayout";
import { ModulePlaceholder } from "./ModulePlaceholder";

/**
 * Decides what to render for a given module node:
 *
 *   1. childLayout === "tabs" + children → tabbed page (TabsLayout decides
 *      whether the active tab uses node.Component, a child Component, or a
 *      placeholder).
 *   2. node.Component                    → render the custom screen.
 *   3. children present                  → hub page with big tile grid.
 *   4. otherwise                         → friendly "coming soon" placeholder.
 */
export function ModulePage({ node }: { node: ModuleNode }) {
  if (node.childLayout === "tabs" && node.children && node.children.length > 0) {
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
