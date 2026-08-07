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
    List<CreateOrderItemRequest> Items,
    string? PromoCode = null,
    int PointsToRedeem = 0,
    string? CustomerId = null);

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
    string? CustomerId,
    string CustomerName,
    string CustomerPhone,
    string? CustomerEmail,
    string? Notes,
    IReadOnlyList<OrderItemResponse> Items,
    decimal SubtotalAmount,
    decimal DiscountAmount,
    string? PromotionCode,
    int PointsRedeemed,
    int PointsEarned,
    decimal TotalAmount,
    OrderStatus Status,
    string PaymentCode,
    DateTime CreatedAt,
    DateTime? PaidAt = null);

public sealed record UpdateOrderStatusRequest(
    OrderStatus Status);
