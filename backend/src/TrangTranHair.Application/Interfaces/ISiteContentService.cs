using TrangTranHair.Application.DTOs;

namespace TrangTranHair.Application.Interfaces;

public interface ISiteContentService
{
    Task<SiteContentResponse> GetHomepageAsync(CancellationToken cancellationToken = default);
    Task<SiteContentResponse> UpdateHomepageAsync(UpdateSiteContentRequest request, CancellationToken cancellationToken = default);
}
