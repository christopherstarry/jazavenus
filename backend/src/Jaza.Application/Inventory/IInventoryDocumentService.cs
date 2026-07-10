namespace Jaza.Application.Inventory;

public interface IInventoryDocumentService
{
    Task PostStockReceiptAsync(Guid id, CancellationToken ct = default);
    Task PostStockIssueAsync(Guid id, CancellationToken ct = default);
    Task PostStockTransferAsync(Guid id, CancellationToken ct = default);
    Task PostStockTakeAsync(Guid id, CancellationToken ct = default);
}
