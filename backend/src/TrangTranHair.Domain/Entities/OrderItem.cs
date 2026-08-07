using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Domain.Entities;

public class OrderItem
{
    public string ItemId { get; set; } = string.Empty;
    public OrderItemType ItemType { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public HairSize? HairSize { get; set; }
    public decimal Subtotal => UnitPrice * Quantity;
}
