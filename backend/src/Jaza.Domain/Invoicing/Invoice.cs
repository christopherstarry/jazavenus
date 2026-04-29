using Jaza.Domain.Common;
using Jaza.Domain.MasterData;
using Jaza.Domain.Outbound;

namespace Jaza.Domain.Invoicing;

public enum InvoiceStatus
{
    Draft = 0,
    Posted = 10,
    PartiallyPaid = 20,
    Paid = 30,
    Voided = 90,
}

public sealed class Invoice : Entity
{
    public required string Number { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }

    /// <summary>Optional; an invoice can stand alone (manual) or be generated from a DO.</summary>
    public Guid? DeliveryOrderId { get; set; }
    public DeliveryOrder? DeliveryOrder { get; set; }

    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public string Currency { get; set; } = "IDR";
    public string? Notes { get; set; }

    public List<InvoiceLine> Lines { get; set; } = [];
    public List<Payment> Payments { get; set; } = [];

    public decimal SubTotal => Lines.Sum(l => l.LineSubtotal);
    public decimal TaxTotal => Lines.Sum(l => l.TaxAmount);
    public decimal GrandTotal => SubTotal + TaxTotal;
    public decimal AmountPaid => Payments.Where(p => !p.IsDeleted).Sum(p => p.Amount);
    public decimal AmountDue => GrandTotal - AmountPaid;
}

public sealed class InvoiceLine : Entity
{
    public Guid InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public int LineNumber { get; set; }

    public Guid? ItemId { get; set; }
    public Item? Item { get; set; }

    public required string Description { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TaxPercent { get; set; }

    public decimal LineSubtotal => Quantity * UnitPrice * (1m - DiscountPercent / 100m);
    public decimal TaxAmount => LineSubtotal * TaxPercent / 100m;
    public decimal LineTotal => LineSubtotal + TaxAmount;
}
