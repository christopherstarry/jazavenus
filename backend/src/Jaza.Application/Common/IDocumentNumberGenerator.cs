namespace Jaza.Application.Common;

/// <summary>
/// Atomically generates the next document number for a series (e.g. "PO", "GRN", "INV").
/// Implementation uses a SQL-Server SEQUENCE per series for crash-safe gap-free numbering.
/// Format: {prefix}-{yyyy}-{6-digit-counter}, e.g. PO-2026-000123.
/// </summary>
public interface IDocumentNumberGenerator
{
    Task<string> NextAsync(string seriesPrefix, CancellationToken ct = default);
}
