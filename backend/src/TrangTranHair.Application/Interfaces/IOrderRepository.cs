using TrangTranHair.Application.DTOs;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<Order?> GetByPaymentCodeAsync(string paymentCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Order>> GetAllAsync(
        OrderStatus? status = null,
        string? phone = null,
        string? customerId = null,
        OrderKind? kind = null,
        string? appointmentId = null,
        CancellationToken cancellationToken = default);
    Task<Order> CreateAsync(Order order, CancellationToken cancellationToken = default);
    Task<Order> UpdateAsync(Order order, CancellationToken cancellationToken = default);
}
