using Jaza.Domain.Common;

namespace Jaza.Domain.MasterData;

public sealed class Supplier : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? TaxId { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public int PaymentTermsDays { get; set; } = 30;
    public bool IsActive { get; set; } = true;
}
