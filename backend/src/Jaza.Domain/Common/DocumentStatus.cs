namespace Jaza.Domain.Common;

/// <summary>
/// Lifecycle of any business document (PO, GRN, SO, DO, Invoice).
/// Once Posted, a document is immutable; corrections happen via reversal documents.
/// </summary>
public enum DocumentStatus
{
    Draft = 0,
    Posted = 10,
    Voided = 90,
}
