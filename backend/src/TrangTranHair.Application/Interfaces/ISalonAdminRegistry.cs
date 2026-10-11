namespace TrangTranHair.Application.Interfaces;

/** UID Salon Admin — env (FIREBASE_SALON_ADMIN_UIDS) + danh sách Platform cấp trên Firestore. */
public interface ISalonAdminRegistry
{
    Task<IReadOnlyList<string>> ListAsync(CancellationToken cancellationToken = default);

    Task<bool> ContainsAsync(string userId, CancellationToken cancellationToken = default);

    Task AddAsync(string userId, CancellationToken cancellationToken = default);

    Task RemoveAsync(string userId, CancellationToken cancellationToken = default);
}
