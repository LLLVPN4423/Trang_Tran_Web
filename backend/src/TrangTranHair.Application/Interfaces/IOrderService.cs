using TrangTranHair.Application.DTOs;

namespace TrangTranHair.Application.Interfaces;

public interface IOrderService
{
    Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<OrderResponse> GetOrderAsync(string id, CancellationToken cancellationToken = default);
}
