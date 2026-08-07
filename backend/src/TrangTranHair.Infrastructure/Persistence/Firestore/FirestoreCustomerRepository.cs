using Google.Cloud.Firestore;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;

namespace TrangTranHair.Infrastructure.Persistence.Firestore;

public sealed class FirestoreCustomerRepository(FirestoreDb db) : ICustomerRepository
{
    private CollectionReference Collection => db.Collection("customers");

    public async Task<Customer?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var doc = await Collection.Document(id).GetSnapshotAsync(cancellationToken);
        return doc.Exists ? MapFrom(doc.ConvertTo<CustomerDocument>()) : null;
    }

    public async Task<Customer?> GetByFirebaseUidAsync(string firebaseUid, CancellationToken cancellationToken = default)
    {
        var query = Collection.WhereEqualTo("FirebaseUid", firebaseUid).Limit(1);
        var snapshot = await query.GetSnapshotAsync(cancellationToken);
        var doc = snapshot.Documents.FirstOrDefault();
        return doc is null ? null : MapFrom(doc.ConvertTo<CustomerDocument>());
    }

    public async Task<Customer> CreateAsync(Customer customer, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(customer.Id))
            customer.Id = customer.FirebaseUid;

        customer.CreatedAt = DateTime.UtcNow;
        await Collection.Document(customer.Id).SetAsync(MapTo(customer), cancellationToken: cancellationToken);
        return customer;
    }

    public async Task<Customer> UpdateAsync(Customer customer, CancellationToken cancellationToken = default)
    {
        customer.UpdatedAt = DateTime.UtcNow;
        await Collection.Document(customer.Id).SetAsync(MapTo(customer), cancellationToken: cancellationToken);
        return customer;
    }

    public async Task<IReadOnlyList<Customer>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var snapshot = await Collection.GetSnapshotAsync(cancellationToken);
        return snapshot.Documents
            .Select(d => MapFrom(d.ConvertTo<CustomerDocument>()))
            .OrderBy(c => c.Name)
            .ToList();
    }

    private static Customer MapFrom(CustomerDocument doc) =>
        new()
        {
            Id = doc.Id,
            FirebaseUid = doc.FirebaseUid,
            Name = doc.Name,
            Phone = doc.Phone,
            Email = doc.Email,
            LoyaltyPoints = doc.LoyaltyPoints,
            TotalSpent = (decimal)doc.TotalSpent,
            CreatedAt = FirestoreMapper.FromTimestamp(doc.CreatedAt),
            UpdatedAt = FirestoreMapper.FromTimestamp(doc.UpdatedAt),
        };

    private static CustomerDocument MapTo(Customer customer) =>
        new()
        {
            Id = customer.Id,
            FirebaseUid = customer.FirebaseUid,
            Name = customer.Name,
            Phone = customer.Phone,
            Email = customer.Email,
            LoyaltyPoints = customer.LoyaltyPoints,
            TotalSpent = (double)customer.TotalSpent,
            CreatedAt = FirestoreMapper.ToTimestamp(customer.CreatedAt),
            UpdatedAt = customer.UpdatedAt is null ? null : FirestoreMapper.ToTimestamp(customer.UpdatedAt.Value),
        };
}

[FirestoreData]
internal sealed class CustomerDocument
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty]
    public string FirebaseUid { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Name { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Phone { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? Email { get; set; }

    [FirestoreProperty]
    public int LoyaltyPoints { get; set; }

    [FirestoreProperty]
    public double TotalSpent { get; set; }

    [FirestoreProperty]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty]
    public Timestamp? UpdatedAt { get; set; }
}
