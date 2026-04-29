using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

/// <summary>Unit of measure (PCS, KG, L, BOX, ...).</summary>
public sealed class Unit : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public bool IsActive { get; set; } = true;
}
