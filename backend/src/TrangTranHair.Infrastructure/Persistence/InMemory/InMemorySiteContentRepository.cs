using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Infrastructure.Persistence.InMemory;

public sealed class InMemorySiteContentRepository : ISiteContentRepository
{
    private SiteContentResponse? _homepage;

    public Task<SiteContentResponse?> GetHomepageAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult(_homepage);

    public Task SaveHomepageAsync(SiteContentResponse content, CancellationToken cancellationToken = default)
    {
        _homepage = content;
        return Task.CompletedTask;
    }
}
