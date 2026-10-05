using TrangTranHair.Application.DTOs;

namespace TrangTranHair.Application.Interfaces;

public interface ISiteContentRepository
{
    Task<SiteContentResponse?> GetHomepageAsync(CancellationToken cancellationToken = default);
    Task SaveHomepageAsync(SiteContentResponse content, CancellationToken cancellationToken = default);
}
