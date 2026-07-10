namespace Jaza.Domain.Auth;

/// <summary>
/// Per-user UI preferences. Restored automatically on every login so devices stay in sync.
/// </summary>
public sealed class UserPreference
{
    /// <summary>Primary key + FK to AppUser.</summary>
    public Guid UserId { get; set; }

    /// <summary>"id" (Bahasa Indonesia, default) or "en" (English).</summary>
    public string Language { get; set; } = "id";

    /// <summary>"small" | "normal" (default) | "large".</summary>
    public string TextSize { get; set; } = "normal";

    /// <summary>"light" (default) | "dark".</summary>
    public string Theme { get; set; } = "light";

    /// <summary>Data division scope for non-admin users (e.g. DISTRIBUTIONBDG).</summary>
    public string? Division { get; set; }

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
