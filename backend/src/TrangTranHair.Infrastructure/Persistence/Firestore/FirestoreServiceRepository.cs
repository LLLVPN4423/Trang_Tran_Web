using Google.Cloud.Firestore;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Infrastructure.Persistence.Firestore;

public sealed class FirestoreServiceRepository(FirestoreDb db) : IServiceRepository
{
    private CollectionReference Collection => db.Collection("services");

    public async Task<IReadOnlyList<Service>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var snapshot = await Collection.GetSnapshotAsync(cancellationToken);
        return snapshot.Documents
            .Select(d => MapFromDocument(d.ConvertTo<ServiceDocument>()))
            .OrderBy(s => s.Name)
            .ToList();
    }

    public async Task<Service?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var doc = await Collection.Document(id).GetSnapshotAsync(cancellationToken);
        return doc.Exists ? MapFromDocument(doc.ConvertTo<ServiceDocument>()) : null;
    }

    public async Task<Service> CreateAsync(Service service, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(service.Id))
            service.Id = Guid.NewGuid().ToString();

        service.CreatedAt = DateTime.UtcNow;
        await Collection.Document(service.Id).SetAsync(MapToDocument(service), cancellationToken: cancellationToken);
        return service;
    }

    public async Task<Service> UpdateAsync(Service service, CancellationToken cancellationToken = default)
    {
        service.UpdatedAt = DateTime.UtcNow;
        await Collection.Document(service.Id).SetAsync(MapToDocument(service), cancellationToken: cancellationToken);
        return service;
    }

    public Task DeleteAsync(string id, CancellationToken cancellationToken = default) =>
        Collection.Document(id).DeleteAsync(cancellationToken: cancellationToken);

    private static Service MapFromDocument(ServiceDocument doc) =>
        new()
        {
            Id = doc.Id,
            Name = doc.Name,
            Description = doc.Description,
            Category = Enum.Parse<ServiceCategory>(doc.Category),
            StylistLevel = doc.StylistLevel is null ? null : Enum.Parse<StylistLevel>(doc.StylistLevel),
            BasePrice = doc.BasePrice is null ? null : (decimal)doc.BasePrice,
            PriceBySize = FirestoreMapper.ToDecimalDict(doc.PriceBySize),
            DurationMinutes = doc.DurationMinutes,
            IsActive = doc.IsActive,
            CreatedAt = FirestoreMapper.FromTimestamp(doc.CreatedAt),
            UpdatedAt = FirestoreMapper.FromTimestamp(doc.UpdatedAt)
        };

    private static ServiceDocument MapToDocument(Service service) =>
        new()
        {
            Id = service.Id,
            Name = service.Name,
            Description = service.Description,
            Category = service.Category.ToString(),
            StylistLevel = service.StylistLevel?.ToString(),
            BasePrice = service.BasePrice is null ? null : (double)service.BasePrice,
            PriceBySize = FirestoreMapper.ToDoubleDict(service.PriceBySize),
            DurationMinutes = service.DurationMinutes,
            IsActive = service.IsActive,
            CreatedAt = FirestoreMapper.ToTimestamp(service.CreatedAt),
            UpdatedAt = service.UpdatedAt is null ? null : FirestoreMapper.ToTimestamp(service.UpdatedAt.Value)
        };
}

[FirestoreData]
internal sealed class ServiceDocument
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? Description { get; set; }

    [FirestoreProperty]
    public string Category { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? StylistLevel { get; set; }

    [FirestoreProperty]
    public double? BasePrice { get; set; }

    [FirestoreProperty]
    public Dictionary<string, double>? PriceBySize { get; set; }

    [FirestoreProperty]
    public int? DurationMinutes { get; set; }

    [FirestoreProperty]
    public bool IsActive { get; set; } = true;

    [FirestoreProperty]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty]
    public Timestamp? UpdatedAt { get; set; }
}
