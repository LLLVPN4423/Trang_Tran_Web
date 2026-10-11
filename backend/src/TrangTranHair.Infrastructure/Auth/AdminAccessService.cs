using System.Security.Claims;
using Microsoft.Extensions.Logging;
using TrangTranHair.Application.Authorization;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Infrastructure.Auth;

public sealed class AdminAccessService(
    IAdminRoleAllowlist roleAllowlist,
    IAuthService authService,
    ILogger<AdminAccessService> logger) : IAdminAccessService
{
    public Task<bool> IsAdminAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default) =>
        IsSalonAdminAsync(user, cancellationToken);

    public async Task<bool> IsSalonAdminAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default) =>
        await GetRoleAsync(user, cancellationToken) is AdminRole.Salon or AdminRole.Platform;

    public async Task<bool> IsPlatformAdminAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default) =>
        await GetRoleAsync(user, cancellationToken) == AdminRole.Platform;

    public async Task<AdminRole> GetRoleAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default)
    {
        if (user.Identity?.IsAuthenticated != true)
            return AdminRole.None;

        var userId = AdminClaimHelper.GetUserId(user);
        if (string.IsNullOrWhiteSpace(userId))
            return AdminRole.None;

        var inPlatform = roleAllowlist.IsPlatform(userId);
        var inSalon = roleAllowlist.IsSalon(userId);

        if (!inPlatform && !inSalon)
        {
            logger.LogDebug("Admin denied for {UserId}: not in platform or salon allowlist", userId);
            return AdminRole.None;
        }

        var hasClaim = AdminClaimHelper.HasAdminClaim(user);
        if (!hasClaim)
        {
            hasClaim = await authService.ValidateAdminClaimAsync(userId, cancellationToken);
            if (!hasClaim)
            {
                logger.LogDebug("Admin denied for {UserId}: missing admin claim", userId);
                return AdminRole.None;
            }
        }

        if (inPlatform)
            return AdminRole.Platform;

        return AdminRole.Salon;
    }
}
