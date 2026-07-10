namespace Jaza.Infrastructure.Reports;

internal static class ReportCatalog
{
    public const string Sales = "sales";
    public const string Inventory = "inventory";
    public const string Purchase = "purchase";
    public const string Ar = "ar";

    private static readonly string[] SalesReports =
    [
        "product-selling", "sales-report", "detail-transaction", "recapitulation-sales-return",
        "recapitulation-sales-return-by-brand", "recapitulation-sales-return-by-customer",
        "recapitulation-sales-return-by-salesman", "recapitulation-sales-return-by-customer-status",
        "sales-return-report", "sales-bonus", "sales-purchase-return", "sales-time-series",
        "daily-sales", "gross-margin", "makarizo", "customer-by-ca", "cust-number-of-outlet",
        "sales-by-market", "order-plan", "service-level", "check-order-vs-invoice",
        "discount-per-customer", "register-book", "order-card", "daily-selling", "monthly-selling",
        "tax-invoice-summary", "trade-promo", "extra-discount-report", "back-order",
        "consignment-register", "invoice-register", "delivery-order-register", "sales-order-register",
        "sales-by-brand", "sales-by-salesman", "sales-by-area", "sales-by-customer",
        "customer-statement", "salesman-target", "top-customers", "top-products",
        "pending-delivery", "cancelled-orders", "sales-comparison",
    ];

    private static readonly string[] InventoryReports =
    [
        "inventory-process", "stock-position", "stock-mutation", "product-price-list", "sku-stock",
        "stock-opname", "bpb-report", "bbk-report", "transfer-report", "stock-card",
        "combined-stock", "monthly-trial", "consignment-stock", "stock-valuation", "slow-moving",
        "fast-moving", "location-stock", "warehouse-summary", "negative-stock", "reorder-suggestion",
        "goods-receipt-register", "goods-issue-register", "movement-summary", "expiry-tracking",
        "stock-aging",
    ];

    private static readonly string[] PurchaseReports =
    [
        "purchase-report", "purchase-bonus", "daily-purchase", "purchase-service-level",
        "purchase-recapitulation", "purchase-return-register",
    ];

    private static readonly string[] ArReports =
    [
        "collection", "outstanding-invoice", "receipt-report", "doar", "aging", "giro-due",
        "credit-adjustment", "ar-confirmation", "outstanding-pdc", "payment-allocation",
        "customer-balance", "invoice-aging-detail", "collector-performance", "cheque-register",
        "credit-memo-register", "ar-cross-check", "payment-register", "overdue-summary",
        "customer-ledger", "write-off-register", "pdc-clearance", "ar-period-close",
        "receipt-allocation",
    ];

    public static readonly IReadOnlyList<string> All = BuildAll();

    public static bool TryParse(string reportKey, out string domain, out string localKey)
    {
        var idx = reportKey.IndexOf(':');
        if (idx <= 0 || idx >= reportKey.Length - 1)
        {
            domain = "";
            localKey = reportKey;
            return false;
        }

        domain = reportKey[..idx];
        localKey = reportKey[(idx + 1)..];
        return true;
    }

    public static string Compose(string domain, string localKey) => $"{domain}:{localKey}";

    private static List<string> BuildAll()
    {
        var list = new List<string>(SalesReports.Length + InventoryReports.Length +
                                    PurchaseReports.Length + ArReports.Length);
        list.AddRange(SalesReports.Select(k => Compose(Sales, k)));
        list.AddRange(InventoryReports.Select(k => Compose(Inventory, k)));
        list.AddRange(PurchaseReports.Select(k => Compose(Purchase, k)));
        list.AddRange(ArReports.Select(k => Compose(Ar, k)));
        return list;
    }
}
