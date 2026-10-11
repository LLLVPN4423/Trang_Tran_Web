using System.Collections.Concurrent;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Infrastructure.Auth;

/** Chỉ dùng khi API chạy in-memory — grant mất khi restart. */
public sealed class InMemorySalonAdminRegistry : ISalonAdminRegistry
{
    private readonly ConcurrentDictionary<string, byte> _uids = new(StringComparer.Ordinal);

    public Task<IReadOnlyList<string>> ListAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult<IReadOnlyList<string>>(_uids.Keys.ToList());

    public Task<bool> ContainsAsync(string userId, CancellationToken cancellationToken = default) =>
        Task.FromResult(!string.IsNullOrWhiteSpace(userId) && _uids.ContainsKey(userId.Trim()));

    public Task AddAsync(string userId, CancellationToken cancellationToken = default)
    {
        _uids[userId.Trim()] = 0;
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string userId, CancellationToken cancellationToken = default)
    {
        _uids.TryRemove(userId.Trim(), out _);
        return Task.CompletedTask;
    }
}
