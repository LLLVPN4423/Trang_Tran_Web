using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/admin/revenue")]
[Authorize(Policy = "Admin")]
public class RevenueController(IOrderService orderService) : ControllerBase
{
    /// <summary>from/to = ngày theo giờ Việt Nam (YYYY-MM-DD).</summary>
    [HttpGet("summary")]
    public async Task<ActionResult> GetSummary(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        CancellationToken ct)
    {
        if (to < from)
            return BadRequest(new { message = "to must be >= from." });

        var span = to.DayNumber - from.DayNumber + 1;
        if (span > 366)
            return BadRequest(new { message = "Maximum range is 366 days." });

        var summary = await orderService.GetRevenueSummaryAsync(from, to, ct);
        return Ok(summary);
    }
}
