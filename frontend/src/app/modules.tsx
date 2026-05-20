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

/* ─────────────────────────────────────────────────────────────────────────────
 * The Module Tree
 *
 * Single source of truth that drives:
 *   • the sidebar
 *   • the router (every leaf becomes a route)
 *   • breadcrumbs
 *   • hub-page tile grids
 *   • the "recent screens" tracker
 *
 * Labels match the legacy VB application exactly so existing users don't
 * have to relearn anything. New screens go here first; the rest of the
 * app picks them up automatically.
 * ───────────────────────────────────────────────────────────────────────── */

export type ChildLayout =
  /** Children appear in the sidebar AND on the parent's hub page as tiles. (default for sections) */
  | "sidebar"
  /** Children are tabs at the top of the parent page. They do NOT clutter the sidebar. */
  | "tabs";

/** Canonical module ids known to the auth API (PRD §6.1). */
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
  /** "SuperAdmin" → only visible to SuperAdmins (legacy gate, kept for system tools). */
  superAdminOnly?: boolean;
  /** "Developer" → only visible to Developer (error logs / dev-only diagnostics). */
  developerOnly?: boolean;
  /**
   * The canonical permission module that gates this navigation item. When set, the sidebar
   * and routing only show the node when the resolved permissions include the module
   * (PRD §6.1). Inherited by descendants.
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

/* ── Helper: walk the tree ────────────────────────────────────────────────── */

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

/* ── Lazy imports for the few real pages we already have ───────────────────
 * Each leaf can either point to its real component or fall back to the
 * generic placeholder. We keep these refs at the bottom of the file so that
 * the navigation tree above stays purely declarative.
 * ───────────────────────────────────────────────────────────────────────── */

import { DashboardPage } from "#/features/dashboard/DashboardPage";
import { CustomersPage } from "#/features/customers/CustomersPage";
import {
  PurchaseOrderPage,
  ReceivingEntryPage,
  PurchaseReturnPage,
} from "#/features/purchase/PurchaseTransactionFormPage";
import {
  InvoicingProcessPage,
  SalesConfirmationPage,
  SalesOrderPage,
  SalesReturnPage,
} from "#/features/sales/SalesTransactionFormPage";
import { BankTransferTransactionPage } from "#/features/ar/BankTransferTransactionPage";
import { PdcClearanceCancellationPage } from "#/features/ar/PdcClearanceCancellationPage";
import { SettingsPanel } from "#/features/settings/SettingsPanel";
import { ManageUsersPage } from "#/features/users/ManageUsersPage";
import { AuditHistoryPage } from "#/features/audit/AuditHistoryPage";
import { ErrorLogsPage } from "#/features/errors/ErrorLogsPage";
import { MasterCustomerPage } from "#/features/customers/MasterCustomerPage";
import { TaxRegistrationPage } from "#/features/common/pages/TaxRegistrationPage";
import { SupplierPage } from "#/features/common/pages/SupplierPage";
import { ItemsPage } from "#/features/items/ItemsPage";
import { BrandPage } from "#/features/common/pages/BrandPage";
import { BankPage } from "#/features/common/pages/BankPage";
import { SalesmanPage } from "#/features/common/pages/SalesmanPage";
import { CollectorPage } from "#/features/common/pages/CollectorPage";
import { SalesAreaPage } from "#/features/common/pages/SalesAreaPage";
import { OutletTypePage } from "#/features/common/pages/OutletTypePage";
import { GroupOutletPage } from "#/features/common/pages/GroupOutletPage";
import { MarketTypePage } from "#/features/common/pages/MarketTypePage";
import { ChannelOutletPage } from "#/features/common/pages/ChannelOutletPage";
import { LocationOutletPage } from "#/features/common/pages/LocationOutletPage";
import { CategoryPage } from "#/features/common/pages/CategoryPage";
import { SubCategoryPage } from "#/features/common/pages/SubCategoryPage";
import { PriceTierPage } from "#/features/common/pages/PriceTierPage";
import { DiscountCodePage } from "#/features/common/pages/DiscountCodePage";
import { WarehouseTypePage } from "#/features/common/pages/WarehouseTypePage";
import { UnitOfMeasurePage } from "#/features/common/pages/UnitOfMeasurePage";
import { WarehousePage } from "#/features/common/pages/WarehousePage";
import { PaymentTermPage } from "#/features/common/pages/PaymentTermPage";
import { CostTypePage } from "#/features/common/pages/CostTypePage";
import {
  IncomingTransactionBpbPage,
  InterWarehouseTransactionPage,
  OutgoingTransactionBbkPage,
} from "#/features/inventory/InventoryTransactionFormPage";
import {
  InventoryPlanningPage,
  StockTakingPreparationPage,
  StockTakingRecordPage,
} from "#/features/inventory/StockTakingAndPlanningPages";
import { ReportSelectorPage } from "#/features/reports/ReportSelectorPage";
import { ProductSellingReportPage } from "#/features/reports/ProductSellingReportPage";
import { DetailTransactionPenjualanReportPage } from "#/features/reports/DetailTransactionPenjualanReportPage";
import {
  RecapitulationSalesReturnByBrandPage,
  RecapitulationSalesReturnByCustomerPage,
  RecapitulationSalesReturnByCustomerWithStatusPage,
  RecapitulationSalesReturnBySalesmanPage,
} from "#/features/reports/RecapitulationSalesReturnVariants";
import { StockPositionReportPage } from "#/features/reports/StockPositionReportPage";

