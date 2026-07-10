namespace Jaza.Application.Processes;

public enum ProcessJobStatus
{
    Queued = 0,
    Running = 10,
    Completed = 20,
    Failed = 90,
}

public enum ProcessJobType
{
    AutoDelivery = 1,
    AutoInvoice = 2,
    AutoDelete = 3,
    AutoPoFromSo = 4,
}

public sealed record ProcessJobDto(
    Guid Id, ProcessJobType Type, ProcessJobStatus Status,
    DateTime QueuedAtUtc, DateTime? CompletedAtUtc, string? Message);

public sealed record ProcessEnqueueRequest(string? Notes);

public sealed record IntegrationStubResult(string Integration, string Status, string? Message);

public sealed record SystemStubResult(string Operation, string Status, string? Message);
