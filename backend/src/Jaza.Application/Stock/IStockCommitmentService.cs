namespace Jaza.Application.Stock;

public interface IStockCommitmentService
{
    Task CommitAsync(Guid salesOrderId, CancellationToken ct = default);
    Task ReleaseAsync(Guid salesOrderId, CancellationToken ct = default);
    Task<decimal> GetAvailableQuantityAsync(Guid itemId, Guid warehouseId, Guid? locationId = null,
        CancellationToken ct = default);
}
