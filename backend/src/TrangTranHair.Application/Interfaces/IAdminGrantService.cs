namespace TrangTranHair.Application.Interfaces;

public interface IAdminGrantService
{
    Task<IReadOnlyList<SalonAdminEntry>> ListSalonAdminsAsync(CancellationToken cancellationToken = default);

    Task GrantSalonAdminAsync(string userId, CancellationToken cancellationToken = default);

    Task RevokeSalonAdminAsync(string userId, CancellationToken cancellationToken = default);
}

public sealed record SalonAdminEntry(string UserId, bool FromFirestore, bool FromEnvironment);
