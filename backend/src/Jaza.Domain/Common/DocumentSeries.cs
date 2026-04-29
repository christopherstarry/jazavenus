namespace Jaza.Domain.Common;

/// <summary>
/// Per-(Prefix, Year) gap-free counter used by <c>IDocumentNumberGenerator</c>.
/// This entity is intentionally NOT inheriting from Entity — it's a lookup row, not a domain aggregate.
/// </summary>
public sealed class DocumentSeries
{
    public required string Prefix { get; set; }
    public int Year { get; set; }
    public int LastNumber { get; set; }
}
