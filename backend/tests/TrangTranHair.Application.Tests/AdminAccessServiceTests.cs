using System.Security.Claims;
using Microsoft.Extensions.Logging.Abstractions;
using TrangTranHair.Application.Authorization;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Infrastructure.Auth;
using Xunit;

namespace TrangTranHair.Application.Tests;

public sealed class AdminAccessServiceTests
{
    private sealed class FakeRoleAllowlist : IAdminRoleAllowlist, IAdminAllowlist
    {
        public FakeRoleAllowlist(string platform, string salon)
        {
            PlatformUids = [platform];
            SalonUids = [salon];
        }

        public IReadOnlyList<string> PlatformUids { get; }
        public IReadOnlyList<string> SalonUids { get; }
        public IReadOnlyList<string> AllowedUids => PlatformUids;
        public bool IsConfigured => true;
        public bool Contains(string userId) => IsPlatform(userId);
        public bool IsPlatform(string userId) => PlatformUids.Contains(userId);
        public bool IsSalon(string userId) => SalonUids.Contains(userId);
    }

    private sealed class FakeAuthService : IAuthService
    {
        public Task<bool> ValidateAdminClaimAsync(string userId, CancellationToken cancellationToken = default) =>
            Task.FromResult(true);
    }

    [Fact]
    public async Task Platform_uid_gets_platform_role_with_admin_claim()
    {
        var svc = new AdminAccessService(
            new FakeRoleAllowlist("platform-uid", "salon-uid"),
            new FakeAuthService(),
            NullLogger<AdminAccessService>.Instance);

        var user = Claims("platform-uid", admin: true);
        Assert.Equal(AdminRole.Platform, await svc.GetRoleAsync(user));
        Assert.True(await svc.IsPlatformAdminAsync(user));
        Assert.True(await svc.IsSalonAdminAsync(user));
    }

    [Fact]
    public async Task Salon_uid_gets_salon_role_not_platform()
    {
        var svc = new AdminAccessService(
            new FakeRoleAllowlist("platform-uid", "salon-uid"),
            new FakeAuthService(),
            NullLogger<AdminAccessService>.Instance);

        var user = Claims("salon-uid", admin: true);
        Assert.Equal(AdminRole.Salon, await svc.GetRoleAsync(user));
        Assert.False(await svc.IsPlatformAdminAsync(user));
        Assert.True(await svc.IsSalonAdminAsync(user));
    }

    private static ClaimsPrincipal Claims(string uid, bool admin)
    {
        var id = new ClaimsIdentity("test");
        id.AddClaim(new Claim("user_id", uid));
        if (admin) id.AddClaim(new Claim("admin", "true"));
        return new ClaimsPrincipal(id);
    }
}
