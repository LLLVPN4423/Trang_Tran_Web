namespace TrangTranHair.Application.Interfaces;

/// <summary>
/// Platform = FIREBASE_ADMIN_UIDS; Salon = FIREBASE_SALON_ADMIN_UIDS.
/// </summary>
public interface IAdminRoleAllowlist
{
    IReadOnlyList<string> PlatformUids { get; }

    IReadOnlyList<string> SalonUids { get; }

    bool IsPlatform(string userId);

    bool IsSalon(string userId);
}
