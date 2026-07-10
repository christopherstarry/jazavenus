using Jaza.Domain.Invoicing;

namespace Jaza.Application.Ar;

public sealed record PaymentAllocationInput(Guid InvoiceId, decimal Amount, string? Notes);

public sealed record BatchPaymentRequest(
    string Division,
    Guid CustomerId,
    DateTime ReceivedAt,
    PaymentMethod Method,
    string Currency,
    string? Reference,
    string? Notes,
    IReadOnlyList<PaymentAllocationInput> Allocations);

public sealed record BatchPaymentResult(Guid PaymentId, decimal TotalAmount, int AllocationCount);

public interface IPaymentReceiptService
{
    Task<BatchPaymentResult> CreateBatchAsync(BatchPaymentRequest request, CancellationToken ct = default);
}
