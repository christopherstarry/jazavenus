namespace Jaza.Domain.Errors;

public sealed class ErrorLog
{
    public Guid Id { get; set; } = Guid.CreateVersion7();
    public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;

    public required string Message { get; set; }
    public string? StackTrace { get; set; }
    public string? ExceptionType { get; set; }
    public int StatusCode { get; set; }

    public string? RequestPath { get; set; }
    public string? RequestMethod { get; set; }

    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}
