using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Domain.Entities;

public class Promotion : Common.BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public PromotionType Type { get; set; }
    public decimal Value { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
}
