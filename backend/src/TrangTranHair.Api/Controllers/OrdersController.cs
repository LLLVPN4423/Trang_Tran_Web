using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TrangTranHair.Application.Common;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(
    IOrderService orderService,
    ICurrentUserService currentUser,
    IAdminAccessService adminAccess) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting("public-writes")]
    public async Task<ActionResult<OrderResponse>> Create([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        var enriched = request with
        {
            CustomerId = currentUser.IsAuthenticated ? currentUser.UserId : request.CustomerId,
        };

        var order = await orderService.CreateOrderAsync(enriched, ct);
        return CreatedAtAction(nameof(GetById), new { id = order.Id, token = order.AccessToken }, order);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderResponse>> GetById(string id, [FromQuery] string? token, CancellationToken ct)
    {
        var order = await orderService.GetOrderAsync(id, ct);

        if (await adminAccess.IsAdminAsync(User, ct))
            return Ok(order);

        if (currentUser.IsAuthenticated
            && !string.IsNullOrWhiteSpace(currentUser.UserId)
            && order.CustomerId == currentUser.UserId)
            return Ok(order);

        if (AccessTokenGenerator.Matches(order.AccessToken, token))
            return Ok(order);

        return Unauthorized(new { message = "Không có quyền xem đơn hàng này." });
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<OrderResponse>>> List(
        [FromQuery] OrderStatus? status,
        [FromQuery] string? phone,
        CancellationToken ct)
    {
        if (await adminAccess.IsAdminAsync(User, ct))
            return Ok(await orderService.ListOrdersAsync(status, phone, null, ct));

        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Unauthorized();

        return Ok(await orderService.ListOrdersAsync(status, phone, currentUser.UserId, ct));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<OrderResponse>> UpdateStatus(
        string id,
        [FromBody] UpdateOrderStatusRequest request,
        CancellationToken ct) =>
        Ok(await orderService.UpdateStatusAsync(id, request.Status, ct));
}
