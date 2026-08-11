using System.Security.Claims;
using Microsoft.Extensions.Logging;
using TrangTranHair.Application.Authorization;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Infrastructure.Auth;

public sealed class AdminAccessService(
    IAdminAllowlist allowlist,
    IAuthService authService,
    ILogger<AdminAccessService> logger) : IAdminAccessService
{
    public async Task<bool> IsAdminAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default)
    {
        if (user.Identity?.IsAuthenticated != true)
            return false;

        var userId = AdminClaimHelper.GetUserId(user);
        if (string.IsNullOrWhiteSpace(userId))
            return false;

        if (!allowlist.IsConfigured)
        {
            logger.LogDebug("Admin denied for {UserId}: allowlist not configured", userId);
            return false;
        }

        if (!allowlist.Contains(userId))
        {
            logger.LogDebug("Admin denied for {UserId}: not in FIREBASE_ADMIN_UIDS", userId);
            return false;
        }

        if (AdminClaimHelper.HasAdminClaim(user))
            return true;

        return await authService.ValidateAdminClaimAsync(userId, cancellationToken);
    }
}
