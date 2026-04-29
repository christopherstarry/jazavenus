namespace Jaza.Application.Common;

/// <summary>Resolves the user behind the current request. Implemented in the Api layer.</summary>
public interface ICurrentUser
{
    Guid? UserId { get; }
    string? UserName { get; }
    string? IpAddress { get; }
    string? UserAgent { get; }
    bool IsAuthenticated { get; }
    bool IsInRole(string role);
}
