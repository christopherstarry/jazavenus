using Jaza.Application.Credit;
using Jaza.Application.Common;
using Jaza.Domain.Common;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Credit;

public sealed class CreditControlService(AppDbContext db) : ICreditControlService
{
    public async Task<CreditCheckResult> CheckAsync(Guid customerId, decimal additionalAmount,
        bool adminOverride = false, CancellationToken ct = default)
    {
        var customer = await db.Customers.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == customerId, ct)
            ?? throw new KeyNotFoundException("Customer not found.");

        var openInvoices = await db.Invoices.AsNoTracking()
            .Include(i => i.Lines)
            .Include(i => i.PaymentAllocations)
            .Where(i => i.CustomerId == customerId
                     && (i.Status == Domain.Invoicing.InvoiceStatus.Posted
                      || i.Status == Domain.Invoicing.InvoiceStatus.PartiallyPaid))
            .ToListAsync(ct);

        var exposure = openInvoices.Sum(i => i.GrandTotal - i.AmountPaid);

        exposure += additionalAmount;

        if (adminOverride)
            return new CreditCheckResult(true, null, exposure, customer.CreditLimit);

        if (customer.CreditLimit > 0 && exposure > customer.CreditLimit)
            return new CreditCheckResult(false, "Credit limit exceeded.", exposure, customer.CreditLimit);

        if (!adminOverride && await HasOverdueInvoicesAsync(customerId, ct))
            return new CreditCheckResult(false, "Customer has overdue invoices.", exposure, customer.CreditLimit);

        return new CreditCheckResult(true, null, exposure, customer.CreditLimit);
    }

    public async Task<bool> HasOverdueInvoicesAsync(Guid customerId, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        return await db.Invoices.AsNoTracking()
            .AnyAsync(i => i.CustomerId == customerId
                        && i.DueDate < today
                        && (i.Status == Domain.Invoicing.InvoiceStatus.Posted
                         || i.Status == Domain.Invoicing.InvoiceStatus.PartiallyPaid), ct);
    }
}
