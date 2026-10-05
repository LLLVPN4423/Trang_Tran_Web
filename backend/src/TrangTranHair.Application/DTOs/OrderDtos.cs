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
    string? CustomerId = null,
    PaymentMethod PaymentMethod = PaymentMethod.BankTransfer,
    FulfillmentMethod FulfillmentMethod = FulfillmentMethod.Pickup,
    string? DeliveryAddress = null,
    ShippingZone? ShippingZone = null);

public sealed record ShippingZoneOption(
    ShippingZone Zone,
    string Label,
    decimal Fee);

public sealed record UpdateShipmentRequest(
    string TrackingCode,
    string? TrackingUrl = null,
    string? Carrier = null);

public sealed record SubmitDisputeRequest(
    string Reason,
    string? Notes = null);

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
    OrderKind Kind,
    string? AppointmentId,
    string? InternalNotes,
    decimal ManualDiscountAmount,
    string? CreatedByAdminUid,
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
    PaymentMethod PaymentMethod,
    FulfillmentMethod FulfillmentMethod,
    string? DeliveryAddress,
    decimal ShippingFee,
    ShippingZone? ShippingZone,
    FulfillmentStatus FulfillmentStatus,
    string? TrackingCode,
    string? TrackingUrl,
    string? Carrier,
    DateTime? ApprovedAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt,
    DateTime? CompletedAt,
    string? DisputeReason,
    string? DisputeNotes,
    DateTime? DisputedAt,
    string PaymentCode,
    string AccessToken,
    DateTime CreatedAt,
    DateTime? PaidAt = null);

public sealed record UpdateOrderStatusRequest(
    OrderStatus Status);
