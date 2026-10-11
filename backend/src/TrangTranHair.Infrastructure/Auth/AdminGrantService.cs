using FirebaseAdmin.Auth;
using Microsoft.Extensions.Logging;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Infrastructure.Auth;

public sealed class AdminGrantService(
    ISalonAdminRegistry registry,
    IAdminRoleAllowlist roleAllowlist,
    ILogger<AdminGrantService> logger) : IAdminGrantService
{
    public async Task<IReadOnlyList<SalonAdminEntry>> ListSalonAdminsAsync(CancellationToken cancellationToken = default)
    {
        var fromFs = await registry.ListAsync(cancellationToken);
        var env = roleAllowlist.SalonUids;
        var all = env.Concat(fromFs).Distinct(StringComparer.Ordinal);
        return all
            .Select(uid => new SalonAdminEntry(uid, fromFs.Contains(uid, StringComparer.Ordinal), env.Contains(uid, StringComparer.Ordinal)))
            .ToList();
    }

    public async Task GrantSalonAdminAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UID required.", nameof(userId));

        if (roleAllowlist.IsPlatform(userId))
            throw new InvalidOperationException("UID đã là Platform Admin — không gán Salon Admin.");

        await registry.AddAsync(userId, cancellationToken);
        await SetFirebaseClaimsAsync(userId, salon: true, cancellationToken);
        logger.LogInformation("Granted Salon Admin to {UserId}", userId);
    }

    public async Task RevokeSalonAdminAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UID required.", nameof(userId));

        if (roleAllowlist.IsPlatform(userId))
            throw new InvalidOperationException("Không thể thu hồi Platform Admin qua API.");

        await registry.RemoveAsync(userId, cancellationToken);

        if (!roleAllowlist.IsSalon(userId))
            await ClearAdminClaimsAsync(userId, cancellationToken);

        logger.LogInformation("Revoked Salon Admin from {UserId}", userId);
    }

    private static async Task SetFirebaseClaimsAsync(string userId, bool salon, CancellationToken cancellationToken)
    {
        if (FirebaseAdmin.FirebaseApp.DefaultInstance is null)
            throw new InvalidOperationException("Firebase Admin SDK chưa cấu hình — không đặt claim được.");

        var claims = salon
            ? new Dictionary<string, object> { ["admin"] = true, ["adminRole"] = "salon" }
            : new Dictionary<string, object>();

        await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(userId, claims, cancellationToken);
    }

    private static async Task ClearAdminClaimsAsync(string userId, CancellationToken cancellationToken)
    {
        if (FirebaseAdmin.FirebaseApp.DefaultInstance is null) return;
        await FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(userId, new Dictionary<string, object>(), cancellationToken);
    }
}
