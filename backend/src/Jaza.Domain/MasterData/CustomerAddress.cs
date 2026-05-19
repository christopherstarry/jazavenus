using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class CustomerAddress : Entity
{
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public required string Label { get; set; }
    public required string Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
}
