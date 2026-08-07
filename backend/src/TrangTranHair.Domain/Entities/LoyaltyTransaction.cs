using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Domain.Entities;

public class LoyaltyTransaction : Common.BaseEntity
{
    public string CustomerId { get; set; } = string.Empty;
    public string? OrderId { get; set; }
    public LoyaltyTransactionType Type { get; set; }
    public int Points { get; set; }
    public string Description { get; set; } = string.Empty;
}
