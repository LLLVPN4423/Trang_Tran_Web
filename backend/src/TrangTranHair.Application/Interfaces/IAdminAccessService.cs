using System.Security.Claims;

namespace TrangTranHair.Application.Interfaces;

public interface IAdminAccessService
{
    Task<bool> IsAdminAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default);
}
