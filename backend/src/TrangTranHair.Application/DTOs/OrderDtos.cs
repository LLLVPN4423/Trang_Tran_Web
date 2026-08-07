using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.DTOs;

public sealed record CreateOrderItemRequest(
    string ItemId,
    OrderItemType ItemType,
    int Quantity = 1,
    HairSize? HairSize = null);

public sealed record CreateOrderRequest(
    string CustomerName,
    string CustomerPhone,
    string? CustomerEmail,
    string? Notes,
    List<CreateOrderItemRequest> Items);

public sealed record OrderItemResponse(
    string ItemId,
    OrderItemType ItemType,
    string Name,
    int Quantity,
    decimal UnitPrice,
    HairSize? HairSize,
    decimal Subtotal);

public sealed record OrderResponse(
    string Id,
    string CustomerName,
    string CustomerPhone,
    string? CustomerEmail,
    string? Notes,
    IReadOnlyList<OrderItemResponse> Items,
    decimal TotalAmount,
    OrderStatus Status,
    string PaymentCode,
    DateTime CreatedAt);
