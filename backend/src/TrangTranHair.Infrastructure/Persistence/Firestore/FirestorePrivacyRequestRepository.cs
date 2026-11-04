using Google.Cloud.Firestore;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Infrastructure.Persistence.Firestore;

public sealed class FirestorePrivacyRequestRepository(FirestoreDb db) : IPrivacyRequestRepository
{
    private CollectionReference Collection => db.Collection("privacyRequests");

    public async Task<PrivacyRequest?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var doc = await Collection.Document(id).GetSnapshotAsync(cancellationToken);
        return doc.Exists ? MapFrom(doc.ConvertTo<PrivacyRequestDocument>()) : null;
    }

    public async Task<IReadOnlyList<PrivacyRequest>> GetByCustomerFirebaseUidAsync(
        string firebaseUid,
        CancellationToken cancellationToken = default)
    {
        var snapshot = await Collection
            .WhereEqualTo("CustomerFirebaseUid", firebaseUid)
            .GetSnapshotAsync(cancellationToken);

        return snapshot.Documents
            .Select(d => MapFrom(d.ConvertTo<PrivacyRequestDocument>()))
            .OrderByDescending(r => r.CreatedAt)
            .ToList();
    }

    public async Task<IReadOnlyList<PrivacyRequest>> ListAsync(
        PrivacyRequestType? type = null,
        PrivacyRequestStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        // Prefer a single equality filter to avoid requiring a composite index.
        Query query = Collection;
        if (status is not null)
            query = query.WhereEqualTo("Status", status.ToString());
        else if (type is not null)
            query = query.WhereEqualTo("Type", type.ToString());

        var snapshot = await query.GetSnapshotAsync(cancellationToken);
        IEnumerable<PrivacyRequest> items = snapshot.Documents
            .Select(d => MapFrom(d.ConvertTo<PrivacyRequestDocument>()));

        if (status is not null && type is not null)
            items = items.Where(r => r.Type == type);

        return items.OrderByDescending(r => r.CreatedAt).ToList();
    }

    public async Task<PrivacyRequest> CreateAsync(PrivacyRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Id))
            request.Id = Guid.NewGuid().ToString();

        request.CreatedAt = DateTime.UtcNow;
        await Collection.Document(request.Id).SetAsync(MapTo(request), cancellationToken: cancellationToken);
        return request;
    }

    public async Task<PrivacyRequest> UpdateAsync(PrivacyRequest request, CancellationToken cancellationToken = default)
    {
        request.UpdatedAt = DateTime.UtcNow;
        await Collection.Document(request.Id).SetAsync(MapTo(request), cancellationToken: cancellationToken);
        return request;
    }

    private static PrivacyRequest MapFrom(PrivacyRequestDocument doc) =>
        new()
        {
            Id = doc.Id,
            CustomerFirebaseUid = doc.CustomerFirebaseUid,
            CustomerId = doc.CustomerId,
            CustomerNameSnapshot = doc.CustomerNameSnapshot,
            CustomerEmailSnapshot = doc.CustomerEmailSnapshot,
            CustomerPhoneSnapshot = doc.CustomerPhoneSnapshot,
            Type = Enum.Parse<PrivacyRequestType>(doc.Type),
            Description = doc.Description,
            Status = Enum.Parse<PrivacyRequestStatus>(doc.Status),
            CustomerVisibleResult = doc.CustomerVisibleResult,
            InternalNotes = doc.InternalNotes,
            AssignedAdminUid = doc.AssignedAdminUid,
            CreatedAt = FirestoreMapper.FromTimestamp(doc.CreatedAt),
            UpdatedAt = FirestoreMapper.FromTimestamp(doc.UpdatedAt),
            History = (doc.History ?? [])
                .Select(h => new PrivacyRequestHistoryEntry
                {
                    At = FirestoreMapper.FromTimestamp(h.At),
                    ActorUid = h.ActorUid,
                    ActorRole = h.ActorRole,
                    FromStatus = string.IsNullOrWhiteSpace(h.FromStatus)
                        ? null
                        : Enum.Parse<PrivacyRequestStatus>(h.FromStatus),
                    ToStatus = Enum.Parse<PrivacyRequestStatus>(h.ToStatus),
                    CustomerVisibleNote = h.CustomerVisibleNote,
                    InternalNote = h.InternalNote,
                })
                .ToList(),
        };

    private static PrivacyRequestDocument MapTo(PrivacyRequest request) =>
        new()
        {
            Id = request.Id,
            CustomerFirebaseUid = request.CustomerFirebaseUid,
            CustomerId = request.CustomerId,
            CustomerNameSnapshot = request.CustomerNameSnapshot,
            CustomerEmailSnapshot = request.CustomerEmailSnapshot,
            CustomerPhoneSnapshot = request.CustomerPhoneSnapshot,
            Type = request.Type.ToString(),
            Description = request.Description,
            Status = request.Status.ToString(),
            CustomerVisibleResult = request.CustomerVisibleResult,
            InternalNotes = request.InternalNotes,
            AssignedAdminUid = request.AssignedAdminUid,
            CreatedAt = FirestoreMapper.ToTimestamp(request.CreatedAt),
            UpdatedAt = request.UpdatedAt is null ? null : FirestoreMapper.ToTimestamp(request.UpdatedAt.Value),
            History = request.History
                .Select(h => new PrivacyRequestHistoryDocument
                {
                    At = FirestoreMapper.ToTimestamp(h.At),
                    ActorUid = h.ActorUid,
                    ActorRole = h.ActorRole,
                    FromStatus = h.FromStatus?.ToString(),
                    ToStatus = h.ToStatus.ToString(),
                    CustomerVisibleNote = h.CustomerVisibleNote,
                    InternalNote = h.InternalNote,
                })
                .ToList(),
        };
}

[FirestoreData]
internal sealed class PrivacyRequestDocument
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty]
    public string CustomerFirebaseUid { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? CustomerId { get; set; }

    [FirestoreProperty]
    public string? CustomerNameSnapshot { get; set; }

    [FirestoreProperty]
    public string? CustomerEmailSnapshot { get; set; }

    [FirestoreProperty]
    public string? CustomerPhoneSnapshot { get; set; }

    [FirestoreProperty]
    public string Type { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Description { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Status { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? CustomerVisibleResult { get; set; }

    [FirestoreProperty]
    public string? InternalNotes { get; set; }

    [FirestoreProperty]
    public string? AssignedAdminUid { get; set; }

    [FirestoreProperty]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty]
    public Timestamp? UpdatedAt { get; set; }

    [FirestoreProperty]
    public List<PrivacyRequestHistoryDocument>? History { get; set; }
}

[FirestoreData]
internal sealed class PrivacyRequestHistoryDocument
{
    [FirestoreProperty]
    public Timestamp At { get; set; }

    [FirestoreProperty]
    public string ActorUid { get; set; } = string.Empty;

    [FirestoreProperty]
    public string ActorRole { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? FromStatus { get; set; }

    [FirestoreProperty]
    public string ToStatus { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? CustomerVisibleNote { get; set; }

    [FirestoreProperty]
    public string? InternalNote { get; set; }
}
