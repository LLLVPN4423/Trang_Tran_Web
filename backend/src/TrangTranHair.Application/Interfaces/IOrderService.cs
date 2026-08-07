using TrangTranHair.Application.DTOs;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Interfaces;

public interface IOrderService
{
    Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<OrderResponse> GetOrderAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrderResponse>> ListOrdersAsync(OrderStatus? status = null, string? phone = null, string? customerId = null, CancellationToken cancellationToken = default);
    Task<OrderResponse> UpdateStatusAsync(string id, OrderStatus status, CancellationToken cancellationToken = default);
}
