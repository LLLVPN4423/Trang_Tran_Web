namespace TrangTranHair.Application.Interfaces;

public interface IDataSeedService
{
    Task<SeedResult> SeedAsync(bool force = false, CancellationToken cancellationToken = default);
}

public sealed record SeedResult(int ServicesSeeded, int ProductsSeeded, int PromotionsSeeded, bool Skipped);
