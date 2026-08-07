using TrangTranHair.Application.Interfaces;
using TrangTranHair.Application.Seed;

namespace TrangTranHair.Application.Services;

public sealed class DataSeedService(
    IServiceRepository serviceRepository,
    IProductRepository productRepository,
    IPromotionRepository promotionRepository) : IDataSeedService
{
    public async Task<SeedResult> SeedAsync(bool force = false, CancellationToken cancellationToken = default)
    {
        var existingServices = await serviceRepository.GetAllAsync(cancellationToken);
        var existingProducts = await productRepository.GetAllAsync(cancellationToken);
        var existingPromotions = await promotionRepository.GetAllAsync(cancellationToken);

        if (!force && existingServices.Count > 0 && existingProducts.Count > 0 && existingPromotions.Count > 0)
            return new SeedResult(0, 0, 0, Skipped: true);

        if (force)
        {
            foreach (var s in existingServices)
                await serviceRepository.DeleteAsync(s.Id, cancellationToken);
            foreach (var p in existingProducts)
                await productRepository.DeleteAsync(p.Id, cancellationToken);
            foreach (var promo in existingPromotions)
                await promotionRepository.DeleteAsync(promo.Id, cancellationToken);
        }

        var services = SalonSeedData.GetServices();
        var products = SalonSeedData.GetProducts();
        var promotions = SalonSeedData.GetPromotions();

        foreach (var service in services)
            await serviceRepository.CreateAsync(service, cancellationToken);

        foreach (var product in products)
            await productRepository.CreateAsync(product, cancellationToken);

        foreach (var promotion in promotions)
            await promotionRepository.CreateAsync(promotion, cancellationToken);

        return new SeedResult(services.Count, products.Count, promotions.Count, Skipped: false);
    }
}
