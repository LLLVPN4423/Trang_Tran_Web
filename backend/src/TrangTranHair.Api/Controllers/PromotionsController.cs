using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromotionsController(IPromotionService promotionService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PromotionResponse>>> List(CancellationToken ct) =>
        Ok(await promotionService.ListAsync(ct));

    [HttpGet("{id}")]
    public async Task<ActionResult<PromotionResponse>> GetById(string id, CancellationToken ct) =>
        Ok(await promotionService.GetAsync(id, ct));

    [HttpPost("validate")]
    public async Task<ActionResult<ValidatePromotionResponse>> Validate(
        [FromBody] ValidatePromotionRequest request,
        CancellationToken ct) =>
        Ok(await promotionService.ValidateAsync(request.Code, request.SubtotalAmount, ct));

    [HttpPost]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<PromotionResponse>> Create([FromBody] CreatePromotionRequest request, CancellationToken ct)
    {
        var promotion = await promotionService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = promotion.Id }, promotion);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<PromotionResponse>> Update(string id, [FromBody] UpdatePromotionRequest request, CancellationToken ct) =>
        Ok(await promotionService.UpdateAsync(id, request, ct));

    [HttpDelete("{id}")]
    [Authorize(Policy = "Admin")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        await promotionService.DeleteAsync(id, ct);
        return NoContent();
    }
}
