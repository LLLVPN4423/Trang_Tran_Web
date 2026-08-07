using System.Collections.Concurrent;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;

namespace TrangTranHair.Infrastructure.Persistence.InMemory;

public sealed class InMemoryCustomerRepository : ICustomerRepository
{
    private readonly ConcurrentDictionary<string, Customer> _store = new();

    public Task<Customer?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        _store.TryGetValue(id, out var customer);
        return Task.FromResult(customer);
    }

    public Task<Customer?> GetByFirebaseUidAsync(string firebaseUid, CancellationToken cancellationToken = default)
    {
        var customer = _store.Values.FirstOrDefault(c => c.FirebaseUid == firebaseUid);
        return Task.FromResult(customer);
    }

    public Task<Customer> CreateAsync(Customer customer, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(customer.Id))
            customer.Id = customer.FirebaseUid;

        customer.CreatedAt = DateTime.UtcNow;
        _store[customer.Id] = customer;
        return Task.FromResult(customer);
    }

    public Task<Customer> UpdateAsync(Customer customer, CancellationToken cancellationToken = default)
    {
        customer.UpdatedAt = DateTime.UtcNow;
        _store[customer.Id] = customer;
        return Task.FromResult(customer);
    }

    public Task<IReadOnlyList<Customer>> GetAllAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<Customer>>(_store.Values.OrderBy(c => c.Name).ToList());
}

public sealed class InMemoryPromotionRepository : IPromotionRepository
{
    private readonly ConcurrentDictionary<string, Promotion> _store = new();

    public Task<Promotion?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        _store.TryGetValue(id, out var promotion);
        return Task.FromResult(promotion);
    }

    public Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var promotion = _store.Values.FirstOrDefault(p =>
            p.Code.Equals(code, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(promotion);
    }

    public Task<IReadOnlyList<Promotion>> GetAllAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<Promotion>>(_store.Values.OrderBy(p => p.Code).ToList());

    public Task<Promotion> CreateAsync(Promotion promotion, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(promotion.Id))
            promotion.Id = Guid.NewGuid().ToString();

        promotion.Code = promotion.Code.ToUpperInvariant();
        promotion.CreatedAt = DateTime.UtcNow;
        _store[promotion.Id] = promotion;
        return Task.FromResult(promotion);
    }

    public Task<Promotion> UpdateAsync(Promotion promotion, CancellationToken cancellationToken = default)
    {
        promotion.UpdatedAt = DateTime.UtcNow;
        _store[promotion.Id] = promotion;
        return Task.FromResult(promotion);
    }

    public Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        _store.TryRemove(id, out _);
        return Task.CompletedTask;
    }
}

public sealed class InMemoryLoyaltyRepository : ILoyaltyRepository
{
    private readonly ConcurrentDictionary<string, LoyaltyTransaction> _store = new();

    public Task<IReadOnlyList<LoyaltyTransaction>> GetByCustomerIdAsync(string customerId, CancellationToken cancellationToken = default)
    {
        var items = _store.Values
            .Where(t => t.CustomerId == customerId)
            .OrderByDescending(t => t.CreatedAt)
            .ToList();
        return Task.FromResult<IReadOnlyList<LoyaltyTransaction>>(items);
    }

    public Task<LoyaltyTransaction> CreateAsync(LoyaltyTransaction transaction, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(transaction.Id))
            transaction.Id = Guid.NewGuid().ToString();

        transaction.CreatedAt = DateTime.UtcNow;
        _store[transaction.Id] = transaction;
        return Task.FromResult(transaction);
    }
}
