namespace Jaza.Migration;

public sealed class EtlOptions
{
    public string LegacyConnectionString { get; set; } = "";
    public string TargetConnectionString { get; set; } = "";
    public bool DryRun { get; set; } = true;
    public string[] Only { get; set; } = ["Units", "Categories", "Suppliers", "Customers", "Warehouses", "Items"];
    public DateTime? Since { get; set; }
    public string ErrorsDirectory { get; set; } = "etl-errors";
}
