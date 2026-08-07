using System.Collections.Concurrent;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Infrastructure.Persistence.InMemory;

public sealed class InMemoryOrderRepository : IOrderRepository
{
    private readonly ConcurrentDictionary<string, Order> _store = new();

    public Task<Order?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        _store.TryGetValue(id, out var order);
        return Task.FromResult(order);
    }

    public Task<Order?> GetByPaymentCodeAsync(string paymentCode, CancellationToken cancellationToken = default)
    {
        var order = _store.Values.FirstOrDefault(o =>
            o.PaymentCode.Equals(paymentCode, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(order);
    }

    public Task<Order> CreateAsync(Order order, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(order.Id))
            order.Id = Guid.NewGuid().ToString();

        order.CreatedAt = DateTime.UtcNow;
        _store[order.Id] = order;
        return Task.FromResult(order);
    }

    public Task<Order> UpdateAsync(Order order, CancellationToken cancellationToken = default)
    {
        order.UpdatedAt = DateTime.UtcNow;
        _store[order.Id] = order;
        return Task.FromResult(order);
    }

    public Task<IReadOnlyList<Order>> GetAllAsync(
        OrderStatus? status = null,
        string? phone = null,
        string? customerId = null,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<Order> query = _store.Values;

        if (status is not null)
            query = query.Where(o => o.Status == status);

        if (!string.IsNullOrWhiteSpace(phone))
            query = query.Where(o => o.CustomerPhone.Contains(phone, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(customerId))
            query = query.Where(o => o.CustomerId == customerId);

        return Task.FromResult<IReadOnlyList<Order>>(query.OrderByDescending(o => o.CreatedAt).ToList());
    }
}
