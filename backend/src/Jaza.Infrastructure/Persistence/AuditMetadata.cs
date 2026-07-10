using System.Reflection;
using Jaza.Domain.Inbound;
using Jaza.Domain.Invoicing;
using Jaza.Domain.MasterData;
using Jaza.Domain.Outbound;
using Jaza.Domain.Stock;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Jaza.Infrastructure.Persistence;

internal static class AuditMetadata
{
    private static readonly Dictionary<string, string> EntityModules = new(StringComparer.Ordinal)
    {
        [nameof(Customer)] = "master",
        [nameof(CustomerAddress)] = "master",
        [nameof(Item)] = "master",
        [nameof(ItemPrice)] = "master",
        [nameof(ItemDiscount)] = "master",
        [nameof(Supplier)] = "master",
        [nameof(Brand)] = "master",
        [nameof(ItemCategory)] = "master",
        [nameof(SubCategory)] = "master",
        [nameof(Warehouse)] = "master",
        [nameof(Location)] = "master",
        [nameof(Bank)] = "master",
        [nameof(Salesman)] = "master",
        [nameof(Collector)] = "master",
        [nameof(Area)] = "master",
        [nameof(PurchaseOrder)] = "purchase",
        [nameof(PurchaseOrderLine)] = "purchase",
        [nameof(GoodsReceiptNote)] = "purchase",
        [nameof(GoodsReceiptLine)] = "purchase",
        [nameof(SalesOrder)] = "sales",
        [nameof(SalesOrderLine)] = "sales",
        [nameof(DeliveryOrder)] = "sales",
        [nameof(DeliveryOrderLine)] = "sales",
        [nameof(Invoice)] = "sales",
        [nameof(InvoiceLine)] = "sales",
        [nameof(Payment)] = "ar",
        [nameof(StockMovement)] = "inventory",
        [nameof(StockOnHand)] = "inventory",
        ["SalesReturn"] = "sales",
        ["SalesReturnLine"] = "sales",
        ["CreditMemo"] = "sales",
        ["CreditMemoLine"] = "sales",
        ["PurchaseReturn"] = "purchase",
        ["PurchaseReturnLine"] = "purchase",
        ["PaymentAllocation"] = "ar",
        ["PostDatedCheck"] = "ar",
        ["PdcClearanceHistory"] = "ar",
        ["ArAdjustment"] = "ar",
        ["ArPeriodClosing"] = "ar",
        ["StockReceipt"] = "inventory",
        ["StockReceiptLine"] = "inventory",
        ["StockIssue"] = "inventory",
        ["StockIssueLine"] = "inventory",
        ["StockTransfer"] = "inventory",
        ["StockTransferLine"] = "inventory",
        ["StockTakeSession"] = "inventory",
        ["StockTakeLine"] = "inventory",
        ["ExtraDiscount"] = "master",
        ["ExtraDiscountLine"] = "master",
        ["CompanySettings"] = "system",
        ["FiscalPeriod"] = "system",
        ["OrderCode"] = "master",
        ["ReturnCode"] = "master",
        ["TaxInvoiceSerial"] = "ar",
    };

    public static string? ResolveModule(string entityName) =>
        EntityModules.TryGetValue(entityName, out var module) ? module : "system";

    public static string? ResolveEntityCode(object entity)
    {
        var type = entity.GetType();
        foreach (var propName in new[] { "Number", "Code", "Sku", "Email", "FullName" })
        {
            var prop = type.GetProperty(propName, BindingFlags.Public | BindingFlags.Instance);
            if (prop?.GetValue(entity) is string s && !string.IsNullOrWhiteSpace(s))
                return s;
        }
        return null;
    }

    public static string? BuildChangesJson(EntityEntry entry, bool original)
    {
        var before = new Dictionary<string, object?>();
        var after = new Dictionary<string, object?>();
        foreach (var p in entry.Properties)
        {
            if (p.Metadata.Name is "RowVersion" or "xmin") continue;
            before[p.Metadata.Name] = p.OriginalValue;
            after[p.Metadata.Name] = p.CurrentValue;
        }

        var changes = new List<AuditFieldChange>();
        foreach (var key in before.Keys)
        {
            var oldVal = before[key];
            var newVal = after[key];
            if (Equals(oldVal, newVal)) continue;
            changes.Add(new AuditFieldChange(key, oldVal?.ToString(), newVal?.ToString()));
        }

        if (changes.Count == 0) return null;
        return System.Text.Json.JsonSerializer.Serialize(changes);
    }
}

internal sealed record AuditFieldChange(string Field, string? OldValue, string? NewValue);
