using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class Warehouse : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Location> Locations { get; set; } = [];
}
