using System.Collections.Concurrent;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;

namespace TrangTranHair.Infrastructure.Persistence.InMemory;

public sealed class InMemoryServiceRepository : IServiceRepository
{
    private readonly ConcurrentDictionary<string, Service> _store = new();

    public Task<IReadOnlyList<Service>> GetAllAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<Service>>(_store.Values.OrderBy(s => s.Name).ToList());

    public Task<Service?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        _store.TryGetValue(id, out var service);
        return Task.FromResult(service);
    }

    public Task<Service> CreateAsync(Service service, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(service.Id))
            service.Id = Guid.NewGuid().ToString();

        service.CreatedAt = DateTime.UtcNow;
        _store[service.Id] = service;
        return Task.FromResult(service);
    }

    public Task<Service> UpdateAsync(Service service, CancellationToken cancellationToken = default)
    {
        service.UpdatedAt = DateTime.UtcNow;
        _store[service.Id] = service;
        return Task.FromResult(service);
    }

    public Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        _store.TryRemove(id, out _);
        return Task.CompletedTask;
    }
}
