using Microsoft.AspNetCore.Authorization;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Api.Authorization;

/// <summary>
/// Admin = UID trong FIREBASE_ADMIN_UIDS + claim admin:true (JWT hoặc Firebase SDK).
/// </summary>
public sealed class AdminAuthorizationHandler(IAdminAccessService adminAccess) : AuthorizationHandler<AdminRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        AdminRequirement requirement)
    {
        if (await adminAccess.IsAdminAsync(context.User))
            context.Succeed(requirement);
    }
}
