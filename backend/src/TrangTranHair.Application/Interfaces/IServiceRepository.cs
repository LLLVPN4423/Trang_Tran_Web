using TrangTranHair.Domain.Entities;

namespace TrangTranHair.Application.Interfaces;

public interface IServiceRepository
{
    Task<IReadOnlyList<Service>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Service?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<Service> CreateAsync(Service service, CancellationToken cancellationToken = default);
    Task<Service> UpdateAsync(Service service, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}
