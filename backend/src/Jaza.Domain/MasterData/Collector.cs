using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class Collector : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public bool IsActive { get; set; } = true;
}
