using Jaza.Application.Common;
using Jaza.Application.Tax;
using Jaza.Domain.Common;
using Jaza.Domain.Tax;
using Jaza.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Jaza.Infrastructure.Tax;

public sealed class TaxSerialService(AppDbContext db, IActionAuditService audit) : ITaxSerialService
{
    public async Task<bool> CustomerRequiresTaxSerialAsync(Guid customerId, CancellationToken ct = default)
    {
        var customer = await db.Customers.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == customerId, ct);
        return customer is not null && !string.IsNullOrWhiteSpace(customer.PKPNumber);
    }

    public async Task<string?> AllocateForInvoiceAsync(Guid invoiceId, CancellationToken ct = default)
    {
        var inv = await db.Invoices.Include(i => i.Customer)
            .FirstOrDefaultAsync(i => i.Id == invoiceId, ct)
            ?? throw new KeyNotFoundException("Invoice not found.");

        if (!await CustomerRequiresTaxSerialAsync(inv.CustomerId, ct))
            return null;

        if (!string.IsNullOrWhiteSpace(inv.TaxSerial))
            return inv.TaxSerial;

        var serial = await db.TaxInvoiceSerials
            .Where(s => s.Division == inv.Division && s.Status == TaxSerialStatus.Available)
            .OrderBy(s => s.SerialNumber)
            .FirstOrDefaultAsync(ct)
            ?? throw new DomainException("No tax invoice serial available in pool.");

        serial.Status = TaxSerialStatus.Used;
        serial.UsedAtUtc = DateTime.UtcNow;
        serial.InvoiceId = invoiceId;
        inv.TaxSerial = serial.SerialNumber;

        await db.SaveChangesAsync(ct);
        await audit.LogAsync("TaxSerial.Allocated", nameof(Domain.Invoicing.Invoice), invoiceId,
            entityCode: inv.Number, module: Modules.Sales, afterJson: serial.SerialNumber, cancellationToken: ct);
        return serial.SerialNumber;
    }
}
