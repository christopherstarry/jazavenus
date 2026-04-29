using Jaza.Application.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace Jaza.Infrastructure.Persistence;

/// <summary>
/// Issues monotonic document numbers via a row-locked counter table (DocumentSeries).
/// Format: {prefix}-{yyyy}-{NNNNNN}. Counter resets per (prefix, year).
/// </summary>
public sealed class DocumentNumberGenerator(AppDbContext db) : IDocumentNumberGenerator
{
    public async Task<string> NextAsync(string seriesPrefix, CancellationToken ct = default)
    {
        var year = DateTime.UtcNow.Year;
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable, ct);

        var prefixParam = new SqlParameter("@prefix", seriesPrefix);
        var yearParam = new SqlParameter("@year", year);

        const string sql = """
            DECLARE @next int;
            UPDATE DocumentSeries WITH (UPDLOCK, HOLDLOCK)
              SET LastNumber = LastNumber + 1, @next = LastNumber + 1
              WHERE Prefix = @prefix AND [Year] = @year;
            IF @@ROWCOUNT = 0
            BEGIN
              INSERT INTO DocumentSeries (Prefix, [Year], LastNumber) VALUES (@prefix, @year, 1);
              SET @next = 1;
            END
            SELECT @next AS Value;
        """;

        var nextNumber = (await db.Database.SqlQueryRaw<int>(sql, prefixParam, yearParam).ToListAsync(ct)).Single();
        await tx.CommitAsync(ct);

        return $"{seriesPrefix}-{year:0000}-{nextNumber:000000}";
    }
}
