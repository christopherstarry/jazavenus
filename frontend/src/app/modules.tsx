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
  Receipt,
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
  /** "SuperAdmin" → only visible to SuperAdmins. */
  superAdminOnly?: boolean;
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
import { ItemsPage } from "#/features/items/ItemsPage";
import { CustomersPage } from "#/features/customers/CustomersPage";
import { SuppliersPage } from "#/features/suppliers/SuppliersPage";
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
import { ChangePasswordPage } from "#/features/auth/ChangePasswordPage";
import { EmployeePage } from "#/features/employees/EmployeePage";
import { ClassOutletPage } from "#/features/customers/ClassOutletPage";
import { GroupOutletPage } from "#/features/customers/GroupOutletPage";
import { MarketTypePage } from "#/features/customers/MarketTypePage";
import { ChannelOutletPage } from "#/features/customers/ChannelOutletPage";
import { OutletTypePage } from "#/features/customers/OutletTypePage";
import { SalesmanPage } from "#/features/customers/SalesmanPage";
import { SalesAreaPage } from "#/features/customers/SalesAreaPage";
import { LocationOutletPage } from "#/features/customers/LocationOutletPage";
import { CollectorPage } from "#/features/customers/CollectorPage";
import { MasterCustomerPage } from "#/features/customers/MasterCustomerPage";
import { TaxNoRegistrationPage } from "#/features/tax/TaxNoRegistrationPage";
import { TermOfPaymentPage } from "#/features/master/TermOfPaymentPage";
import { TypeOfCostsPage } from "#/features/master/TypeOfCostsPage";
import { BankPage } from "#/features/master/BankPage";
import { BrandPage } from "#/features/master/BrandPage";
import {
  ProductCategoryPage,
  SubProductCategoryPage,
  ProductPricePage,
  ProductDiscountPage,
} from "#/features/master/ProductCatalogMasters";
import {
  WarehouseTypePage,
  UnitOfMeasurePage,
} from "#/features/master/ProductWarehouseMasters";
import { WarehouseLocationPage } from "#/features/master/WarehouseLocationPage";
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
        id: "system.logoff",
        path: "/system/log-off",
        label: "Log off",
        description: "Sign out of the application",
      },
      {
        id: "system.change-password",
        path: "/system/change-password",
        label: "Change Password",
        description: "Update your sign-in password",
        Component: ChangePasswordPage,
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
    children: [
      {
        id: "master.employee",
        path: "/master/employee",
        label: "Employee",
        description: "Staff members",
        Component: EmployeePage,
      },

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
        Component: TypeOfCostsPage,
      },
      {
        id: "master.principle",
        path: "/master/principle",
        label: "Principle",
        description: "Principal companies / suppliers",
        Component: SuppliersPage,
      },
      {
        id: "master.term-of-payment",
        path: "/master/term-of-payment",
        label: "Table of Term Of Payment",
        description: "Payment terms (net 30, net 60, …)",
        Component: TermOfPaymentPage,
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
        Component: TaxNoRegistrationPage,
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
            Component: ProductCategoryPage,
          },
          {
            id: "master.product.subcategory",
            path: "/master/product/sub-category",
            label: "Table of Sub Product Category",
            Component: SubProductCategoryPage,
          },
          {
            id: "master.product.price",
            path: "/master/product/price",
            label: "Table of Price",
            Component: ProductPricePage,
          },
          {
            id: "master.product.discount",
            path: "/master/product/discount",
            label: "Table of Discount",
            Component: ProductDiscountPage,
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
            Component: WarehouseLocationPage,
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
        children: [
          {
            id: "report.sales.selector",
            path: "/report/sales-report/report-selector",
            label: "Report Selector",
          },
          {
            id: "report.sales.sales",
            path: "/report/sales-report/sales-report",
            label: "Sales Report",
          },
          {
            id: "report.sales.detail",
            path: "/report/sales-report/detail-transaction-report",
            label: "Detail Transaction Report",
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
        children: [
          { id: "report.inv.process", path: "/report/inventory-report/process", label: "Process" },
          {
            id: "report.inv.stock-position",
            path: "/report/inventory-report/stock-position-report",
            label: "Stock Position Report",
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

  /* ── Tax Form ────────────────────────────────────────────────────────── */
  {
    id: "tax",
    path: "/tax",
    label: "Tax Form",
    description: "Tax invoice and VAT reporting",
    icon: Receipt,
    children: [
      {
        id: "tax.simple-invoice",
        path: "/tax/simple-tax-invoice-report",
        label: "Simple Tax Invoice Report",
        description: "Generate simple tax invoices",
      },
      {
        id: "tax.vat",
        path: "/tax/value-added-tax-report",
        label: "Value Added Tax Report",
        description: "Generate VAT report",
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
