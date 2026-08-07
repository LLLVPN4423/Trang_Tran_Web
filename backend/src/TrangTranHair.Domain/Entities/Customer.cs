namespace TrangTranHair.Domain.Entities;

public class Customer : Common.BaseEntity
{
    public string FirebaseUid { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public int LoyaltyPoints { get; set; }
    public decimal TotalSpent { get; set; }
}
