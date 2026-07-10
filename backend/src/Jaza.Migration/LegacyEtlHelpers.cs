using Jaza.Domain.Common;

namespace Jaza.Migration;

public static class LegacyEtlHelpers
{
  /// <summary>Legacy short code or DB name → canonical division string on transaction headers.</summary>
  public static readonly Dictionary<string, string> DivisionMap = new(StringComparer.OrdinalIgnoreCase)
  {
      ["BDG"] = "DISTRIBUTIONBDG",
      ["CRB"] = "DISTRIBUTIONCRB",
      ["DISTRIBUTIONBDG"] = "DISTRIBUTIONBDG",
      ["DISTRIBUTIONCRB"] = "DISTRIBUTIONCRB",
      ["TRADINGBDG"] = "TRADINGBDG",
      ["TRADINGCRB"] = "TRADINGCRB",
  };

  public static string ResolveDivision(string? companyIdKu, string? fallbackDivision)
  {
      var raw = (companyIdKu ?? fallbackDivision ?? "").Trim();
      if (string.IsNullOrEmpty(raw)) return "";
      return DivisionMap.TryGetValue(raw, out var mapped) ? mapped : raw.ToUpperInvariant();
  }

  /// <summary>Legacy DocStatus (char 1) → DocumentStatus. O=open/draft, C=closed/posted, B=cancelled/voided.</summary>
  public static DocumentStatus MapDocumentStatus(string? legacyStatus) => legacyStatus?.Trim().ToUpperInvariant() switch
  {
      "C" => DocumentStatus.Posted,
      "P" => DocumentStatus.Posted,
      "B" => DocumentStatus.Voided,
      "V" => DocumentStatus.Voided,
      _ => DocumentStatus.Draft,
  };

  public static string? GetString(Dictionary<string, object?> row, params string[] keys)
  {
      foreach (var key in keys)
      {
          if (row.TryGetValue(key, out var val) && val is not null)
          {
              var s = val.ToString()?.Trim();
              if (!string.IsNullOrEmpty(s)) return s;
          }
      }
      return null;
  }

  public static int? GetInt(Dictionary<string, object?> row, params string[] keys)
  {
      foreach (var key in keys)
      {
          if (!row.TryGetValue(key, out var val) || val is null) continue;
          if (val is int i) return i;
          if (int.TryParse(val.ToString(), out var parsed)) return parsed;
      }
      return null;
  }

  public static decimal GetDecimal(Dictionary<string, object?> row, params string[] keys)
  {
      foreach (var key in keys)
      {
          if (!row.TryGetValue(key, out var val) || val is null) continue;
          if (val is decimal d) return d;
          if (decimal.TryParse(val.ToString(), out var parsed)) return parsed;
      }
      return 0m;
  }

  public static DateTime GetDate(Dictionary<string, object?> row, params string[] keys)
  {
      foreach (var key in keys)
      {
          if (!row.TryGetValue(key, out var val) || val is null) continue;
          if (val is DateTime dt) return dt;
          if (DateTime.TryParse(val.ToString(), out var parsed)) return parsed;
      }
      return DateTime.UtcNow.Date;
  }

  public static string AppendSinceFilter(string sql, DateTime? since, string dateColumn = "AuditDate")
  {
      if (since is null) return sql;
      return sql.Contains("WHERE", StringComparison.OrdinalIgnoreCase)
          ? $"{sql} AND [{dateColumn}] >= @since"
          : $"{sql} WHERE [{dateColumn}] >= @since";
  }

  public static void BindSince(Microsoft.Data.SqlClient.SqlCommand cmd, DateTime? since)
  {
      if (since is null) return;
      cmd.Parameters.AddWithValue("@since", since.Value);
  }
}
