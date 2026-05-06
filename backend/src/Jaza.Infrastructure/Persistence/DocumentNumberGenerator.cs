using Jaza.Application.Common;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Jaza.Infrastructure.Persistence;

/// <summary>
/// Issues monotonic document numbers via a row-locked counter table (DocumentSeries).
/// Format: {prefix}-{yyyy}-{NNNNNN}. Counter resets per (prefix, year).
///
/// Concurrency model on PostgreSQL:
///   1. INSERT ... ON CONFLICT DO NOTHING — first transaction creates the row.
///   2. UPDATE ... SET "LastNumber" = "LastNumber" + 1 RETURNING "LastNumber" — atomic increment.
/// The UPDATE acquires a row-level exclusive lock until commit, so concurrent issuers serialize
/// safely without gaps or duplicates.
/// </summary>
public sealed class DocumentNumberGenerator(AppDbContext db) : IDocumentNumberGenerator
{
    public async Task<string> NextAsync(string seriesPrefix, CancellationToken ct = default)
    {
        var year = DateTime.UtcNow.Year;
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        // Ensure the row exists. ON CONFLICT DO NOTHING is no-op when the row already exists.
        const string upsert = """
            INSERT INTO "DocumentSeries" ("Prefix", "Year", "LastNumber")
            VALUES (@prefix, @year, 0)
            ON CONFLICT ("Prefix", "Year") DO NOTHING;
        """;
        await db.Database.ExecuteSqlRawAsync(
            upsert,
            [
                new NpgsqlParameter("@prefix", seriesPrefix),
                new NpgsqlParameter("@year", year),
            ],
            ct);

        const string increment = """
            UPDATE "DocumentSeries"
               SET "LastNumber" = "LastNumber" + 1
             WHERE "Prefix" = @prefix AND "Year" = @year
            RETURNING "LastNumber";
        """;

        var nextNumber = (await db.Database.SqlQueryRaw<int>(
            increment,
            new NpgsqlParameter("@prefix", seriesPrefix),
            new NpgsqlParameter("@year", year)).ToListAsync(ct)).Single();
        await tx.CommitAsync(ct);

        return $"{seriesPrefix}-{year:0000}-{nextNumber:000000}";
    }
}
