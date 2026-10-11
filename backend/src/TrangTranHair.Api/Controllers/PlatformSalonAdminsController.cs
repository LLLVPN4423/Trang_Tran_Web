using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/platform/salon-admins")]
[Authorize(Policy = "PlatformAdmin")]
public class PlatformSalonAdminsController(IAdminGrantService grantService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct) =>
        Ok(await grantService.ListSalonAdminsAsync(ct));

    [HttpPost]
    public async Task<IActionResult> Grant([FromBody] GrantSalonAdminRequest request, CancellationToken ct)
    {
        await grantService.GrantSalonAdminAsync(request.UserId, ct);
        return Ok(new { message = "Đã cấp Salon Admin. User cần đăng xuất và đăng nhập lại.", userId = request.UserId });
    }

    [HttpDelete("{userId}")]
    public async Task<IActionResult> Revoke(string userId, CancellationToken ct)
    {
        await grantService.RevokeSalonAdminAsync(userId, ct);
        return Ok(new { message = "Đã thu hồi Salon Admin.", userId });
    }
}

public sealed record GrantSalonAdminRequest(string UserId);
