using Google.Cloud.Firestore;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Infrastructure.Persistence.Firestore;

public sealed class FirestoreLoyaltyRepository(FirestoreDb db) : ILoyaltyRepository
{
    private CollectionReference Collection => db.Collection("loyaltyTransactions");

    public async Task<IReadOnlyList<LoyaltyTransaction>> GetByCustomerIdAsync(string customerId, CancellationToken cancellationToken = default)
    {
        var query = Collection.WhereEqualTo("CustomerId", customerId);
        var snapshot = await query.GetSnapshotAsync(cancellationToken);
        return snapshot.Documents
            .Select(d => MapFrom(d.ConvertTo<LoyaltyTransactionDocument>()))
            .OrderByDescending(t => t.CreatedAt)
            .ToList();
    }

    public async Task<LoyaltyTransaction?> GetEarnByOrderIdAsync(string orderId, CancellationToken cancellationToken = default)
    {
        var query = Collection
            .WhereEqualTo("OrderId", orderId)
            .WhereEqualTo("Type", LoyaltyTransactionType.Earn.ToString())
            .Limit(1);
        var snapshot = await query.GetSnapshotAsync(cancellationToken);
        var doc = snapshot.Documents.FirstOrDefault();
        return doc is null ? null : MapFrom(doc.ConvertTo<LoyaltyTransactionDocument>());
    }

    public async Task<LoyaltyTransaction> CreateAsync(LoyaltyTransaction transaction, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(transaction.Id))
            transaction.Id = Guid.NewGuid().ToString();

        transaction.CreatedAt = DateTime.UtcNow;
        await Collection.Document(transaction.Id).SetAsync(MapTo(transaction), cancellationToken: cancellationToken);
        return transaction;
    }

    private static LoyaltyTransaction MapFrom(LoyaltyTransactionDocument doc) =>
        new()
        {
            Id = doc.Id,
            CustomerId = doc.CustomerId,
            OrderId = doc.OrderId,
            Type = Enum.Parse<LoyaltyTransactionType>(doc.Type),
            Points = doc.Points,
            Description = doc.Description,
            CreatedAt = FirestoreMapper.FromTimestamp(doc.CreatedAt),
            UpdatedAt = FirestoreMapper.FromTimestamp(doc.UpdatedAt),
        };

    private static LoyaltyTransactionDocument MapTo(LoyaltyTransaction transaction) =>
        new()
        {
            Id = transaction.Id,
            CustomerId = transaction.CustomerId,
            OrderId = transaction.OrderId,
            Type = transaction.Type.ToString(),
            Points = transaction.Points,
            Description = transaction.Description,
            CreatedAt = FirestoreMapper.ToTimestamp(transaction.CreatedAt),
            UpdatedAt = transaction.UpdatedAt is null ? null : FirestoreMapper.ToTimestamp(transaction.UpdatedAt.Value),
        };
}

[FirestoreData]
internal sealed class LoyaltyTransactionDocument
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty]
    public string CustomerId { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? OrderId { get; set; }

    [FirestoreProperty]
    public string Type { get; set; } = LoyaltyTransactionType.Earn.ToString();

    [FirestoreProperty]
    public int Points { get; set; }

    [FirestoreProperty]
    public string Description { get; set; } = string.Empty;

    [FirestoreProperty]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty]
    public Timestamp? UpdatedAt { get; set; }
}
