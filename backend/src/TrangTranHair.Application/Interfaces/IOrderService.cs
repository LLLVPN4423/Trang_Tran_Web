using TrangTranHair.Application.DTOs;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Interfaces;

public interface IOrderService
{
    Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default);
    Task<OrderResponse> GetOrderAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<OrderResponse>> ListOrdersAsync(OrderStatus? status = null, string? phone = null, string? customerId = null, CancellationToken cancellationToken = default);
    Task<OrderResponse> UpdateStatusAsync(string id, OrderStatus status, CancellationToken cancellationToken = default);
    Task<OrderResponse> ConfirmPaymentAsync(string id, string? sePayTransactionId = null, CancellationToken cancellationToken = default);
    Task<OrderResponse> ApproveFulfillmentAsync(string id, CancellationToken cancellationToken = default);
    Task<OrderResponse> UpdateShipmentAsync(string id, UpdateShipmentRequest request, CancellationToken cancellationToken = default);
    Task<OrderResponse> MarkDeliveredAsync(string id, CancellationToken cancellationToken = default);
    Task<OrderResponse> ConfirmReceivedAsync(string id, string? accessToken, CancellationToken cancellationToken = default);
    Task<OrderResponse> SubmitDisputeAsync(string id, SubmitDisputeRequest request, string? accessToken, CancellationToken cancellationToken = default);
    Task<int> LinkGuestOrdersAsync(string customerId, string phone, CancellationToken cancellationToken = default);
}
