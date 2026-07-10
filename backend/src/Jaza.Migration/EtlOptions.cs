namespace Jaza.Migration;

public sealed class EtlOptions
{
    public string LegacyConnectionString { get; set; } = "";
    public string TargetConnectionString { get; set; } = "";
    /// <summary>Canonical division when loading a single legacy DB (e.g. DISTRIBUTIONBDG).</summary>
    public string Division { get; set; } = "";
    public bool DryRun { get; set; } = true;
    public string[] Only { get; set; } =
    [
        "Units", "Categories", "Brands", "Suppliers", "Customers", "Warehouses", "Items",
        "PurchaseOrders", "SalesOrders", "Invoices", "Payments",
    ];
    public DateTime? Since { get; set; }
    public string ErrorsDirectory { get; set; } = "etl-errors";
}
