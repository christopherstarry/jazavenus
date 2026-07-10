namespace Jaza.Api.OpenApi;

/// <summary>Swagger tag names and module descriptions for the Jaza Venus API surface.</summary>
internal static class ModuleTags
{
    public static IReadOnlyDictionary<string, string> Descriptions { get; } =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["AR"] = "Accounts receivable: payments, adjustments, PDC cheques, and period closing.",
            ["ArReports"] = "AR analytics and ledger reports (aging, statements, collections).",
            ["Audit"] = "Security audit trail for privileged actions and data changes.",
            ["Auth"] = "Authentication, sessions, MFA, and current-user preferences.",
            ["Inbound"] = "Purchase-side inbound documents: PO receipts, transfers in, and related flows.",
            ["Integrations"] = "External system hooks, webhooks, and integration health.",
            ["Inventory"] = "Inventory documents, adjustments, and stock-take cycles.",
            ["InventoryReports"] = "Stock valuation, movement, and warehouse inventory reports.",
            ["Invoicing"] = "Sales invoices, credit memos, and billing lifecycle.",
            ["IO"] = "Bulk import and export of master and transactional data.",
            ["Lookup"] = "Lightweight autocomplete and reference lookups for UI forms.",
            ["Master"] = "Core master data: items, customers, vendors, warehouses, and pricing rules.",
            ["Outbound"] = "Sales-side outbound documents: orders, deliveries, and shipments.",
            ["Pricing"] = "Price lists, discounts, and customer-specific pricing.",
            ["Processes"] = "Batch and background operational processes (posting, recalc, sync).",
            ["PurchaseReports"] = "Purchase and vendor performance reports.",
            ["Reference"] = "Shared reference tables: UoM, currencies, tax codes, and enumerations.",
            ["Reports"] = "Cross-module report catalog and shared report utilities.",
            ["Returns"] = "Sales and purchase return documents.",
            ["SalesReports"] = "Sales order, delivery, and revenue reports.",
            ["Settings"] = "Company profile, fiscal calendar, and document numbering codes.",
            ["Stock"] = "On-hand balances, reservations, and stock inquiries.",
            ["System"] = "Platform diagnostics, error logs, and system configuration.",
            ["Tax"] = "Tax serial numbers and fiscal tax document tracking.",
            ["Users"] = "User accounts, roles, and per-user module permissions.",
        };
}
