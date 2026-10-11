using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Infrastructure.Auth;

public sealed class FirebaseAdminRoleAllowlist : IAdminRoleAllowlist, IAdminAllowlist
{
    public IReadOnlyList<string> PlatformUids { get; }
    public IReadOnlyList<string> SalonUids { get; }
    public IReadOnlyList<string> AllowedUids => PlatformUids;

    public bool IsConfigured => PlatformUids.Count > 0 || SalonUids.Count > 0;

    public FirebaseAdminRoleAllowlist(IConfiguration configuration, ILogger<FirebaseAdminRoleAllowlist> logger)
    {
        PlatformUids = ParseUids(configuration["Firebase:AdminUids"]);
        SalonUids = ParseUids(configuration["Firebase:SalonAdminUids"]);

        if (PlatformUids.Count == 0)
        {
            logger.LogWarning(
                "FIREBASE_ADMIN_UIDS chưa cấu hình — không có Platform Admin. Thêm UID vào .env / Cloud Run.");
        }
        else
        {
            logger.LogInformation("Platform admin allowlist: {Count} UID(s)", PlatformUids.Count);
        }

        if (SalonUids.Count > 0)
            logger.LogInformation("Salon admin allowlist: {Count} UID(s)", SalonUids.Count);
    }

    public bool Contains(string userId) => IsPlatform(userId);

    public bool IsPlatform(string userId) =>
        !string.IsNullOrWhiteSpace(userId) &&
        PlatformUids.Contains(userId.Trim(), StringComparer.Ordinal);

    public bool IsSalon(string userId) =>
        !string.IsNullOrWhiteSpace(userId) &&
        SalonUids.Contains(userId.Trim(), StringComparer.Ordinal);

    private static IReadOnlyList<string> ParseUids(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return [];

        return raw
            .Split([',', ';', '\n', '\r'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(uid => !string.IsNullOrWhiteSpace(uid))
            .Distinct(StringComparer.Ordinal)
            .ToList();
    }
}
