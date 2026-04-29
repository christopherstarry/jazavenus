using FluentValidation;
using Jaza.Domain.Common;

namespace Jaza.Application.Outbound;

public sealed record SalesOrderLineDto(Guid? Id, int LineNumber, Guid ItemId, string? ItemSku, string? ItemName,
    decimal Quantity, decimal UnitPrice, decimal DiscountPercent, decimal TaxPercent,
    decimal QuantityDelivered, decimal QuantityOpen);

public sealed record SalesOrderDto(Guid Id, string Number, DocumentStatus Status,
    Guid CustomerId, string? CustomerName, Guid WarehouseId, string? WarehouseCode,
    DateTime OrderDate, DateTime? RequestedDate, string Currency, string? Notes,
    decimal SubTotal, decimal TaxTotal, decimal GrandTotal,
    IReadOnlyList<SalesOrderLineDto> Lines);

public sealed record SalesOrderUpsertLineDto(int LineNumber, Guid ItemId,
    decimal Quantity, decimal UnitPrice, decimal DiscountPercent = 0, decimal TaxPercent = 0);

public sealed record SalesOrderUpsertDto(Guid CustomerId, Guid WarehouseId,
    DateTime OrderDate, DateTime? RequestedDate, string Currency, string? Notes,
    IReadOnlyList<SalesOrderUpsertLineDto> Lines);

public sealed class SalesOrderUpsertValidator : AbstractValidator<SalesOrderUpsertDto>
{
    public SalesOrderUpsertValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.ItemId).NotEmpty();
            l.RuleFor(x => x.Quantity).GreaterThan(0);
            l.RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
            l.RuleFor(x => x.DiscountPercent).InclusiveBetween(0, 100);
            l.RuleFor(x => x.TaxPercent).InclusiveBetween(0, 100);
        });
    }
}

public sealed record DeliveryOrderLineDto(Guid? Id, int LineNumber, Guid? SalesOrderLineId,
    Guid ItemId, string? ItemSku, string? ItemName, Guid? LocationId,
    decimal Quantity, decimal UnitCost);

public sealed record DeliveryOrderDto(Guid Id, string Number, DocumentStatus Status,
    Guid? SalesOrderId, string? SalesOrderNumber,
    Guid CustomerId, string? CustomerName, Guid WarehouseId, string? WarehouseCode,
    DateTime DeliveredAt, string? Notes,
    IReadOnlyList<DeliveryOrderLineDto> Lines);

public sealed record DeliveryOrderUpsertLineDto(int LineNumber, Guid? SalesOrderLineId,
    Guid ItemId, Guid? LocationId, decimal Quantity);

public sealed record DeliveryOrderUpsertDto(Guid? SalesOrderId, Guid CustomerId, Guid WarehouseId,
    DateTime DeliveredAt, string? Notes,
    IReadOnlyList<DeliveryOrderUpsertLineDto> Lines);

public sealed class DeliveryOrderUpsertValidator : AbstractValidator<DeliveryOrderUpsertDto>
{
    public DeliveryOrderUpsertValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.ItemId).NotEmpty();
            l.RuleFor(x => x.Quantity).GreaterThan(0);
        });
    }
}
