namespace Jaza.Application.Returns;

public interface IReturnsService
{
    Task PostSalesReturnAsync(Guid id, CancellationToken ct = default);
    Task PostPurchaseReturnAsync(Guid id, CancellationToken ct = default);
    Task PostCreditMemoAsync(Guid id, CancellationToken ct = default);
}
