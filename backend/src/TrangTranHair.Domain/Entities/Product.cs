namespace TrangTranHair.Domain.Entities;

public class Product : Common.BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Brand { get; set; } = "Moroccanoil";
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public List<string> GalleryUrls { get; set; } = [];
    public string? VideoUrl { get; set; }
    public bool IsActive { get; set; } = true;
}
