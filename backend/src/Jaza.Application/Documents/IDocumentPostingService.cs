using Jaza.Domain.Common;

namespace Jaza.Application.Documents;

public interface IDocumentPostingService
{
    Task PostAsync<T>(Guid id, string entityName, Func<T, DocumentStatus> getStatus, Action<T> setPosted,
        Func<T, Task> onPost, CancellationToken ct = default) where T : class;

    Task VoidAsync<T>(Guid id, string entityName, Func<T, bool> canVoid, Action<T> setVoided,
        CancellationToken ct = default) where T : class;
}
