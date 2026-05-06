import { createBrowserRouter, Navigate, Outlet, useLocation, type RouteObject } from "react-router";
import { AppLayout } from "#/app/AppLayout";
import { LoginPage } from "#/features/auth/LoginPage";
import { ModulePage } from "#/features/common/ModulePage";
import { Spinner } from "#/components/ui/spinner";
import { useAuth } from "#/lib/auth";
import { TREE, isModuleVisible, type ModuleNode } from "#/app/modules";

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 flex justify-center"><Spinner label="Checking your sign-in…" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RedirectIfAuthenticated({ children }: { children: React.ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 flex justify-center"><Spinner label="Checking your sign-in…" /></div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

/** Wrap a module route so the user gets bounced to / if they don't have permission for it.
 * The sidebar already hides the link, but URLs can be guessed/bookmarked. */
function ModuleRoute({ node }: { node: ModuleNode }) {
  const { user, permissions, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-10 flex justify-center"><Spinner label="Loading…" /></div>;
  if (!isModuleVisible(node, user, permissions)) {
    // Send the user back to the dashboard with a hint so we can later show a toast.
    return <Navigate to="/" replace state={{ deniedFrom: location.pathname }} />;
  }
  return <ModulePage node={node} />;
}

/** Walk the module tree and derive a flat list of <Route>s.
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
      out.push({ path: n.path,         element: <ModuleRoute node={n} /> });
      out.push({ path: n.path + "/*",  element: <ModuleRoute node={n} /> });
      return; // children are tabs; their URLs are caught by the wildcard
    }
    out.push({ path: n.path, element: <ModuleRoute node={n} /> });
    n.children?.forEach(visit);
  };
  nodes.forEach(visit);
  return out;
}

const moduleRoutes = routesFromTree(TREE);

const routeDefs = [
  { path: "/login", element: <RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated> },
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

export const router = createBrowserRouter(routeDefs);
