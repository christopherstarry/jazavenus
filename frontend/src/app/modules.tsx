import type { ComponentType } from "react";
import {
  Home,
  Settings,
  Database,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Package,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * The Module Tree
 *
 * Single source of truth that drives:
 *   â€¢ the sidebar
 *   â€¢ the router (every leaf becomes a route)
 *   â€¢ breadcrumbs
 *   â€¢ hub-page tile grids
 *   â€¢ the "recent screens" tracker
 *
 * Labels match the legacy VB application exactly so existing users don't
 * have to relearn anything. New screens go here first; the rest of the
 * app picks them up automatically.
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export type ChildLayout =
  /** Children appear in the sidebar AND on the parent's hub page as tiles. (default for sections) */
  | "sidebar"
  /** Children are tabs at the top of the parent page. They do NOT clutter the sidebar. */
  | "tabs";

/** Canonical module ids known to the auth API (PRD Â§6.1). */
export type ModuleKey = "master" | "purchase" | "sales" | "inventory" | "ar";
export type ReportKey = "sales" | "inventory" | "purchase" | "ar";

export interface ModuleNode {
  /** Stable id used by Recent / Favorites. */
  id: string;
  /** Absolute URL path. */
  path: string;
  /** Exact label as the user knows it from the legacy app. */
  label: string;
  /** Optional one-line plain-language description, shown on hub tiles. */
  description?: string;
  /** Optional Lucide icon. Top-level sections always have one. */
  icon?: LucideIcon;
  /** "SuperAdmin" â†’ only visible to SuperAdmins (legacy gate, kept for system tools). */
  superAdminOnly?: boolean;
  /** "Developer" â†’ only visible to Developer (error logs / dev-only diagnostics). */
  developerOnly?: boolean;
  /**
   * The canonical permission module that gates this navigation item. When set, the sidebar
   * and routing only show the node when the resolved permissions include the module
   * (PRD Â§6.1). Inherited by descendants.
   */
  moduleKey?: ModuleKey;
  /**
   * The canonical permission report-type that gates this report node. When set, the user
   * must have the report listed in `permissions.reports` to see it. Inherited by descendants.
   */
  reportKey?: ReportKey;
  /** Visual divider rendered BEFORE this node in the sidebar (matches the dashes in the user's list). */
  divider?: boolean;
  /** How children are presented; defaults to "sidebar". */
  childLayout?: ChildLayout;
  /** Custom React component for this leaf. Falls back to a "Coming soon" placeholder. */
  Component?: ComponentType;
  /** Hide the parent's own tab in TabsLayout even when it has a Component. */
  hideSelfTab?: boolean;
  /**
   * When `hideSelfTab` is true and the browser URL equals this node's path exactly,
   * replace-history navigate here so tab selection matches URL (typically the leaf
   * that used to duplicate the hidden parent tab).
   */
  tabsDefaultRedirect?: string;
  /** With `childLayout: "tabs"`, render legacy toolbar + division above the tab strip. */
  legacyReportTabsChrome?: boolean;
  children?: ModuleNode[];
}

/* â”€â”€ Helper: walk the tree â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function flattenModules(nodes: ModuleNode[] = TREE): ModuleNode[] {
  const out: ModuleNode[] = [];
  const visit = (n: ModuleNode) => {
    out.push(n);
    n.children?.forEach(visit);
  };
  nodes.forEach(visit);
  return out;
}

/** Find the module that owns the current pathname (longest matching path). */
export function findModuleByPath(pathname: string): ModuleNode | undefined {
  return flattenModules()
    .filter((m) => pathname === m.path || (m.path !== "/" && pathname.startsWith(m.path + "/")))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

/** Build the breadcrumb chain for a path, root-first. */
export function trailFor(pathname: string): ModuleNode[] {
  const match = findModuleByPath(pathname);
  if (!match) return [];
  const path: ModuleNode[] = [];
  const find = (nodes: ModuleNode[], target: ModuleNode): boolean => {
    for (const n of nodes) {
      if (n === target) {
        path.push(n);
        return true;
      }
      if (n.children && find(n.children, target)) {
        path.unshift(n);
        return true;
      }
    }
    return false;
  };
  find(TREE, match);
  return path;
}

/* â”€â”€ Lazy imports for the few real pages we already have â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Each leaf can either point to its real component or fall back to the
 * generic placeholder. We keep these refs at the bottom of the file so that
 * the navigation tree above stays purely declarative.
 * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

import { DashboardPage } from "#/features/dashboard/DashboardPage";
import { PurchaseOrderPage } from "#/features/purchase/PurchaseOrderPage";
import { ReceivingEntryPage } from "#/features/purchase/ReceivingEntryPage";
import { PurchaseReturnPage } from "#/features/purchase/PurchaseReturnPage";
import { SalesOrderPage } from "#/features/sales/SalesOrderPage";
import { SalesConfirmationPage } from "#/features/sales/SalesConfirmationPage";
import { SalesReturnPage } from "#/features/sales/SalesReturnPage";
import { InvoicingProcessPage } from "#/features/sales/InvoicingProcessPage";
import { CreditMemoPage } from "#/features/sales/CreditMemoPage";
import { PaymentReceiptPage } from "#/features/ar/PaymentReceiptPage";
import { BankTransferTransactionPage } from "#/features/ar/BankTransferTransactionPage";
import { PdcClearanceTransactionPage } from "#/features/ar/PdcClearanceTransactionPage";
import { PdcClearanceCancellationPage } from "#/features/ar/PdcClearanceCancellationPage";
import { ArAdjustmentPage } from "#/features/ar/ArAdjustmentPage";
import { ClosingArPage } from "#/features/ar/ClosingArPage";
import { RecalculateArBalancePage } from "#/features/ar/RecalculateArBalancePage";
import { CompanyPreferencesPage } from "#/features/system/CompanyPreferencesPage";
import { PeriodEndProcessesPage } from "#/features/system/PeriodEndProcessesPage";
import { DeleteCancelledDocumentPage } from "#/features/system/DeleteCancelledDocumentPage";
import { BackupRestorePage } from "#/features/system/BackupRestorePage";
import { SettingsPanel } from "#/features/system/settings/SettingsPanel";
import { ManageUsersPage } from "#/features/system/users/ManageUsersPage";
import { AuditHistoryPage } from "#/features/system/audit/AuditHistoryPage";
import { ErrorLogsPage } from "#/features/system/errors/ErrorLogsPage";
import { TaxRegistrationPage } from "#/features/master-data/pages/TaxRegistrationPage";
import { SupplierPage } from "#/features/master-data/pages/SupplierPage";
import { CustomerPage } from "#/features/master-data/pages/CustomerPage";
import { ItemPage } from "#/features/master-data/pages/ItemPage";
import { BrandPage } from "#/features/master-data/pages/BrandPage";
import { BankPage } from "#/features/master-data/pages/BankPage";
import { SalesmanPage } from "#/features/master-data/pages/SalesmanPage";
import { CollectorPage } from "#/features/master-data/pages/CollectorPage";
import { SalesAreaPage } from "#/features/master-data/pages/SalesAreaPage";
import { OutletTypePage } from "#/features/master-data/pages/OutletTypePage";
import { GroupOutletPage } from "#/features/master-data/pages/GroupOutletPage";
import { MarketTypePage } from "#/features/master-data/pages/MarketTypePage";
import { ChannelOutletPage } from "#/features/master-data/pages/ChannelOutletPage";
import { LocationOutletPage } from "#/features/master-data/pages/LocationOutletPage";
import { ClassOutletPage } from "#/features/master-data/pages/ClassOutletPage";
import { CategoryPage } from "#/features/master-data/pages/CategoryPage";
import { SubCategoryPage } from "#/features/master-data/pages/SubCategoryPage";
import { PriceTierPage } from "#/features/master-data/pages/PriceTierPage";
import { DiscountCodePage } from "#/features/master-data/pages/DiscountCodePage";
import { WarehouseTypePage } from "#/features/master-data/pages/WarehouseTypePage";
import { UnitOfMeasurePage } from "#/features/master-data/pages/UnitOfMeasurePage";
import { WarehousePage } from "#/features/master-data/pages/WarehousePage";
import { PaymentTermPage } from "#/features/master-data/pages/PaymentTermPage";
import { CostTypePage } from "#/features/master-data/pages/CostTypePage";
import { OrderCodePage } from "#/features/master-data/pages/OrderCodePage";
import { ReturnCodePage } from "#/features/master-data/pages/ReturnCodePage";
import { ExtraDiscountPage } from "#/features/master-data/ExtraDiscountPage";
import { ItemPricingAndDiscountPage } from "#/features/master-data/ItemPricingAndDiscountPage";
import { BpItemPage } from "#/features/master-data/BpItemPage";
import { PenetrationPage } from "#/features/master-data/PenetrationPage";
import { IncomingTransactionBpbPage } from "#/features/inventory/IncomingTransactionBpbPage";
import { OutgoingTransactionBbkPage } from "#/features/inventory/OutgoingTransactionBbkPage";
import { InterWarehouseTransactionPage } from "#/features/inventory/InterWarehouseTransactionPage";
import { StockTakingPreparationPage } from "#/features/inventory/StockTakingPreparationPage";
import { StockTakingRecordPage } from "#/features/inventory/StockTakingRecordPage";
import { InventoryPlanningPage } from "#/features/inventory/InventoryPlanningPage";
import { legacyReport } from "#/features/reports/LegacyReportPage";
import { ReportSelectorPage } from "#/features/reports/sales/ReportSelectorPage";
import { ProductSellingReportPage } from "#/features/reports/sales/ProductSellingReportPage";
import { DetailTransactionPenjualanReportPage } from "#/features/reports/sales/DetailTransactionPenjualanReportPage";
import {
  RecapitulationSalesReturnByBrandPage,
  RecapitulationSalesReturnByCustomerPage,
  RecapitulationSalesReturnByCustomerWithStatusPage,
  RecapitulationSalesReturnBySalesmanPage,
} from "#/features/reports/sales/RecapitulationSalesReturnVariants";
import { StockPositionReportPage } from "#/features/reports/inventory/StockPositionReportPage";

/* â”€â”€ The actual tree â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export const TREE: ModuleNode[] = [
  {
    id: "dashboard",
    path: "/",
    label: "Dashboard",
    description: "Daily summary at a glance",
    icon: Home,
    Component: DashboardPage,
  },

  /* â”€â”€ System â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  {
    id: "system",
    path: "/system",
    label: "System",
    description: "Logging in/out, period closing, cleanup tools",
    icon: Settings,
    children: [
      {
        id: "system.manage-users",
        path: "/system/manage-users",
        label: "Manage Users",
        description: "View and manage user accounts and permissions",
        superAdminOnly: true,
        Component: ManageUsersPage,
      },
      {
        id: "system.audit-history",
        path: "/system/audit-history",
        label: "Activity History",
        description: "View who did what in the system",
        superAdminOnly: true,
        Component: AuditHistoryPage,
      },
      {
        id: "system.error-logs",
        path: "/system/error-logs",
        label: "Error Logs",
        description: "View application errors and stack traces",
        developerOnly: true,
        Component: ErrorLogsPage,
      },

      {
        id: "system.closing-ar",
        path: "/system/closing-ar-entry",
        label: "Closing A/R Entry",
        description: "Close the period for accounts receivable",
        divider: true,
        superAdminOnly: true,
        Component: ClosingArPage,
      },
      {
        id: "system.recalc-ar",
        path: "/system/recalculate-ar-balance",
        label: "Recalculate AR Balance",
        description: "Rebuild outstanding A/R totals from the ledger",
        superAdminOnly: true,
        Component: RecalculateArBalancePage,
      },
      {
        id: "system.delete-cancelled",
        path: "/system/delete-cancelled-document",
        label: "Delete Cancelled Document",
        description: "Permanently remove cancelled documents",
        superAdminOnly: true,
        Component: DeleteCancelledDocumentPage,
      },
      {
        id: "system.period-end",
        path: "/system/period-end-processes",
        label: "Period-End Processes",
        description: "Monthly and day-end batch processes",
        superAdminOnly: true,
        Component: PeriodEndProcessesPage,
      },
      {
        id: "system.backup-restore",
        path: "/system/backup-restore",
        label: "Backup & Restore",
        description: "Database backup and restore",
        superAdminOnly: true,
        Component: BackupRestorePage,
      },

      {
        id: "system.preferences",
        path: "/system/preferences",
        label: "Preferences",
        description: "Application-wide settings",
        divider: true,
        Component: CompanyPreferencesPage,
      },

      {
        id: "system.cost-operations",
        path: "/system/cost-operations-entry",
        label: "Cost Operations Entry",
        description: "Record operational costs",
        divider: true,
      },
    ],
  },

  /* â”€â”€ Master Maintenance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  {
    id: "master",
    path: "/master",
    label: "Master Maintenance",
    description: "All master records â€” people, products, finance setup",
    icon: Database,
    moduleKey: "master",
    children: [
      /* Customer + its tabs */
      {
        id: "master.customer",
        path: "/master/customer",
        label: "Customer",
        description: "Customers and their outlet classifications",
        divider: true,
        childLayout: "tabs",
        hideSelfTab: true,
        tabsDefaultRedirect: "/master/customer/master-customer",
        Component: CustomerPage,
        children: [
          {
            id: "master.customer.master-customer",
            path: "/master/customer/master-customer",
            label: "Master Customer",
            Component: CustomerPage,
          },
          {
            id: "master.customer.class-outlet",
            path: "/master/customer/class-outlet",
            label: "Table of Class Outlet",
            Component: ClassOutletPage,
          },
          {
            id: "master.customer.group-outlet",
            path: "/master/customer/group-outlet",
            label: "Table Group Outlet",
            Component: GroupOutletPage,
          },
          {
            id: "master.customer.location-outlet",
            path: "/master/customer/location-outlet",
            label: "Table of Location Outlet",
            Component: LocationOutletPage,
          },
          {
            id: "master.customer.market-type",
            path: "/master/customer/market-type",
            label: "Table of Market Type",
            Component: MarketTypePage,
          },
          {
            id: "master.customer.channel-outlet",
            path: "/master/customer/channel-outlet",
            label: "Table of Channel Outlet",
            Component: ChannelOutletPage,
          },
          {
            id: "master.customer.outlet-type",
            path: "/master/customer/outlet-type",
            label: "Table of Outlet Type",
            Component: OutletTypePage,
          },
          {
            id: "master.customer.salesman",
            path: "/master/customer/salesman",
            label: "Table of Salesman",
            Component: SalesmanPage,
          },
          {
            id: "master.customer.collector",
            path: "/master/customer/collector",
            label: "Table of Collector",
            Component: CollectorPage,
          },
          {
            id: "master.customer.sales-area",
            path: "/master/customer/sales-area",
            label: "Table of Sales Area",
            Component: SalesAreaPage,
          },
        ],
      },

      /* Finance / setup masters */
      {
        id: "master.cost-types",
        path: "/master/type-of-costs",
        label: "Type Of Costs",
        description: "Cost categories",
        divider: true,
            Component: CostTypePage,
      },
      {
        id: "master.principle",
        path: "/master/principle",
        label: "Principle",
        description: "Principal companies / suppliers",
            Component: SupplierPage,
      },
      {
        id: "master.term-of-payment",
        path: "/master/term-of-payment",
        label: "Table of Term Of Payment",
        description: "Payment terms (net 30, net 60, â€¦)",
            Component: PaymentTermPage,
      },
      {
        id: "master.bank",
        path: "/master/bank",
        label: "Bank",
        description: "Banks used for payments",
        Component: BankPage,
      },
      {
        id: "master.tax-no",
        path: "/master/tax-no-registration",
        label: "Tax No Registration",
        description: "Tax registrations",
            Component: TaxRegistrationPage,
      },

      /* Product + its tabs */
      {
        id: "master.product",
        path: "/master/product",
        label: "Product",
        description: "Products and their categories, prices, warehouses",
        divider: true,
        childLayout: "tabs",
        hideSelfTab: true,
        tabsDefaultRedirect: "/master/product/master-product",
        children: [
          {
            id: "master.product.master-product",
            path: "/master/product/master-product",
            label: "Master Product",
            Component: ItemPage,
          },
          {
            id: "master.product.brand",
            path: "/master/product/brand",
            label: "Table of Brand",
            Component: BrandPage,
          },
          {
            id: "master.product.category",
            path: "/master/product/category",
            label: "Table of Product Category",
            Component: CategoryPage,
          },
          {
            id: "master.product.subcategory",
            path: "/master/product/sub-category",
            label: "Table of Sub Product Category",
            Component: SubCategoryPage,
          },
          {
            id: "master.product.price",
            path: "/master/product/price",
            label: "Table of Price",
            Component: PriceTierPage,
          },
          {
            id: "master.product.discount",
            path: "/master/product/discount",
            label: "Table of Discount",
            Component: DiscountCodePage,
          },
          {
            id: "master.product.warehouse-loc",
            path: "/master/product/warehouse-location",
            label: "Table of Warehouse Location",
            Component: WarehousePage,
          },
          {
            id: "master.product.warehouse-type",
            path: "/master/product/warehouse-type",
            label: "Table of Warehouse Type",
            Component: WarehouseTypePage,
          },
          {
            id: "master.product.uom",
            path: "/master/product/unit-of-measure",
            label: "Table of Unit of Measure",
            Component: UnitOfMeasurePage,
          },
        ],
      },
      {
        id: "master.extra-discount",
        path: "/master/extra-discount",
        label: "Extra Discount",
        description: "P2/P3 customer extra discount rules",
        divider: true,
        Component: ExtraDiscountPage,
      },
      {
        id: "master.order-codes",
        path: "/master/order-codes",
        label: "Order Codes",
        description: "Order reason codes used on Sales Order headers",
        Component: OrderCodePage,
      },
      {
        id: "master.return-codes",
        path: "/master/return-codes",
        label: "Return Codes",
        description: "Return reason codes used on Sales Return headers",
        Component: ReturnCodePage,
      },
      {
        id: "master.item-pricing",
        path: "/master/item-pricing-and-discount",
        label: "Item Pricing & Discount",
        description: "Per-item price tiers and discount codes",
        Component: ItemPricingAndDiscountPage,
      },
      {
        id: "master.bp-item",
        path: "/master/bp-item",
        label: "BP Item",
        description: "Supplier item code cross-reference",
        Component: BpItemPage,
      },
      {
        id: "master.penetration",
        path: "/master/penetration",
        label: "Penetration",
        description: "Customer SKU-coverage penetration targets",
        Component: PenetrationPage,
      },
    ],
  },

  /* â”€â”€ Purchase Transaction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  {
    id: "purchase",
    path: "/purchase",
    label: "Purchase Transaction",
    description: "Buying from suppliers",
    icon: ShoppingCart,
    moduleKey: "purchase",
    children: [
      {
        id: "purchase.order",
        path: "/purchase/purchase-order",
        label: "Purchase Order",
        description: "Order goods from a supplier",
        Component: PurchaseOrderPage,
      },
      {
        id: "purchase.receiving",
        path: "/purchase/receiving-entry",
        label: "Receiving Entry",
        description: "Record stock that just arrived",
        Component: ReceivingEntryPage,
      },
      {
        id: "purchase.return",
        path: "/purchase/purchase-return",
        label: "Purchase Return",
        description: "Send goods back to a supplier",
        Component: PurchaseReturnPage,
      },
    ],
  },

  /* â”€â”€ Sales Transaction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  {
    id: "sales",
    path: "/sales",
    label: "Sales Transaction",
    description: "Selling to customers",
    icon: TrendingUp,
    moduleKey: "sales",
    children: [
      {
        id: "sales.order",
        path: "/sales/sales-order",
        label: "Sales Order",
        description: "Take an order from a customer",
        Component: SalesOrderPage,
      },
      {
        id: "sales.confirmation",
        path: "/sales/sales-confirmation",
        label: "Sales Confirmation",
        description: "Confirm orders for picking and delivery",
        Component: SalesConfirmationPage,
      },
      {
        id: "sales.return",
        path: "/sales/sales-return",
        label: "Sales Return",
        description: "Receive returned goods from a customer",
        Component: SalesReturnPage,
      },
      {
        id: "sales.invoicing",
        path: "/sales/invoicing-process",
        label: "Invoicing Process",
        description: "Bill customers for delivered goods",
        Component: InvoicingProcessPage,
      },
      {
        id: "sales.credit-memo",
        path: "/sales/credit-memo",
        label: "Credit Memo",
        description: "Issue credit notes to reduce customer A/R",
        Component: CreditMemoPage,
      },
    ],
  },

  /* â”€â”€ A/R Transaction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  {
    id: "ar",
    path: "/ar",
    label: "A/R Transaction",
    description: "Accounts receivable â€” money customers owe you",
    icon: Wallet,
    moduleKey: "ar",
    children: [
      {
        id: "ar.payment-receipt",
        path: "/ar/payment-receipt",
        label: "Payment Receipt",
        description: "Batch customer payment against open invoices",
        Component: PaymentReceiptPage,
      },
      {
        id: "ar.bank-transfer",
        path: "/ar/bank-transfer-transaction",
        label: "Bank Transfer Transaction",
        description: "Record customer payments by bank transfer",
        Component: BankTransferTransactionPage,
      },
      {
        id: "ar.pdc-clearance",
        path: "/ar/pdc-clearance-transaction",
        label: "PDC Clearance Transaction",
        description: "Clear post-dated cheques",
        Component: PdcClearanceTransactionPage,
      },
      {
        id: "ar.pdc-cancellation",
        path: "/ar/pdc-clearance-cancellation",
        label: "PDC Clearance Cancellation",
        description: "Reverse a PDC clearance",
        Component: PdcClearanceCancellationPage,
      },
      {
        id: "ar.adjustment",
        path: "/ar/ar-adjustment",
        label: "A/R Adjustment",
        description: "Manual debit/credit adjustments to customer balance",
        Component: ArAdjustmentPage,
      },
    ],
  },

  /* â”€â”€ Inventory Transaction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  {
    id: "inventory",
    path: "/inventory",
    label: "Inventory Transaction",
    description: "Stock movements between and within warehouses",
    icon: Package,
    moduleKey: "inventory",
    children: [
      {
        id: "inv.bpb",
        path: "/inventory/incoming-transaction-bpb",
        label: "Incoming Transaction (BPB)",
        description: "Receive stock into a warehouse",
        Component: IncomingTransactionBpbPage,
      },
      {
        id: "inv.bbk",
        path: "/inventory/outgoing-transaction-bbk",
        label: "Outgoing Transaction (BBK)",
        description: "Issue stock out of a warehouse",
        Component: OutgoingTransactionBbkPage,
      },
      {
        id: "inv.inter-warehouse",
        path: "/inventory/inter-warehouse-transaction",
        label: "Inter Warehouse Transaction",
        description: "Move stock between warehouses",
        Component: InterWarehouseTransactionPage,
      },

      {
        id: "inv.stock-take-prep",
        path: "/inventory/stock-taking-preparation",
        label: "Stock Taking Preparation",
        description: "Prepare a stock count",
        divider: true,
        Component: StockTakingPreparationPage,
      },
      {
        id: "inv.stock-take-rec",
        path: "/inventory/stock-taking-record",
        label: "Stock Taking Record",
        description: "Enter stock count results",
        Component: StockTakingRecordPage,
      },
      {
        id: "inv.planning",
        path: "/inventory/inventory-planning",
        label: "Inventory Planning",
        description: "Plan reorders and replenishment",
        Component: InventoryPlanningPage,
      },
    ],
  },

  /* â”€â”€ Report â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  {
    id: "report",
    path: "/report",
    label: "Report",
    description: "All reports â€” sales, inventory, purchasing, A/R",
    icon: BarChart3,
    children: [
      {
        id: "report.sales",
        path: "/report/sales-report",
        label: "Sales Report",
        description: "Sales analysis reports",
        reportKey: "sales",
        children: [
          {
            id: "report.sales.selector",
            path: "/report/sales-report/report-selector",
            label: "Report Selector",
            Component: ReportSelectorPage,
          },
          {
            id: "report.sales.product-selling",
            path: "/report/sales-report/product-selling-report",
            label: "Product Selling Report",
            description: "Selling analysis â€” enable breakdown axes with checkboxes",
            Component: ProductSellingReportPage,
          },
          {
            id: "report.sales.sales",
            path: "/report/sales-report/sales-report",
            label: "Sales Report",
            Component: legacyReport("sales", "sales-report", "Sales Report", { customer: true, item: true, warehouse: true }),
          },
          {
            id: "report.sales.detail",
            path: "/report/sales-report/detail-transaction-report",
            label: "Laporan Detail Transaksi Penjualan",
            description: "Sales transaction detail (legacy Detail Transaction Report)",
            Component: DetailTransactionPenjualanReportPage,
          },
          {
            id: "report.sales.recapitulation",
            path: "/report/sales-report/recapitulation-sales-return",
            label: "Recapitulation Sales and Return",
            description: "Recap sales and returns by brand, customer, salesman, or customer with status",
            childLayout: "tabs",
            hideSelfTab: true,
            legacyReportTabsChrome: true,
            tabsDefaultRedirect: "/report/sales-report/recapitulation-sales-return/by-brand",
            children: [
              {
                id: "report.sales.recapitulation.brand",
                path: "/report/sales-report/recapitulation-sales-return/by-brand",
                label: "By Brand",
                Component: RecapitulationSalesReturnByBrandPage,
              },
              {
                id: "report.sales.recapitulation.customer",
                path: "/report/sales-report/recapitulation-sales-return/by-customer",
                label: "By Customer",
                Component: RecapitulationSalesReturnByCustomerPage,
              },
              {
                id: "report.sales.recapitulation.salesman",
                path: "/report/sales-report/recapitulation-sales-return/by-salesman",
                label: "By Salesman",
                Component: RecapitulationSalesReturnBySalesmanPage,
              },
              {
                id: "report.sales.recapitulation.customer-status",
                path: "/report/sales-report/recapitulation-sales-return/by-customer-with-status",
                label: "By Customer With Status",
                Component: RecapitulationSalesReturnByCustomerWithStatusPage,
              },
            ],
          },
          {
            id: "report.sales.return",
            path: "/report/sales-report/sales-return-report",
            label: "Sales Return Report",
            Component: legacyReport("sales", "sales-return-report", "Sales Return Report", { customer: true }),
          },
          {
            id: "report.sales.bonus",
            path: "/report/sales-report/sales-bonus-report",
            label: "Sales Bonus Report",
            Component: legacyReport("sales", "sales-bonus", "Sales Bonus Report", { customer: true }),
          },
          {
            id: "report.sales.purchase-return",
            path: "/report/sales-report/sales-purchase-return-report",
            label: "Sales Purchase Return Report",
            Component: legacyReport("sales", "sales-purchase-return", "Sales Purchase Return Report"),
          },
          {
            id: "report.sales.time-series",
            path: "/report/sales-report/sales-report-time-series",
            label: "Sales Report (Time Series)",
            Component: legacyReport("sales", "sales-time-series", "Sales Report (Time Series)", { customer: true }),
          },
          {
            id: "report.sales.daily",
            path: "/report/sales-report/daily-sales-report",
            label: "Daily Sales Report",
            Component: legacyReport("sales", "daily-sales", "Daily Sales Report"),
          },
          {
            id: "report.sales.gross-margin",
            path: "/report/sales-report/gross-margin-report",
            label: "Gross Margin Report",
            Component: legacyReport("sales", "gross-margin", "Gross Margin Report", { item: true }),
          },
          {
            id: "report.sales.makarizo",
            path: "/report/sales-report/makarizo-report",
            label: "Makarizo Report",
            Component: legacyReport("sales", "makarizo", "Makarizo Report", { customer: true }),
          },
          {
            id: "report.sales.cust-by-ca",
            path: "/report/sales-report/customer-by-ca",
            label: "Customer By CA",
            Component: legacyReport("sales", "customer-by-ca", "Customer By CA", { customer: true }),
          },
          {
            id: "report.sales.cust-num-outlet",
            path: "/report/sales-report/cust-report-number-of-outlet",
            label: "Cust Report Number Of Outlet (X)",
            Component: legacyReport("sales", "cust-number-of-outlet", "Cust Report Number Of Outlet"),
          },
          {
            id: "report.sales.by-sales-market",
            path: "/report/sales-report/sales-report-by-sales-market",
            label: "Sales Report By Sales Market (X)",
            Component: legacyReport("sales", "sales-by-market", "Sales Report By Sales Market"),
          },
          {
            id: "report.sales.order-plan",
            path: "/report/sales-report/order-plan-report",
            label: "Order Plan Report",
            Component: legacyReport("sales", "order-plan", "Order Plan Report", { customer: true, warehouse: true }),
          },
          {
            id: "report.sales.service-level",
            path: "/report/sales-report/service-level",
            label: "Service Level",
            Component: legacyReport("sales", "service-level", "Service Level", { customer: true }),
          },
          {
            id: "report.sales.order-vs-invoice",
            path: "/report/sales-report/check-order-vs-invoice",
            label: "Check order Vs Invoice",
            Component: legacyReport("sales", "check-order-vs-invoice", "Check Order Vs Invoice", { customer: true }),
          },
          {
            id: "report.sales.discount-per-cust",
            path: "/report/sales-report/laporan-discount-per-customer",
            label: "Laporan Discount Per Costumer",
            Component: legacyReport("sales", "discount-per-customer", "Laporan Discount Per Customer", { customer: true }),
          },
        ],
      },
      {
        id: "report.inventory",
        path: "/report/inventory-report",
        label: "Inventory Report",
        description: "Stock and movement reports",
        reportKey: "inventory",
        children: [
          {
            id: "report.inv.process",
            path: "/report/inventory-report/process",
            label: "Process",
            Component: legacyReport("inventory", "inventory-process", "Process"),
          },
          {
            id: "report.inv.stock-position",
            path: "/report/inventory-report/stock-position-report",
            label: "Stock Position Report",
            Component: StockPositionReportPage,
          },
          {
            id: "report.inv.stock-mutation",
            path: "/report/inventory-report/stock-mutation-report",
            label: "Stock Mutation Report",
            Component: legacyReport("inventory", "stock-mutation", "Stock Mutation Report", { item: true, warehouse: true }),
          },
          {
            id: "report.inv.product",
            path: "/report/inventory-report/product-report-price-list",
            label: "Product Report ( Price List )",
            Component: legacyReport("inventory", "product-price-list", "Product Report (Price List)", { item: true }),
          },
          {
            id: "report.inv.sku-stock",
            path: "/report/inventory-report/sku-stock-report",
            label: "SKU Stock Report",
            Component: legacyReport("inventory", "sku-stock", "SKU Stock Report", { item: true, warehouse: true }),
          },
          {
            id: "report.inv.stock-opname",
            path: "/report/inventory-report/stock-opname-report",
            label: "Stock Opname Report",
            Component: legacyReport("inventory", "stock-opname", "Stock Opname Report", { warehouse: true }),
          },
          {
            id: "report.inv.bpb",
            path: "/report/inventory-report/bpb-report",
            label: "BPB Report",
            Component: legacyReport("inventory", "bpb-report", "BPB Report", { warehouse: true }),
          },
          {
            id: "report.inv.bbk",
            path: "/report/inventory-report/bbk-report",
            label: "BBK Report",
            Component: legacyReport("inventory", "bbk-report", "BBK Report", { warehouse: true }),
          },
          {
            id: "report.inv.transfer",
            path: "/report/inventory-report/transfer-report",
            label: "Transfer Report",
            Component: legacyReport("inventory", "transfer-report", "Transfer Report", { warehouse: true }),
          },
        ],
      },
      {
        id: "report.purchase",
        path: "/report/purchase-reports",
        label: "Purchase Reports",
        description: "Purchasing analysis reports",
        reportKey: "purchase",
        children: [
          {
            id: "report.pur.purchase",
            path: "/report/purchase-reports/purchase-report",
            label: "Purchase Report",
            Component: legacyReport("purchase", "purchase-report", "Purchase Report", { supplier: true, warehouse: true }),
          },
          {
            id: "report.pur.bonus",
            path: "/report/purchase-reports/purchase-bonus-report",
            label: "Purchase Bonus Report",
            Component: legacyReport("purchase", "purchase-bonus", "Purchase Bonus Report", { supplier: true }),
          },
          {
            id: "report.pur.daily",
            path: "/report/purchase-reports/daily-purchase-report",
            label: "Daily Purchase Report",
            Component: legacyReport("purchase", "daily-purchase", "Daily Purchase Report"),
          },
          {
            id: "report.pur.service-level",
            path: "/report/purchase-reports/purchase-service-level",
            label: "Purchase Service level",
            Component: legacyReport("purchase", "purchase-service-level", "Purchase Service Level", { supplier: true }),
          },
        ],
      },
      {
        id: "report.ar",
        path: "/report/account-receivable-reports",
        label: "Account Receivable Reports",
        description: "Receivables and collections reports",
        reportKey: "ar",
        children: [
          {
            id: "report.ar.collection",
            path: "/report/account-receivable-reports/collection-report",
            label: "Collection Report",
            Component: legacyReport("ar", "collection", "Collection Report", { customer: true }),
          },
          {
            id: "report.ar.outstanding",
            path: "/report/account-receivable-reports/outstanding-invoice-report",
            label: "Outstanding Invoice Report",
            Component: legacyReport("ar", "outstanding-invoice", "Outstanding Invoice Report", { customer: true }),
          },
          {
            id: "report.ar.receipt",
            path: "/report/account-receivable-reports/receipt-report",
            label: "Receipt Report",
            Component: legacyReport("ar", "receipt-report", "Receipt Report", { customer: true }),
          },
          {
            id: "report.ar.doar",
            path: "/report/account-receivable-reports/doar-report",
            label: "DOAR Report",
            Component: legacyReport("ar", "doar", "DOAR Report", { customer: true }),
          },
          {
            id: "report.ar.pdc",
            path: "/report/account-receivable-reports/outstanding-pdc-report",
            label: "Outstanding PDC Report",
            Component: legacyReport("ar", "outstanding-pdc", "Outstanding PDC Report", { customer: true }),
          },
        ],
      },
    ],
  },

  /* â”€â”€ Settings (kept off the main sidebar â€” opened from the user menu) â”€â”€ */
  {
    id: "settings",
    path: "/settings",
    label: "Settings",
    description: "Personal preferences (text size, theme)",
    Component: SettingsPanel,
  },
];

