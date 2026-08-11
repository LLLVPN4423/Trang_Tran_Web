using TrangTranHair.Application.DTOs;
using TrangTranHair.Domain.Entities;

namespace TrangTranHair.Application.Mappings;

public static class EntityMapper
{
    public static ServiceResponse ToResponse(this Service service)
    {
        var gallery = ProductMediaHelper.NormalizeGallery(service.ImageUrl, service.GalleryUrls);
        return new(
            service.Id,
            service.Name,
            service.Description,
            service.Category,
            service.StylistLevel,
            service.BasePrice,
            service.PriceBySize,
            service.DurationMinutes,
            gallery.FirstOrDefault(),
            gallery,
            ProductMediaHelper.NormalizeVideoUrl(service.VideoUrl),
            service.IsActive);
    }

    public static ProductResponse ToResponse(this Product product)
    {
        var gallery = ProductMediaHelper.NormalizeGallery(product.ImageUrl, product.GalleryUrls);
        return new(
            product.Id,
            product.Name,
            product.Description,
            product.Brand,
            product.Price,
            product.Stock,
            gallery.FirstOrDefault(),
            gallery,
            product.VideoUrl,
            product.IsActive);
    }

    public static Service ToEntity(this CreateServiceRequest request)
    {
        var gallery = ProductMediaHelper.NormalizeGallery(request.ImageUrl, request.GalleryUrls);
        return new()
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Category = request.Category,
            StylistLevel = request.StylistLevel,
            BasePrice = request.BasePrice,
            PriceBySize = request.PriceBySize,
            DurationMinutes = request.DurationMinutes,
            ImageUrl = gallery.FirstOrDefault(),
            GalleryUrls = gallery,
            VideoUrl = ProductMediaHelper.NormalizeVideoUrl(request.VideoUrl),
            IsActive = request.IsActive,
        };
    }

    public static void ApplyUpdate(this Service service, UpdateServiceRequest request)
    {
        var gallery = ProductMediaHelper.NormalizeGallery(request.ImageUrl, request.GalleryUrls);
        service.Name = request.Name.Trim();
        service.Description = request.Description?.Trim();
        service.Category = request.Category;
        service.StylistLevel = request.StylistLevel;
        service.BasePrice = request.BasePrice;
        service.PriceBySize = request.PriceBySize;
        service.DurationMinutes = request.DurationMinutes;
        service.ImageUrl = gallery.FirstOrDefault();
        service.GalleryUrls = gallery;
        service.VideoUrl = ProductMediaHelper.NormalizeVideoUrl(request.VideoUrl);
        service.IsActive = request.IsActive;
        service.UpdatedAt = DateTime.UtcNow;
    }

    public static Product ToEntity(this CreateProductRequest request)
    {
        var gallery = ProductMediaHelper.NormalizeGallery(request.ImageUrl, request.GalleryUrls);
        return new()
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Brand = request.Brand.Trim(),
            Price = request.Price,
            Stock = request.Stock,
            ImageUrl = gallery.FirstOrDefault(),
            GalleryUrls = gallery,
            VideoUrl = ProductMediaHelper.NormalizeVideoUrl(request.VideoUrl),
            IsActive = request.IsActive,
        };
    }

    public static void ApplyUpdate(this Product product, UpdateProductRequest request)
    {
        var gallery = ProductMediaHelper.NormalizeGallery(request.ImageUrl, request.GalleryUrls);
        product.Name = request.Name.Trim();
        product.Description = request.Description?.Trim();
        product.Brand = request.Brand.Trim();
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.ImageUrl = gallery.FirstOrDefault();
        product.GalleryUrls = gallery;
        product.VideoUrl = ProductMediaHelper.NormalizeVideoUrl(request.VideoUrl);
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;
    }
}
