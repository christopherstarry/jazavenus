using Jaza.Domain.Common;
using Jaza.Domain.Invoicing;
using Jaza.Domain.MasterData;

namespace Jaza.Domain.Ar;

public sealed class PaymentAllocation : Entity
{
    public Guid PaymentId { get; set; }
    public Payment? Payment { get; set; }

    public Guid InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public decimal Amount { get; set; }
    public string Currency { get; set; } = "IDR";
    public DateTime AllocatedAt { get; set; }
    public string? Notes { get; set; }
}

public enum PdcStatus
{
    Outstanding = 0,
    Cleared = 10,
    Bounced = 20,
    Cancelled = 90,
}

public sealed class PostDatedCheck : Entity
{
    public required string Number { get; set; }
    public string Division { get; set; } = "";

    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public Guid? BankId { get; set; }
    public Bank? Bank { get; set; }

    public decimal Amount { get; set; }
    public string Currency { get; set; } = "IDR";
    public DateTime ChequeDate { get; set; }
    public DateTime ReceivedAt { get; set; }
    public PdcStatus Status { get; set; } = PdcStatus.Outstanding;
    public string? Reference { get; set; }
    public string? Notes { get; set; }

    public List<PdcClearanceHistory> History { get; set; } = [];
}

public sealed class PdcClearanceHistory : Entity
{
    public Guid PostDatedCheckId { get; set; }
    public PostDatedCheck? PostDatedCheck { get; set; }

    public PdcStatus FromStatus { get; set; }
    public PdcStatus ToStatus { get; set; }
    public DateTime OccurredAtUtc { get; set; }
    public Guid? UserId { get; set; }
    public string? Notes { get; set; }
}

public sealed class ArAdjustment : Entity
{
    public required string Number { get; set; }
    public string Division { get; set; } = "";
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;

    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public DateTime AdjustmentDate { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "IDR";
    public string? ReasonCode { get; set; }
    public string? Notes { get; set; }
}

public sealed class ArPeriodClosing : Entity
{
    public string Division { get; set; } = "";
    public int Year { get; set; }
    public int Month { get; set; }
    public DateTime ClosedAtUtc { get; set; }
    public Guid ClosedByUserId { get; set; }
    public string? Notes { get; set; }
}
