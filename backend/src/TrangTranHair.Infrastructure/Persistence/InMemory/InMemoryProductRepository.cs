using System.Collections.Concurrent;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;

namespace TrangTranHair.Infrastructure.Persistence.InMemory;

public sealed class InMemoryProductRepository : IProductRepository
{
    private readonly ConcurrentDictionary<string, Product> _store = new();

    public Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<Product>>(_store.Values.OrderBy(p => p.Name).ToList());

    public Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        _store.TryGetValue(id, out var product);
        return Task.FromResult(product);
    }

    public Task<Product> CreateAsync(Product product, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(product.Id))
            product.Id = Guid.NewGuid().ToString();

        product.CreatedAt = DateTime.UtcNow;
        _store[product.Id] = product;
        return Task.FromResult(product);
    }

    public Task<Product> UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        product.UpdatedAt = DateTime.UtcNow;
        _store[product.Id] = product;
        return Task.FromResult(product);
    }

    public Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        _store.TryRemove(id, out _);
        return Task.CompletedTask;
    }
}
