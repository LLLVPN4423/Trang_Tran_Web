using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Domain.Entities;

public class Order : Common.BaseEntity
{
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
    public string PaymentCode { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public bool StockReserved { get; set; }
    public DateTime? StockReservedAt { get; set; }
    public string? SePayTransactionId { get; set; }
    public DateTime? PaidAt { get; set; }
}
