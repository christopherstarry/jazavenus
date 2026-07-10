using FluentValidation;
using Jaza.Domain.Common;
using Jaza.Domain.Inventory;

namespace Jaza.Application.Inventory;

public sealed record StockReceiptLineDto(
    Guid? Id, int LineNumber, Guid ItemId, string? ItemSku, string? ItemName,
    Guid? LocationId, decimal Quantity, decimal UnitCost, string? BatchOrSerial);

public sealed record StockReceiptDto(
    Guid Id, string Number, string Division, DocumentStatus Status,
    Guid WarehouseId, string? WarehouseCode, DateTime ReceiptDate,
    string? ReasonCode, string? Notes, IReadOnlyList<StockReceiptLineDto> Lines);

public sealed record StockReceiptUpsertLineDto(
    int LineNumber, Guid ItemId, Guid? LocationId, decimal Quantity, decimal UnitCost, string? BatchOrSerial);

public sealed record StockReceiptUpsertDto(
    Guid WarehouseId, DateTime ReceiptDate, string? ReasonCode, string? Notes,
    IReadOnlyList<StockReceiptUpsertLineDto> Lines);

public sealed class StockReceiptUpsertValidator : AbstractValidator<StockReceiptUpsertDto>
{
    public StockReceiptUpsertValidator()
    {
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.ReceiptDate).NotEmpty();
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.ItemId).NotEmpty();
            l.RuleFor(x => x.Quantity).GreaterThan(0);
            l.RuleFor(x => x.UnitCost).GreaterThanOrEqualTo(0);
        });
    }
}

public sealed record StockIssueLineDto(
    Guid? Id, int LineNumber, Guid ItemId, string? ItemSku, string? ItemName,
    Guid? LocationId, decimal Quantity, decimal UnitCost);

public sealed record StockIssueDto(
    Guid Id, string Number, string Division, DocumentStatus Status,
    Guid WarehouseId, string? WarehouseCode, DateTime IssueDate,
    string? ReasonCode, string? Notes, IReadOnlyList<StockIssueLineDto> Lines);

public sealed record StockIssueUpsertLineDto(
    int LineNumber, Guid ItemId, Guid? LocationId, decimal Quantity, decimal UnitCost = 0);

public sealed record StockIssueUpsertDto(
    Guid WarehouseId, DateTime IssueDate, string? ReasonCode, string? Notes,
    IReadOnlyList<StockIssueUpsertLineDto> Lines);

public sealed class StockIssueUpsertValidator : AbstractValidator<StockIssueUpsertDto>
{
    public StockIssueUpsertValidator()
    {
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.IssueDate).NotEmpty();
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.ItemId).NotEmpty();
            l.RuleFor(x => x.Quantity).GreaterThan(0);
        });
    }
}

public sealed record StockTransferLineDto(
    Guid? Id, int LineNumber, Guid ItemId, string? ItemSku, string? ItemName,
    Guid? FromLocationId, Guid? ToLocationId, decimal Quantity);

public sealed record StockTransferDto(
    Guid Id, string Number, string Division, DocumentStatus Status,
    Guid FromWarehouseId, string? FromWarehouseCode,
    Guid ToWarehouseId, string? ToWarehouseCode,
    DateTime TransferDate, string? Notes, IReadOnlyList<StockTransferLineDto> Lines);

public sealed record StockTransferUpsertLineDto(
    int LineNumber, Guid ItemId, Guid? FromLocationId, Guid? ToLocationId, decimal Quantity);

public sealed record StockTransferUpsertDto(
    Guid FromWarehouseId, Guid ToWarehouseId, DateTime TransferDate, string? Notes,
    IReadOnlyList<StockTransferUpsertLineDto> Lines);

public sealed class StockTransferUpsertValidator : AbstractValidator<StockTransferUpsertDto>
{
    public StockTransferUpsertValidator()
    {
        RuleFor(x => x.FromWarehouseId).NotEmpty();
        RuleFor(x => x.ToWarehouseId).NotEmpty();
        RuleFor(x => x.TransferDate).NotEmpty();
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.ItemId).NotEmpty();
            l.RuleFor(x => x.Quantity).GreaterThan(0);
        });
    }
}

public sealed record StockTakeLineDto(
    Guid? Id, int LineNumber, Guid ItemId, string? ItemSku, string? ItemName,
    Guid? LocationId, decimal SystemQuantity, decimal? CountedQuantity, decimal Variance);

public sealed record StockTakeSessionDto(
    Guid Id, string Number, string Division, StockTakeStatus Status,
    Guid WarehouseId, string? WarehouseCode, DateTime SessionDate, string? Notes,
    IReadOnlyList<StockTakeLineDto> Lines);

public sealed record StockTakePrepDto(Guid WarehouseId, DateTime SessionDate, string? Notes);

public sealed class StockTakePrepValidator : AbstractValidator<StockTakePrepDto>
{
    public StockTakePrepValidator()
    {
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.SessionDate).NotEmpty();
    }
}

public sealed record StockTakeLineRecordDto(int LineNumber, Guid ItemId, Guid? LocationId, decimal CountedQuantity);

public sealed record StockTakeRecordLinesDto(IReadOnlyList<StockTakeLineRecordDto> Lines);

public sealed class StockTakeRecordLinesValidator : AbstractValidator<StockTakeRecordLinesDto>
{
    public StockTakeRecordLinesValidator()
    {
        RuleFor(x => x.Lines).NotEmpty();
        RuleForEach(x => x.Lines).ChildRules(l =>
        {
            l.RuleFor(x => x.ItemId).NotEmpty();
            l.RuleFor(x => x.CountedQuantity).GreaterThanOrEqualTo(0);
        });
    }
}
