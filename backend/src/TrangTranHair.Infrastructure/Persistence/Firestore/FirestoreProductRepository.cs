using Google.Cloud.Firestore;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;

namespace TrangTranHair.Infrastructure.Persistence.Firestore;

public sealed class FirestoreProductRepository(FirestoreDb db) : IProductRepository
{
    private CollectionReference Collection => db.Collection("products");

    public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var snapshot = await Collection.GetSnapshotAsync(cancellationToken);
        return snapshot.Documents
            .Select(d => MapFromDocument(d.ConvertTo<ProductDocument>()))
            .OrderBy(p => p.Name)
            .ToList();
    }

    public async Task<Product?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var doc = await Collection.Document(id).GetSnapshotAsync(cancellationToken);
        return doc.Exists ? MapFromDocument(doc.ConvertTo<ProductDocument>()) : null;
    }

    public async Task<Product> CreateAsync(Product product, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(product.Id))
            product.Id = Guid.NewGuid().ToString();

        product.CreatedAt = DateTime.UtcNow;
        await Collection.Document(product.Id).SetAsync(MapToDocument(product), cancellationToken: cancellationToken);
        return product;
    }

    public async Task<Product> UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        product.UpdatedAt = DateTime.UtcNow;
        await Collection.Document(product.Id).SetAsync(MapToDocument(product), cancellationToken: cancellationToken);
        return product;
    }

    public Task DeleteAsync(string id, CancellationToken cancellationToken = default) =>
        Collection.Document(id).DeleteAsync(cancellationToken: cancellationToken);

    private static Product MapFromDocument(ProductDocument doc) =>
        new()
        {
            Id = doc.Id,
            Name = doc.Name,
            Description = doc.Description,
            Brand = doc.Brand,
            Price = (decimal)doc.Price,
            Stock = doc.Stock,
            ImageUrl = doc.ImageUrl,
            IsActive = doc.IsActive,
            CreatedAt = FirestoreMapper.FromTimestamp(doc.CreatedAt),
            UpdatedAt = FirestoreMapper.FromTimestamp(doc.UpdatedAt)
        };

    private static ProductDocument MapToDocument(Product product) =>
        new()
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Brand = product.Brand,
            Price = (double)product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive,
            CreatedAt = FirestoreMapper.ToTimestamp(product.CreatedAt),
            UpdatedAt = product.UpdatedAt is null ? null : FirestoreMapper.ToTimestamp(product.UpdatedAt.Value)
        };
}

[FirestoreData]
internal sealed class ProductDocument
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? Description { get; set; }

    [FirestoreProperty]
    public string Brand { get; set; } = "Moroccanoil";

    [FirestoreProperty]
    public double Price { get; set; }

    [FirestoreProperty]
    public int Stock { get; set; }

    [FirestoreProperty]
    public string? ImageUrl { get; set; }

    [FirestoreProperty]
    public bool IsActive { get; set; } = true;

    [FirestoreProperty]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty]
    public Timestamp? UpdatedAt { get; set; }
}
