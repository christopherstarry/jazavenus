using Jaza.Domain.Common;

namespace Jaza.Domain.Invoicing;

public enum PaymentMethod
{
    Cash = 1,
    BankTransfer = 2,
    Card = 3,
    Cheque = 4,
    Other = 99,
}

public sealed class Payment : Entity
{
    public Guid InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public DateTime ReceivedAt { get; set; }
    public PaymentMethod Method { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "IDR";
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}
