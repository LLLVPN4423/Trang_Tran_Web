using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() =>
        Ok(new
        {
            status = "healthy",
            service = "TrangTranHair.Api",
            timestamp = DateTime.UtcNow
        });

    [HttpGet("protected")]
    [Authorize]
    public IActionResult GetProtected() =>
        Ok(new
        {
            status = "authenticated",
            userId = User.FindFirst("user_id")?.Value ?? User.FindFirst("sub")?.Value,
            timestamp = DateTime.UtcNow
        });

    [HttpGet("admin")]
    [Authorize(Policy = "Admin")]
    public IActionResult GetAdmin() =>
        Ok(new
        {
            status = "admin",
            message = "Admin access granted.",
            timestamp = DateTime.UtcNow
        });
}
