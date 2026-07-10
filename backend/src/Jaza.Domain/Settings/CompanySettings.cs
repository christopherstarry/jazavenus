using Jaza.Domain.Common;

namespace Jaza.Domain.Settings;

public sealed class CompanySettings : Entity
{
    public string Division { get; set; } = "";
    public string CompanyName { get; set; } = "";
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    public string? Fax { get; set; }
    public string? NpwpNumber { get; set; }
    public string? PkpNumber { get; set; }
    public string? DefaultCurrency { get; set; } = "IDR";
    public string? SettingsJson { get; set; }
}

public sealed class FiscalPeriod : Entity
{
    public string Division { get; set; } = "";
    public int Year { get; set; }
    public int Month { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsClosed { get; set; }
    public DateTime? ClosedAtUtc { get; set; }
    public Guid? ClosedByUserId { get; set; }
}

public sealed class OrderCode : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class ReturnCode : Entity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
