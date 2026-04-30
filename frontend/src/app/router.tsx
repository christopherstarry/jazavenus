import { createBrowserRouter, Navigate, Outlet, type RouteObject } from "react-router";
import { AppLayout } from "#/app/AppLayout";
import { LoginPage } from "#/features/auth/LoginPage";
import { ModulePage } from "#/features/common/ModulePage";
import { Spinner } from "#/components/ui/spinner";
import { useAuth } from "#/lib/auth";
import { TREE, type ModuleNode } from "#/app/modules";

/** Matches Vite `base` for GitHub Pages project sites (/repo/). Undefined when hosted at /. */
const routerBasename =
  import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "");

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 flex justify-center"><Spinner label="Checking your sign-in…" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/* Walk the module tree and derive a flat list of <Route>s.
 *
 * For "tabs" parents (e.g. /master/customer) we register the parent path
 * AND a catch-all so any sub-path (e.g. /master/customer/class-outlet)
 * also lands on the parent's TabsLayout. The TabsLayout then reads the
 * pathname to pick the active tab. We don't emit individual child
 * routes for tab children, since those URLs are handled by the parent.
 *
 * For everything else, every node — leaf AND parent — gets its own route. */
function routesFromTree(nodes: ModuleNode[]): RouteObject[] {
  const out: RouteObject[] = [];
  const visit = (n: ModuleNode) => {
    if (n.childLayout === "tabs" && n.children?.length) {
      out.push({ path: n.path,         element: <ModulePage node={n} /> });
      out.push({ path: n.path + "/*",  element: <ModulePage node={n} /> });
      return; // children are tabs; their URLs are caught by the wildcard
    }
    out.push({ path: n.path, element: <ModulePage node={n} /> });
    n.children?.forEach(visit);
  };
  nodes.forEach(visit);
  return out;
}

const moduleRoutes = routesFromTree(TREE);

const routeDefs = [
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: moduleRoutes,
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];

export const router = routerBasename
  ? createBrowserRouter(routeDefs, { basename: routerBasename })
  : createBrowserRouter(routeDefs);
