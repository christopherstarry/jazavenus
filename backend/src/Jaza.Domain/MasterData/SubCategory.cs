using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class SubCategory : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public Guid CategoryId { get; set; }
    public ItemCategory? Category { get; set; }
    public bool IsActive { get; set; } = true;
}
