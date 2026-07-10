using FluentValidation;
using Jaza.Domain.Common;

namespace Jaza.Application.Returns;

public sealed record SalesReturnLineDto(
    Guid? Id, int LineNumber, string? BaseDocumentType, Guid? BaseDocumentId, int? BaseLineNumber,
    decimal? BaseQuantity, Guid ItemId, string? ItemSku, string? ItemName,
    Guid? LocationId, decimal Quantity, decimal UnitPrice,
    decimal DiscountPercent, decimal Discount2Percent, decimal Discount3Percent, decimal TaxPercent);

public sealed record SalesReturnDto(
    Guid Id, string Number, string Division, DocumentStatus Status,
    Guid CustomerId, string? CustomerName, Guid WarehouseId, string? WarehouseCode,
    Guid? DeliveryOrderId, string? DeliveryOrderNumber, Guid? InvoiceId, string? InvoiceNumber,
    string? ReturnCode, DateTime ReturnDate, string? Notes,
    IReadOnlyList<SalesReturnLineDto> Lines);

public sealed record SalesReturnUpsertLineDto(
    int LineNumber, string? BaseDocumentType, Guid? BaseDocumentId, int? BaseLineNumber,
    decimal? BaseQuantity, Guid ItemId, Guid? LocationId, decimal Quantity, decimal UnitPrice,
    decimal DiscountPercent = 0, decimal Discount2Percent = 0, decimal Discount3Percent = 0, decimal TaxPercent = 0);

public sealed record SalesReturnUpsertDto(
    Guid CustomerId, Guid WarehouseId, Guid? DeliveryOrderId, Guid? InvoiceId,
    string? ReturnCode, DateTime ReturnDate, string? Notes,
    IReadOnlyList<SalesReturnUpsertLineDto> Lines);

public sealed class SalesReturnUpsertValidator : AbstractValidator<SalesReturnUpsertDto>
{
    public SalesReturnUpsertValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.ReturnDate).NotEmpty();
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.ItemId).NotEmpty();
            l.RuleFor(x => x.Quantity).GreaterThan(0);
            l.RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
        });
    }
}

public sealed record PurchaseReturnLineDto(
    Guid? Id, int LineNumber, string? BaseDocumentType, Guid? BaseDocumentId, int? BaseLineNumber,
    decimal? BaseQuantity, Guid ItemId, string? ItemSku, string? ItemName,
    Guid? LocationId, decimal Quantity, decimal UnitCost, decimal DiscountPercent);

public sealed record PurchaseReturnDto(
    Guid Id, string Number, string Division, DocumentStatus Status,
    Guid SupplierId, string? SupplierName, Guid WarehouseId, string? WarehouseCode,
    Guid? GoodsReceiptNoteId, string? GoodsReceiptNoteNumber,
    string? ReturnCode, DateTime ReturnDate, string? Notes,
    IReadOnlyList<PurchaseReturnLineDto> Lines);

public sealed record PurchaseReturnUpsertLineDto(
    int LineNumber, string? BaseDocumentType, Guid? BaseDocumentId, int? BaseLineNumber,
    decimal? BaseQuantity, Guid ItemId, Guid? LocationId, decimal Quantity, decimal UnitCost,
    decimal DiscountPercent = 0);

public sealed record PurchaseReturnUpsertDto(
    Guid SupplierId, Guid WarehouseId, Guid? GoodsReceiptNoteId,
    string? ReturnCode, DateTime ReturnDate, string? Notes,
    IReadOnlyList<PurchaseReturnUpsertLineDto> Lines);

public sealed class PurchaseReturnUpsertValidator : AbstractValidator<PurchaseReturnUpsertDto>
{
    public PurchaseReturnUpsertValidator()
    {
        RuleFor(x => x.SupplierId).NotEmpty();
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.ReturnDate).NotEmpty();
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.ItemId).NotEmpty();
            l.RuleFor(x => x.Quantity).GreaterThan(0);
            l.RuleFor(x => x.UnitCost).GreaterThanOrEqualTo(0);
        });
    }
}

public sealed record CreditMemoLineDto(
    Guid? Id, int LineNumber, string? BaseDocumentType, Guid? BaseDocumentId, int? BaseLineNumber,
    decimal? BaseQuantity, Guid? ItemId, string? ItemSku, string? ItemName,
    string Description, decimal Quantity, decimal UnitPrice,
    decimal DiscountPercent, decimal TaxPercent);

public sealed record CreditMemoDto(
    Guid Id, string Number, string Division, DocumentStatus Status,
    Guid CustomerId, string? CustomerName, Guid? SalesReturnId, string? SalesReturnNumber,
    Guid? InvoiceId, string? InvoiceNumber, DateTime IssueDate, string Currency,
    string? TaxSerial, string? Notes, IReadOnlyList<CreditMemoLineDto> Lines);

public sealed record CreditMemoUpsertLineDto(
    int LineNumber, string? BaseDocumentType, Guid? BaseDocumentId, int? BaseLineNumber,
    decimal? BaseQuantity, Guid? ItemId, string Description, decimal Quantity, decimal UnitPrice,
    decimal DiscountPercent = 0, decimal TaxPercent = 0);

public sealed record CreditMemoUpsertDto(
    Guid CustomerId, Guid? SalesReturnId, Guid? InvoiceId,
    DateTime IssueDate, string Currency, string? TaxSerial, string? Notes,
    IReadOnlyList<CreditMemoUpsertLineDto> Lines);

public sealed class CreditMemoUpsertValidator : AbstractValidator<CreditMemoUpsertDto>
{
    public CreditMemoUpsertValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.IssueDate).NotEmpty();
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
            l.RuleFor(x => x.Quantity).GreaterThan(0);
            l.RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
        });
    }
}

public sealed record ExtraDiscountLineDto(
    Guid? Id, int LineNumber, Guid? CustomerId, string? CustomerName,
    Guid? BrandId, string? BrandCode, Guid? ItemId, string? ItemSku,
    decimal Discount2Percent, decimal Discount3Percent);

public sealed record ExtraDiscountDto(
    Guid Id, string Code, string Name, string Division,
    DateTime EffectiveFrom, DateTime? EffectiveTo, bool IsActive, string? Notes,
    IReadOnlyList<ExtraDiscountLineDto> Lines);

public sealed record ExtraDiscountUpsertLineDto(
    int LineNumber, Guid? CustomerId, Guid? BrandId, Guid? ItemId,
    decimal Discount2Percent, decimal Discount3Percent);

public sealed record ExtraDiscountUpsertDto(
    string Code, string Name, DateTime EffectiveFrom, DateTime? EffectiveTo,
    bool IsActive, string? Notes, IReadOnlyList<ExtraDiscountUpsertLineDto> Lines);

public sealed class ExtraDiscountUpsertValidator : AbstractValidator<ExtraDiscountUpsertDto>
{
    public ExtraDiscountUpsertValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.EffectiveFrom).NotEmpty();
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.Discount2Percent).InclusiveBetween(0, 100);
            l.RuleFor(x => x.Discount3Percent).InclusiveBetween(0, 100);
        });
    }
}
