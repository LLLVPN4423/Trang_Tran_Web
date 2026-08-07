using Google.Cloud.Firestore;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Infrastructure.Persistence.Firestore;

public sealed class FirestorePromotionRepository(FirestoreDb db) : IPromotionRepository
{
    private CollectionReference Collection => db.Collection("promotions");

    public async Task<Promotion?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var doc = await Collection.Document(id).GetSnapshotAsync(cancellationToken);
        return doc.Exists ? MapFrom(doc.ConvertTo<PromotionDocument>()) : null;
    }

    public async Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var query = Collection.WhereEqualTo("Code", code.ToUpperInvariant()).Limit(1);
        var snapshot = await query.GetSnapshotAsync(cancellationToken);
        var doc = snapshot.Documents.FirstOrDefault();
        return doc is null ? null : MapFrom(doc.ConvertTo<PromotionDocument>());
    }

    public async Task<IReadOnlyList<Promotion>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var snapshot = await Collection.GetSnapshotAsync(cancellationToken);
        return snapshot.Documents
            .Select(d => MapFrom(d.ConvertTo<PromotionDocument>()))
            .OrderBy(p => p.Code)
            .ToList();
    }

    public async Task<Promotion> CreateAsync(Promotion promotion, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(promotion.Id))
            promotion.Id = Guid.NewGuid().ToString();

        promotion.Code = promotion.Code.ToUpperInvariant();
        promotion.CreatedAt = DateTime.UtcNow;
        await Collection.Document(promotion.Id).SetAsync(MapTo(promotion), cancellationToken: cancellationToken);
        return promotion;
    }

    public async Task<Promotion> UpdateAsync(Promotion promotion, CancellationToken cancellationToken = default)
    {
        promotion.UpdatedAt = DateTime.UtcNow;
        await Collection.Document(promotion.Id).SetAsync(MapTo(promotion), cancellationToken: cancellationToken);
        return promotion;
    }

    public Task DeleteAsync(string id, CancellationToken cancellationToken = default) =>
        Collection.Document(id).DeleteAsync(cancellationToken: cancellationToken);

    private static Promotion MapFrom(PromotionDocument doc) =>
        new()
        {
            Id = doc.Id,
            Code = doc.Code,
            Name = doc.Name,
            Description = doc.Description,
            Type = Enum.Parse<PromotionType>(doc.Type),
            Value = (decimal)doc.Value,
            MinOrderAmount = (decimal)doc.MinOrderAmount,
            MaxUses = doc.MaxUses,
            UsedCount = doc.UsedCount,
            ExpiresAt = doc.ExpiresAt is null ? null : FirestoreMapper.FromTimestamp(doc.ExpiresAt),
            IsActive = doc.IsActive,
            CreatedAt = FirestoreMapper.FromTimestamp(doc.CreatedAt),
            UpdatedAt = FirestoreMapper.FromTimestamp(doc.UpdatedAt),
        };

    private static PromotionDocument MapTo(Promotion promotion) =>
        new()
        {
            Id = promotion.Id,
            Code = promotion.Code,
            Name = promotion.Name,
            Description = promotion.Description,
            Type = promotion.Type.ToString(),
            Value = (double)promotion.Value,
            MinOrderAmount = (double)promotion.MinOrderAmount,
            MaxUses = promotion.MaxUses,
            UsedCount = promotion.UsedCount,
            ExpiresAt = promotion.ExpiresAt is null ? null : FirestoreMapper.ToTimestamp(promotion.ExpiresAt.Value),
            IsActive = promotion.IsActive,
            CreatedAt = FirestoreMapper.ToTimestamp(promotion.CreatedAt),
            UpdatedAt = promotion.UpdatedAt is null ? null : FirestoreMapper.ToTimestamp(promotion.UpdatedAt.Value),
        };
}

[FirestoreData]
internal sealed class PromotionDocument
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Code { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? Description { get; set; }

    [FirestoreProperty]
    public string Type { get; set; } = PromotionType.Percentage.ToString();

    [FirestoreProperty]
    public double Value { get; set; }

    [FirestoreProperty]
    public double MinOrderAmount { get; set; }

    [FirestoreProperty]
    public int? MaxUses { get; set; }

    [FirestoreProperty]
    public int UsedCount { get; set; }

    [FirestoreProperty]
    public Timestamp? ExpiresAt { get; set; }

    [FirestoreProperty]
    public bool IsActive { get; set; } = true;

    [FirestoreProperty]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty]
    public Timestamp? UpdatedAt { get; set; }
}
