using Microsoft.AspNetCore.Authorization;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Api.Authorization;

public sealed class PlatformAdminAuthorizationHandler(IAdminAccessService adminAccess)
    : AuthorizationHandler<PlatformAdminRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PlatformAdminRequirement requirement)
    {
        if (await adminAccess.IsPlatformAdminAsync(context.User))
            context.Succeed(requirement);
    }
}
