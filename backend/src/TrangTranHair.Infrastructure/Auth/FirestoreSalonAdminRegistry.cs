using Google.Cloud.Firestore;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Infrastructure.Auth;

public sealed class FirestoreSalonAdminRegistry(FirestoreDb db) : ISalonAdminRegistry
{
    private const string Collection = "systemConfig";
    private const string DocumentId = "salonAdminUids";

    private DocumentReference Doc => db.Collection(Collection).Document(DocumentId);

    public async Task<IReadOnlyList<string>> ListAsync(CancellationToken cancellationToken = default)
    {
        var snap = await Doc.GetSnapshotAsync(cancellationToken);
        if (!snap.Exists) return [];
        if (!snap.TryGetValue("uids", out IEnumerable<object> raw) || raw is null) return [];
        return raw.Select(x => x?.ToString()?.Trim()).Where(x => !string.IsNullOrEmpty(x)).Cast<string>().Distinct().ToList();
    }

    public async Task<bool> ContainsAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId)) return false;
        var list = await ListAsync(cancellationToken);
        return list.Contains(userId.Trim(), StringComparer.Ordinal);
    }

    public async Task AddAsync(string userId, CancellationToken cancellationToken = default)
    {
        var uid = userId.Trim();
        var list = (await ListAsync(cancellationToken)).ToList();
        if (!list.Contains(uid, StringComparer.Ordinal)) list.Add(uid);
        await Doc.SetAsync(new Dictionary<string, object> { ["uids"] = list, ["updatedAt"] = Timestamp.GetCurrentTimestamp() },
            cancellationToken: cancellationToken);
    }

    public async Task RemoveAsync(string userId, CancellationToken cancellationToken = default)
    {
        var uid = userId.Trim();
        var list = (await ListAsync(cancellationToken)).Where(x => !x.Equals(uid, StringComparison.Ordinal)).ToList();
        await Doc.SetAsync(new Dictionary<string, object> { ["uids"] = list, ["updatedAt"] = Timestamp.GetCurrentTimestamp() },
            cancellationToken: cancellationToken);
    }
}
