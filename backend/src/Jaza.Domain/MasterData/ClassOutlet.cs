using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class ClassOutlet : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public bool IsActive { get; set; } = true;
}