/* â”€â”€ Permission gating helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Sidebar, hub tiles, tabs, and the router all share the same visibility logic
 * so a user can never see, deep-link, or be redirected into a screen they
 * are not authorized to view. */

import type { CurrentUser, ResolvedPermissions } from "#/lib/auth";

/** Resolve the effective module/report key for a node, walking up its ancestor chain. */
function ancestralKeys(target: ModuleNode): { moduleKey?: ModuleKey; reportKey?: ReportKey } {
  let foundModule: ModuleKey | undefined = target.moduleKey;
  let foundReport: ReportKey | undefined = target.reportKey;
  if (foundModule && foundReport) return { moduleKey: foundModule, reportKey: foundReport };
  const visit = (nodes: ModuleNode[], chain: ModuleNode[]): boolean => {
    for (const n of nodes) {
      const next = [...chain, n];
      if (n === target) {
        for (const a of next) {
          foundModule ??= a.moduleKey;
          foundReport ??= a.reportKey;
        }
        return true;
      }
      if (n.children && visit(n.children, next)) return true;
    }
    return false;
  };
  visit(TREE, []);
  return { moduleKey: foundModule, reportKey: foundReport };
}

const KEYS_CACHE = new WeakMap<ModuleNode, { moduleKey?: ModuleKey; reportKey?: ReportKey }>();
function keysFor(node: ModuleNode): { moduleKey?: ModuleKey; reportKey?: ReportKey } {
  let v = KEYS_CACHE.get(node);
  if (!v) { v = ancestralKeys(node); KEYS_CACHE.set(node, v); }
  return v;
}

/** True when the navigation node can be opened by the given user. */
export function canAccessModule(
  node: ModuleNode,
  user: CurrentUser | null,
  perms: ResolvedPermissions | null,
): boolean {
  if (!user) return false;
  if (node.developerOnly && !user.isDeveloper) return false;
  if (node.superAdminOnly && !(user.isDeveloper || user.roles.includes("SuperAdmin"))) return false;
  const { moduleKey, reportKey } = keysFor(node);
  if (moduleKey && !(perms?.modules[moduleKey])) return false;
  if (reportKey && !(perms?.reports.includes(reportKey))) return false;
  return true;
}

/** Kept for route guards and older call sites: visible means accessible/openable. */
export const isModuleVisible = canAccessModule;

/** Return every child that should be shown in navigation, even when disabled/gray. */
export function navigationChildren(
  node: ModuleNode,
): ModuleNode[] {
  return node.children ?? [];
}

/** Return only the children of a node the user can open. */
export function accessibleChildren(
  node: ModuleNode,
  user: CurrentUser | null,
  perms: ResolvedPermissions | null,
): ModuleNode[] {
  return navigationChildren(node).filter((c) => canAccessModule(c, user, perms));
}
