using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Domain.Entities;

public class Order : Common.BaseEntity
{
    public OrderKind Kind { get; set; } = OrderKind.Retail;
    public string? AppointmentId { get; set; }
    public string? InternalNotes { get; set; }
    public decimal ManualDiscountAmount { get; set; }
    public string? CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? Notes { get; set; }
    public List<OrderItem> Items { get; set; } = [];
    public decimal SubtotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? PromotionCode { get; set; }
    public int PointsRedeemed { get; set; }
    public int PointsEarned { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.BankTransfer;
    public FulfillmentMethod FulfillmentMethod { get; set; } = FulfillmentMethod.Pickup;
    public string? DeliveryAddress { get; set; }
    public decimal ShippingFee { get; set; }
    public ShippingZone? ShippingZone { get; set; }
    public FulfillmentStatus FulfillmentStatus { get; set; } = FulfillmentStatus.None;
    public string? TrackingCode { get; set; }
    public string? TrackingUrl { get; set; }
    public string? Carrier { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? DisputeReason { get; set; }
    public string? DisputeNotes { get; set; }
    public DateTime? DisputedAt { get; set; }
    public string PaymentCode { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public bool StockReserved { get; set; }
    public DateTime? StockReservedAt { get; set; }
    public string? SePayTransactionId { get; set; }
    public DateTime? PaidAt { get; set; }
}
