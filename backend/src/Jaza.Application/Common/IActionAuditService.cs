namespace Jaza.Application.Common;

/// <summary>
/// Logs explicit business actions (Post, Void, Login) that are not plain entity CRUD.
/// </summary>
public interface IActionAuditService
{
    Task LogAsync(
        string action,
        string entity,
        Guid? entityId,
        string? entityCode = null,
        string? module = null,
        string? notes = null,
        string? beforeJson = null,
        string? afterJson = null,
        CancellationToken cancellationToken = default);
}
