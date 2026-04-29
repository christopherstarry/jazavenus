using FluentValidation;
using Jaza.Domain.Common;

namespace Jaza.Application.Inbound;

public sealed record PurchaseOrderLineDto(
    Guid? Id, int LineNumber, Guid ItemId, string? ItemSku, string? ItemName,
    decimal Quantity, decimal UnitPrice, decimal DiscountPercent, decimal TaxPercent,
    decimal QuantityReceived, decimal QuantityOpen);

public sealed record PurchaseOrderDto(
    Guid Id, string Number, DocumentStatus Status,
    Guid SupplierId, string? SupplierName, Guid WarehouseId, string? WarehouseCode,
    DateTime OrderDate, DateTime? ExpectedDate, string Currency, string? Notes,
    decimal SubTotal, decimal TaxTotal, decimal GrandTotal,
    IReadOnlyList<PurchaseOrderLineDto> Lines);

public sealed record PurchaseOrderUpsertLineDto(int LineNumber, Guid ItemId,
    decimal Quantity, decimal UnitPrice, decimal DiscountPercent = 0, decimal TaxPercent = 0);

public sealed record PurchaseOrderUpsertDto(
    Guid SupplierId, Guid WarehouseId, DateTime OrderDate, DateTime? ExpectedDate,
    string Currency, string? Notes, IReadOnlyList<PurchaseOrderUpsertLineDto> Lines);

public sealed class PurchaseOrderUpsertValidator : AbstractValidator<PurchaseOrderUpsertDto>
{
    public PurchaseOrderUpsertValidator()
    {
        RuleFor(x => x.SupplierId).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.OrderDate).NotEmpty();
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.ItemId).NotEmpty();
            line.RuleFor(l => l.Quantity).GreaterThan(0);
            line.RuleFor(l => l.UnitPrice).GreaterThanOrEqualTo(0);
            line.RuleFor(l => l.DiscountPercent).InclusiveBetween(0, 100);
            line.RuleFor(l => l.TaxPercent).InclusiveBetween(0, 100);
        });
    }
}

public sealed record GoodsReceiptLineDto(Guid? Id, int LineNumber,
    Guid? PurchaseOrderLineId, Guid ItemId, string? ItemSku, string? ItemName,
    Guid? LocationId, decimal Quantity, decimal UnitCost,
    string? BatchOrSerial, DateTime? ExpiryDate);

public sealed record GoodsReceiptDto(
    Guid Id, string Number, DocumentStatus Status,
    Guid? PurchaseOrderId, string? PurchaseOrderNumber,
    Guid SupplierId, string? SupplierName,
    Guid WarehouseId, string? WarehouseCode,
    DateTime ReceivedAt, string? SupplierDeliveryNote, string? Notes,
    IReadOnlyList<GoodsReceiptLineDto> Lines);

public sealed record GoodsReceiptUpsertLineDto(int LineNumber, Guid? PurchaseOrderLineId,
    Guid ItemId, Guid? LocationId, decimal Quantity, decimal UnitCost,
    string? BatchOrSerial, DateTime? ExpiryDate);

public sealed record GoodsReceiptUpsertDto(Guid? PurchaseOrderId, Guid SupplierId, Guid WarehouseId,
    DateTime ReceivedAt, string? SupplierDeliveryNote, string? Notes,
    IReadOnlyList<GoodsReceiptUpsertLineDto> Lines);

public sealed class GoodsReceiptUpsertValidator : AbstractValidator<GoodsReceiptUpsertDto>
{
    public GoodsReceiptUpsertValidator()
    {
        RuleFor(x => x.SupplierId).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.ItemId).NotEmpty();
            l.RuleFor(x => x.Quantity).GreaterThan(0);
            l.RuleFor(x => x.UnitCost).GreaterThanOrEqualTo(0);
        });
    }
}
