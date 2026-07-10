namespace Jaza.Application.Tax;

public interface ITaxSerialService
{
    Task<string?> AllocateForInvoiceAsync(Guid invoiceId, CancellationToken ct = default);
    Task<bool> CustomerRequiresTaxSerialAsync(Guid customerId, CancellationToken ct = default);
}
