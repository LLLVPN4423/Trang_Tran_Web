using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Infrastructure.Auth;

public sealed class FirebaseAdminAllowlist : IAdminAllowlist
{
    public IReadOnlyList<string> AllowedUids { get; }

    public bool IsConfigured => AllowedUids.Count > 0;

    public FirebaseAdminAllowlist(IConfiguration configuration, ILogger<FirebaseAdminAllowlist> logger)
    {
        AllowedUids = ParseUids(configuration);

        if (!IsConfigured)
        {
            logger.LogWarning(
                "FIREBASE_ADMIN_UIDS chưa cấu hình — mọi quyền admin bị từ chối. Thêm UID admin vào .env rồi chạy node scripts/set-admin.js");
        }
        else
        {
            logger.LogInformation("Admin allowlist: {Count} UID(s) được phép", AllowedUids.Count);
        }
    }

    public bool Contains(string userId) =>
        !string.IsNullOrWhiteSpace(userId) &&
        AllowedUids.Contains(userId.Trim(), StringComparer.Ordinal);

    private static IReadOnlyList<string> ParseUids(IConfiguration configuration)
    {
        var raw = configuration["Firebase:AdminUids"];
        if (string.IsNullOrWhiteSpace(raw))
            return [];

        return raw
            .Split([',', ';', '\n', '\r'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(uid => !string.IsNullOrWhiteSpace(uid))
            .Distinct(StringComparer.Ordinal)
            .ToList();
    }
}