/* ── The actual tree ─────────────────────────────────────────────────────── */

export const TREE: ModuleNode[] = [
  {
    id: "dashboard",
    path: "/",
    label: "Dashboard",
    description: "Daily summary at a glance",
    icon: Home,
    Component: DashboardPage,
  },

  /* ── System ──────────────────────────────────────────────────────────── */
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
      },
      {
        id: "system.recalc-ar",
        path: "/system/recalculate-ar-balance",
        label: "Recalculate AR Balance",
        description: "Rebuild outstanding A/R totals from the ledger",
        superAdminOnly: true,
      },
      {
        id: "system.delete-cancelled",
        path: "/system/delete-cancelled-document",
        label: "Delete Cancelled Document",
        description: "Permanently remove cancelled documents",
        superAdminOnly: true,
      },

      {
        id: "system.preferences",
        path: "/system/preferences",
        label: "Preferences",
        description: "Application-wide settings",
        divider: true,
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

  /* ── Master Maintenance ──────────────────────────────────────────────── */
  {
    id: "master",
    path: "/master",
    label: "Master Maintenance",
    description: "All master records — people, products, finance setup",
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
        Component: CustomersPage, // default tab content for /master/customer
        children: [
          {
            id: "master.customer.class-outlet",
            path: "/master/customer/class-outlet",
            label: "Table of Class Outlet",
            Component: LocationOutletPage,
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
          {
            id: "master.customer.master-customer",
            path: "/master/customer/master-customer",
            label: "Master Customer (X)",
            Component: MasterCustomerPage,
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
        description: "Payment terms (net 30, net 60, …)",
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
            id: "master.product.master-product",
            path: "/master/product/master-product",
            label: "Master Product",
            Component: ItemsPage,
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
    ],
  },

  /* ── Purchase Transaction ────────────────────────────────────────────── */
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

  /* ── Sales Transaction ───────────────────────────────────────────────── */
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
    ],
  },

  /* ── A/R Transaction ─────────────────────────────────────────────────── */
  {
    id: "ar",
    path: "/ar",
    label: "A/R Transaction",
    description: "Accounts receivable — money customers owe you",
    icon: Wallet,
    moduleKey: "ar",
    children: [
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
      },
      {
        id: "ar.pdc-cancellation",
        path: "/ar/pdc-clearance-cancellation",
        label: "PDC Clearance Cancellation",
        description: "Reverse a PDC clearance",
        Component: PdcClearanceCancellationPage,
      },
    ],
  },

  /* ── Inventory Transaction ───────────────────────────────────────────── */
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

  /* ── Report ──────────────────────────────────────────────────────────── */
  {
    id: "report",
    path: "/report",
    label: "Report",
    description: "All reports — sales, inventory, purchasing, A/R",
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
            description: "Selling analysis — enable breakdown axes with checkboxes",
            Component: ProductSellingReportPage,
          },
          {
            id: "report.sales.sales",
            path: "/report/sales-report/sales-report",
            label: "Sales Report",
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
          },
          {
            id: "report.sales.bonus",
            path: "/report/sales-report/sales-bonus-report",
            label: "Sales Bonus Report",
          },
          {
            id: "report.sales.purchase-return",
            path: "/report/sales-report/sales-purchase-return-report",
            label: "Sales Purchase Return Report",
          },
          {
            id: "report.sales.time-series",
            path: "/report/sales-report/sales-report-time-series",
            label: "Sales Report (Time Series)",
          },
          {
            id: "report.sales.daily",
            path: "/report/sales-report/daily-sales-report",
            label: "Daily Sales Report",
          },
          {
            id: "report.sales.gross-margin",
            path: "/report/sales-report/gross-margin-report",
            label: "Gross Margin Report",
          },
          {
            id: "report.sales.makarizo",
            path: "/report/sales-report/makarizo-report",
            label: "Makarizo Report",
          },
          {
            id: "report.sales.cust-by-ca",
            path: "/report/sales-report/customer-by-ca",
            label: "Customer By CA",
          },
          {
            id: "report.sales.cust-num-outlet",
            path: "/report/sales-report/cust-report-number-of-outlet",
            label: "Cust Report Number Of Outlet (X)",
          },
          {
            id: "report.sales.by-sales-market",
            path: "/report/sales-report/sales-report-by-sales-market",
            label: "Sales Report By Sales Market (X)",
          },
          {
            id: "report.sales.order-plan",
            path: "/report/sales-report/order-plan-report",
            label: "Order Plan Report",
          },
          {
            id: "report.sales.service-level",
            path: "/report/sales-report/service-level",
            label: "Service Level",
          },
          {
            id: "report.sales.order-vs-invoice",
            path: "/report/sales-report/check-order-vs-invoice",
            label: "Check order Vs Invoice",
          },
          {
            id: "report.sales.discount-per-cust",
            path: "/report/sales-report/laporan-discount-per-customer",
            label: "Laporan Discount Per Costumer",
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
          { id: "report.inv.process", path: "/report/inventory-report/process", label: "Process" },
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
          },
          {
            id: "report.inv.product",
            path: "/report/inventory-report/product-report-price-list",
            label: "Product Report ( Price List )",
          },
          {
            id: "report.inv.sku-stock",
            path: "/report/inventory-report/sku-stock-report",
            label: "SKU Stock Report",
          },
          {
            id: "report.inv.stock-opname",
            path: "/report/inventory-report/stock-opname-report",
            label: "Stock Opname Report",
          },
          {
            id: "report.inv.bpb",
            path: "/report/inventory-report/bpb-report",
            label: "BPB Report",
          },
          {
            id: "report.inv.bbk",
            path: "/report/inventory-report/bbk-report",
            label: "BBK Report",
          },
          {
            id: "report.inv.transfer",
            path: "/report/inventory-report/transfer-report",
            label: "Transfer Report",
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
          },
          {
            id: "report.pur.bonus",
            path: "/report/purchase-reports/purchase-bonus-report",
            label: "Purchase Bonus Report",
          },
          {
            id: "report.pur.daily",
            path: "/report/purchase-reports/daily-purchase-report",
            label: "Daily Purchase Report",
          },
          {
            id: "report.pur.service-level",
            path: "/report/purchase-reports/purchase-service-level",
            label: "Purchase Service level",
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
          },
          {
            id: "report.ar.outstanding",
            path: "/report/account-receivable-reports/outstanding-invoice-report",
            label: "Outstanding Invoice Report",
          },
          {
            id: "report.ar.receipt",
            path: "/report/account-receivable-reports/receipt-report",
            label: "Receipt Report",
          },
          {
            id: "report.ar.doar",
            path: "/report/account-receivable-reports/doar-report",
            label: "DOAR Report",
          },
          {
            id: "report.ar.pdc",
            path: "/report/account-receivable-reports/outstanding-pdc-report",
            label: "Outstanding PDC Report",
          },
        ],
      },
    ],
  },

  /* ── Settings (kept off the main sidebar — opened from the user menu) ── */
  {
    id: "settings",
    path: "/settings",
    label: "Settings",
    description: "Personal preferences (text size, theme)",
    Component: SettingsPanel,
  },
];

/* ── Permission gating helpers ────────────────────────────────────────────────
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
