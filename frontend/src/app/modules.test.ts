import { describe, expect, it } from "vitest";
import {
  TREE,
  flattenModules,
  findModuleByPath,
  trailFor,
} from "./modules";

/**
 * The module tree drives the sidebar, the router and breadcrumbs at the
 * same time. If anything in here is wrong the whole nav breaks, so we
 * lock in the invariants we rely on.
 */
describe("module tree", () => {
  const all = flattenModules();

  it("has unique ids", () => {
    const ids = all.map((m) => m.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  it("has unique paths", () => {
    const paths = all.map((m) => m.path);
    const dupes = paths.filter((p, i) => paths.indexOf(p) !== i);
    expect(dupes).toEqual([]);
  });

  it("every child path is nested under its parent path", () => {
    const offenders: string[] = [];
    const visit = (parent: typeof TREE[number]) => {
      for (const child of parent.children ?? []) {
        if (parent.path !== "/" && !child.path.startsWith(parent.path + "/")) {
          offenders.push(`${child.path} not under ${parent.path}`);
        }
        visit(child);
      }
    };
    TREE.forEach(visit);
    expect(offenders).toEqual([]);
  });

  it("includes a Dashboard root, System, Master Maintenance, Report and Tax Form", () => {
    const ids = new Set(all.map((m) => m.id));
    expect(ids).toContain("dashboard");
    expect(ids).toContain("system");
    expect(ids).toContain("master");
    expect(ids).toContain("report");
    expect(ids).toContain("tax");
  });
});

describe("findModuleByPath", () => {
  it("returns the dashboard for the root path", () => {
    expect(findModuleByPath("/")?.id).toBe("dashboard");
  });

  it("returns a leaf when its exact path is hit", () => {
    expect(findModuleByPath("/master/employee")?.id).toBe("master.employee");
  });

  it("returns the deepest module for a nested path (longest prefix wins)", () => {
    expect(findModuleByPath("/master/customer/class-outlet")?.id).toBe(
      "master.customer.class-outlet",
    );
  });

  it("returns undefined for an unknown path", () => {
    expect(findModuleByPath("/totally-not-a-page")).toBeUndefined();
  });
});

describe("trailFor (breadcrumb chain)", () => {
  it("builds parent → child for a leaf", () => {
    const trail = trailFor("/master/customer/class-outlet").map((n) => n.id);
    expect(trail).toEqual([
      "master",
      "master.customer",
      "master.customer.class-outlet",
    ]);
  });

  it("returns just the dashboard at the root", () => {
    const trail = trailFor("/").map((n) => n.id);
    expect(trail).toEqual(["dashboard"]);
  });

  it("returns an empty trail for an unknown path", () => {
    expect(trailFor("/no-such-path")).toEqual([]);
  });
});
