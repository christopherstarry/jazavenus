namespace Jaza.Migration;

/// <summary>
/// In-memory registry mapping legacy codes and DocEntry keys to new UUIDs during ETL.
/// Keys are division-scoped for transaction documents to support 4-DB merge.
/// </summary>
public sealed class LegacyIdMap
{
    private readonly Dictionary<(string Entity, string Code), Guid> _masterByCode = new();
    private readonly Dictionary<(string Division, string Table, int DocEntry), Guid> _docByEntry = new();
    private readonly Dictionary<(string Division, string Table, int DocEntry, int LineNum), Guid> _lineByEntry = new();

    public void RegisterMaster(string entity, string code, Guid id)
    {
        var key = (entity, NormalizeCode(code));
        _masterByCode[key] = id;
    }

    public bool TryGetMaster(string entity, string code, out Guid id) =>
        _masterByCode.TryGetValue((entity, NormalizeCode(code)), out id);

    public Guid RequireMaster(string entity, string code)
    {
        if (TryGetMaster(entity, code, out var id)) return id;
        throw new InvalidOperationException($"Unresolved master FK: {entity}.Code='{code}'");
    }

    public void RegisterDocument(string division, string table, int docEntry, Guid id)
    {
        _docByEntry[(NormalizeDivision(division), table, docEntry)] = id;
    }

    public bool TryGetDocument(string division, string table, int docEntry, out Guid id) =>
        _docByEntry.TryGetValue((NormalizeDivision(division), table, docEntry), out id);

    public Guid RequireDocument(string division, string table, int docEntry)
    {
        if (TryGetDocument(division, table, docEntry, out var id)) return id;
        throw new InvalidOperationException(
            $"Unresolved document FK: division='{division}' table='{table}' DocEntry={docEntry}");
    }

    public void RegisterLine(string division, string table, int docEntry, int lineNum, Guid id)
    {
        _lineByEntry[(NormalizeDivision(division), table, docEntry, lineNum)] = id;
    }

    public bool TryGetLine(string division, string table, int docEntry, int lineNum, out Guid id) =>
        _lineByEntry.TryGetValue((NormalizeDivision(division), table, docEntry, lineNum), out id);

    public int MasterCount => _masterByCode.Count;
    public int DocumentCount => _docByEntry.Count;
    public int LineCount => _lineByEntry.Count;

    private static string NormalizeCode(string code) => code.Trim().ToUpperInvariant();
    private static string NormalizeDivision(string division) => division.Trim().ToUpperInvariant();
}
