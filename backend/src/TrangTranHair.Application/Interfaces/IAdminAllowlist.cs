namespace TrangTranHair.Application.Interfaces;

/// <summary>
/// Danh sách UID Firebase được phép có quyền admin (FIREBASE_ADMIN_UIDS).
/// </summary>
public interface IAdminAllowlist
{
    bool IsConfigured { get; }

    bool Contains(string userId);

    IReadOnlyList<string> AllowedUids { get; }
}
