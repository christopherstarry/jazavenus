using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

/// <summary>A bin / shelf within a warehouse.</summary>
public sealed class Location : Entity
{
    public Guid WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    public required string Code { get; set; }
    public string? Name { get; set; }
    public bool IsActive { get; set; } = true;
}
