using Jaza.Domain.Common;
using Jaza.Domain.Invoicing;
using Jaza.Domain.MasterData;
using Jaza.Domain.Returns;

namespace Jaza.Domain.Tax;

public enum TaxSerialStatus
{
    Available = 0,
    Allocated = 10,
    Used = 20,
    Voided = 90,
}

public sealed class TaxInvoiceSerial : Entity
{
    public string Division { get; set; } = "";
    public Guid TaxRegistrationId { get; set; }
    public TaxRegistration? TaxRegistration { get; set; }

    public required string SerialNumber { get; set; }
    public TaxSerialStatus Status { get; set; } = TaxSerialStatus.Available;

    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }
    public Guid? CreditMemoId { get; set; }
    public CreditMemo? CreditMemo { get; set; }

    public DateTime? AllocatedAtUtc { get; set; }
    public Guid? AllocatedByUserId { get; set; }
    public DateTime? UsedAtUtc { get; set; }
}
