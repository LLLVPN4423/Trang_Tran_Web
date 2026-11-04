using System.Collections.Concurrent;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Infrastructure.Persistence.InMemory;

public sealed class InMemoryPrivacyRequestRepository : IPrivacyRequestRepository
{
    private readonly ConcurrentDictionary<string, PrivacyRequest> _store = new();

    public Task<PrivacyRequest?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        _store.TryGetValue(id, out var item);
        return Task.FromResult(Clone(item));
    }

    public Task<IReadOnlyList<PrivacyRequest>> GetByCustomerFirebaseUidAsync(
        string firebaseUid,
        CancellationToken cancellationToken = default)
    {
        var items = _store.Values
            .Where(r => r.CustomerFirebaseUid == firebaseUid)
            .OrderByDescending(r => r.CreatedAt)
            .Select(Clone)
            .Where(r => r is not null)
            .Cast<PrivacyRequest>()
            .ToList();

        return Task.FromResult<IReadOnlyList<PrivacyRequest>>(items);
    }

    public Task<IReadOnlyList<PrivacyRequest>> ListAsync(
        PrivacyRequestType? type = null,
        PrivacyRequestStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<PrivacyRequest> query = _store.Values;
        if (type is not null)
            query = query.Where(r => r.Type == type);
        if (status is not null)
            query = query.Where(r => r.Status == status);

        var items = query
            .OrderByDescending(r => r.CreatedAt)
            .Select(Clone)
            .Where(r => r is not null)
            .Cast<PrivacyRequest>()
            .ToList();

        return Task.FromResult<IReadOnlyList<PrivacyRequest>>(items);
    }

    public Task<PrivacyRequest> CreateAsync(PrivacyRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Id))
            request.Id = Guid.NewGuid().ToString();

        request.CreatedAt = DateTime.UtcNow;
        _store[request.Id] = Clone(request)!;
        return Task.FromResult(Clone(request)!);
    }

    public Task<PrivacyRequest> UpdateAsync(PrivacyRequest request, CancellationToken cancellationToken = default)
    {
        request.UpdatedAt = DateTime.UtcNow;
        _store[request.Id] = Clone(request)!;
        return Task.FromResult(Clone(request)!);
    }

    private static PrivacyRequest? Clone(PrivacyRequest? source)
    {
        if (source is null)
            return null;

        return new PrivacyRequest
        {
            Id = source.Id,
            CreatedAt = source.CreatedAt,
            UpdatedAt = source.UpdatedAt,
            CustomerFirebaseUid = source.CustomerFirebaseUid,
            CustomerId = source.CustomerId,
            CustomerNameSnapshot = source.CustomerNameSnapshot,
            CustomerEmailSnapshot = source.CustomerEmailSnapshot,
            CustomerPhoneSnapshot = source.CustomerPhoneSnapshot,
            Type = source.Type,
            Description = source.Description,
            Status = source.Status,
            CustomerVisibleResult = source.CustomerVisibleResult,
            InternalNotes = source.InternalNotes,
            AssignedAdminUid = source.AssignedAdminUid,
            History = source.History
                .Select(h => new PrivacyRequestHistoryEntry
                {
                    At = h.At,
                    ActorUid = h.ActorUid,
                    ActorRole = h.ActorRole,
                    FromStatus = h.FromStatus,
                    ToStatus = h.ToStatus,
                    CustomerVisibleNote = h.CustomerVisibleNote,
                    InternalNote = h.InternalNote,
                })
                .ToList(),
        };
    }
}
