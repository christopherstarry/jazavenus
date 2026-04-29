import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { ArrowLeftRight, BarChart3, ClipboardList } from "lucide-react";
import { AppLayout } from "@/app/AppLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ItemsPage } from "@/features/items/ItemsPage";
import { SuppliersPage } from "@/features/suppliers/SuppliersPage";
import { CustomersPage } from "@/features/customers/CustomersPage";
import { GrnsPage } from "@/features/inbound/GrnsPage";
import { InvoicesPage } from "@/features/invoices/InvoicesPage";
import { SettingsPanel } from "@/features/settings/SettingsPanel";
import { PlaceholderPage } from "@/features/common/PlaceholderPage";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth";

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 flex justify-center"><Spinner label="Checking your sign-in…" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/",          element: <DashboardPage /> },
          { path: "/items",     element: <ItemsPage /> },
          { path: "/suppliers", element: <SuppliersPage /> },
          { path: "/customers", element: <CustomersPage /> },
          { path: "/inbound",   element: <GrnsPage /> },
          { path: "/outbound",  element: <PlaceholderPage icon={ArrowLeftRight} title="Goods going out" description="Delivery orders to your customers will appear here. Coming soon." /> },
          { path: "/invoices",  element: <InvoicesPage /> },
          { path: "/stock",     element: <PlaceholderPage icon={ClipboardList} title="Stock on hand" description="Live inventory levels per warehouse and item. Coming soon." /> },
          { path: "/reports",   element: <PlaceholderPage icon={BarChart3} title="Reports" description="Stock card, daily movements, low-stock and financial reports. Coming soon." /> },
          { path: "/settings",  element: <SettingsPanel /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
