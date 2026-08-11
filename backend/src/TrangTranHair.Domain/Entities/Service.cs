using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Domain.Entities;

public class Service : Common.BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ServiceCategory Category { get; set; }
    public StylistLevel? StylistLevel { get; set; }
    public decimal? BasePrice { get; set; }
    public Dictionary<string, decimal>? PriceBySize { get; set; }
    public int? DurationMinutes { get; set; }
    public string? ImageUrl { get; set; }
    public List<string> GalleryUrls { get; set; } = [];
    public string? VideoUrl { get; set; }
    public bool IsActive { get; set; } = true;

    public decimal ResolvePrice(HairSize? size)
    {
        if (BasePrice.HasValue)
            return BasePrice.Value;

        if (PriceBySize is null || PriceBySize.Count == 0)
            throw new Exceptions.DomainException($"Service '{Name}' has no pricing configured.");

        var key = (size ?? HairSize.M).ToString();
        if (PriceBySize.TryGetValue(key, out var price))
            return price;

        throw new Exceptions.DomainException($"No price for size {key} on service '{Name}'.");
    }
}
