namespace TrangTranHair.Application.Interfaces;

public interface IAuthService
{
    Task<bool> ValidateAdminClaimAsync(string userId, CancellationToken cancellationToken = default);
}
