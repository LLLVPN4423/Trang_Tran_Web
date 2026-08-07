using TrangTranHair.Application.DTOs;
using TrangTranHair.Domain.Entities;

namespace TrangTranHair.Application.Mappings;

public static class EntityMapper
{
    public static ServiceResponse ToResponse(this Service service) =>
        new(
            service.Id,
            service.Name,
            service.Description,
            service.Category,
            service.StylistLevel,
            service.BasePrice,
            service.PriceBySize,
            service.DurationMinutes,
            service.IsActive);

    public static ProductResponse ToResponse(this Product product) =>
        new(
            product.Id,
            product.Name,
            product.Description,
            product.Brand,
            product.Price,
            product.Stock,
            product.ImageUrl,
            product.IsActive);

    public static Service ToEntity(this CreateServiceRequest request) =>
        new()
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Category = request.Category,
            StylistLevel = request.StylistLevel,
            BasePrice = request.BasePrice,
            PriceBySize = request.PriceBySize,
            DurationMinutes = request.DurationMinutes,
            IsActive = request.IsActive
        };

    public static void ApplyUpdate(this Service service, UpdateServiceRequest request)
    {
        service.Name = request.Name.Trim();
        service.Description = request.Description?.Trim();
        service.Category = request.Category;
        service.StylistLevel = request.StylistLevel;
        service.BasePrice = request.BasePrice;
        service.PriceBySize = request.PriceBySize;
        service.DurationMinutes = request.DurationMinutes;
        service.IsActive = request.IsActive;
        service.UpdatedAt = DateTime.UtcNow;
    }

    public static Product ToEntity(this CreateProductRequest request) =>
        new()
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Brand = request.Brand.Trim(),
            Price = request.Price,
            Stock = request.Stock,
            ImageUrl = request.ImageUrl,
            IsActive = request.IsActive
        };

    public static void ApplyUpdate(this Product product, UpdateProductRequest request)
    {
        product.Name = request.Name.Trim();
        product.Description = request.Description?.Trim();
        product.Brand = request.Brand.Trim();
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.ImageUrl = request.ImageUrl;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;
    }
}
