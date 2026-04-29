using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class ItemCategory : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public Guid? ParentId { get; set; }
    public ItemCategory? Parent { get; set; }
    public bool IsActive { get; set; } = true;
}
