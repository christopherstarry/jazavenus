using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class PaymentTerm : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public int NetDays { get; set; }
    public bool IsActive { get; set; } = true;
}
