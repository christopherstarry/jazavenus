namespace Jaza.Domain.Common;

/// <summary>Links a transaction line back to its source document line (PO→GRN, SO→DO chain).</summary>
public interface IBaseDocumentLine
{
    string? BaseDocumentType { get; set; }
    Guid? BaseDocumentId { get; set; }
    int? BaseLineNumber { get; set; }
    decimal? BaseQuantity { get; set; }
}
