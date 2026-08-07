using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController(
    IOrderService orderService,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<OrderResponse>> Create([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        var enriched = request with
        {
            CustomerId = currentUser.IsAuthenticated ? currentUser.UserId : request.CustomerId,
        };

        var order = await orderService.CreateOrderAsync(enriched, ct);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderResponse>> GetById(string id, CancellationToken ct)
    {
        var order = await orderService.GetOrderAsync(id, ct);
        return Ok(order);
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<OrderResponse>>> List(
        [FromQuery] OrderStatus? status,
        [FromQuery] string? phone,
        CancellationToken ct)
    {
        if (User.HasClaim("admin", "true"))
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
