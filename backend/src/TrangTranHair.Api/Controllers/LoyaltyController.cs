using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoyaltyController(
    ILoyaltyService loyaltyService,
    ICustomerService customerService,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet("rules")]
    public ActionResult<LoyaltySummaryResponse> GetRules() =>
        Ok(loyaltyService.GetRules());

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<LoyaltySummaryResponse>> GetMySummary(CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Unauthorized();

        var customer = await customerService.GetMeAsync(currentUser.UserId, ct);
        return Ok(await loyaltyService.GetSummaryAsync(customer.Id, ct));
    }

    [HttpGet("me/history")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<LoyaltyTransactionResponse>>> GetMyHistory(CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Unauthorized();

        var customer = await customerService.GetMeAsync(currentUser.UserId, ct);
        return Ok(await loyaltyService.GetHistoryAsync(customer.Id, ct));
    }

    [HttpPost("adjust")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<IActionResult> Adjust([FromBody] AdjustLoyaltyRequest request, CancellationToken ct)
    {
        await loyaltyService.AdjustPointsAsync(request.CustomerId, request.Points, request.Description, ct);
        return NoContent();
    }
}
