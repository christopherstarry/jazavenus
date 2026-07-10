using Jaza.Application.Ar;
using Jaza.Application.Common;
using Jaza.Domain.Ar;
using Jaza.Domain.Common;
using Jaza.Domain.Invoicing;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Ar;

public sealed class PaymentReceiptService(
    AppDbContext db,
    IActionAuditService audit) : IPaymentReceiptService
{
    public async Task<BatchPaymentResult> CreateBatchAsync(BatchPaymentRequest request, CancellationToken ct = default)
    {
        if (request.Allocations.Count == 0)
            throw new DomainException("At least one allocation is required.");

        var total = request.Allocations.Sum(a => a.Amount);
        if (total <= 0)
            throw new DomainException("Total payment amount must be positive.");

        var payment = new Payment
        {
            Division = request.Division,
            CustomerId = request.CustomerId,
            ReceivedAt = request.ReceivedAt,
            Method = request.Method,
            Amount = total,
            Currency = request.Currency,
            Reference = request.Reference,
            Notes = request.Notes,
        };
        db.Payments.Add(payment);

        foreach (var alloc in request.Allocations)
        {
            var inv = await db.Invoices.Include(i => i.PaymentAllocations)
                .FirstOrDefaultAsync(i => i.Id == alloc.InvoiceId, ct)
                ?? throw new KeyNotFoundException($"Invoice {alloc.InvoiceId} not found.");

            if (inv.Status is not (InvoiceStatus.Posted or InvoiceStatus.PartiallyPaid))
                throw new DomainException($"Invoice {inv.Number} is not open for payment.");

            db.PaymentAllocations.Add(new PaymentAllocation
            {
                Payment = payment,
                InvoiceId = alloc.InvoiceId,
                Amount = alloc.Amount,
                Currency = request.Currency,
                AllocatedAt = request.ReceivedAt,
                Notes = alloc.Notes,
            });

            var newPaid = inv.AmountPaid + alloc.Amount;
            inv.Status = newPaid >= inv.GrandTotal ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid;
        }

        await db.SaveChangesAsync(ct);
        await audit.LogAsync("Payment.Created", nameof(Payment), payment.Id,
            module: Modules.Ar, afterJson: total.ToString(), cancellationToken: ct);

        return new BatchPaymentResult(payment.Id, total, request.Allocations.Count);
    }
}
