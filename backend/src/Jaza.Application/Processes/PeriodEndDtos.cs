namespace Jaza.Application.Processes;

public sealed record PeriodEndStepDto(string StepId, string Name, string Status, string? Message);

public sealed record MonthlyProcessRequest(string Division, int Year, int Month);
public sealed record MonthlyProcessResult(string Division, int Year, int Month, IReadOnlyList<PeriodEndStepDto> Steps);

public sealed record DayEndProcessRequest(string Division, DateTime Date);
public sealed record DayEndProcessResult(string Division, DateTime Date, IReadOnlyList<PeriodEndStepDto> Steps);

public sealed record DeleteCancelledDocumentRequest(
    string DocumentType, DateTime DateFrom, DateTime DateTo, string? Division, bool DryRun);
public sealed record DeleteCancelledDocumentResult(
    string DocumentType, int MatchedCount, bool DryRun, IReadOnlyList<string> DocumentNumbers);

public sealed record BackupJobDto(string FileName, long SizeBytes, DateTime CreatedAtUtc);
public sealed record RestoreResult(string FileName, bool Success, string? Message);
