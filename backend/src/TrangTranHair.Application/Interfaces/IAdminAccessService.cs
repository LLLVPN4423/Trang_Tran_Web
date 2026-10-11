using System.Security.Claims;
using TrangTranHair.Application.Authorization;

namespace TrangTranHair.Application.Interfaces;

public interface IAdminAccessService
{
    /// <summary>Salon hoặc Platform — vào được /admin.</summary>
    Task<bool> IsAdminAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default);

    Task<bool> IsSalonAdminAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default);

    Task<bool> IsPlatformAdminAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default);

    Task<AdminRole> GetRoleAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default);
}
