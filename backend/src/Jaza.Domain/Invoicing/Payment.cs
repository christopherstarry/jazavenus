using Jaza.Domain.Ar;
using Jaza.Domain.Common;
using Jaza.Domain.MasterData;

namespace Jaza.Domain.Invoicing;

public enum PaymentMethod
{
    Cash = 1,
    BankTransfer = 2,
    Card = 3,
    Cheque = 4,
    Other = 99,
}

/// <summary>
/// Payment receipt header (legacy Receipt). Invoice links are via <see cref="PaymentAllocation"/>
/// for batch receipts; <see cref="InvoiceId"/> is optional for simple 1:1 API payments.
/// </summary>
public sealed class Payment : Entity
{
    public string Division { get; set; } = "";

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    /// <summary>Optional direct invoice link (simple payments). Batch receipts use allocations only.</summary>
    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public DateTime ReceivedAt { get; set; }
    public PaymentMethod Method { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "IDR";
    public string? Reference { get; set; }
    public string? Notes { get; set; }

    public List<PaymentAllocation> Allocations { get; set; } = [];
}
