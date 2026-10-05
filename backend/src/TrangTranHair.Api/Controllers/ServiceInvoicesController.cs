using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;

using TrangTranHair.Application.DTOs;

using TrangTranHair.Application.Interfaces;

using TrangTranHair.Domain.Enums;



namespace TrangTranHair.Api.Controllers;



[ApiController]

[Route("api/admin/service-invoices")]

[Authorize(Policy = "Admin")]

public class ServiceInvoicesController(IOrderService orderService, ICurrentUserService currentUser) : ControllerBase

{

    [HttpPost]

    public async Task<ActionResult<OrderResponse>> Create(

        [FromBody] CreateServiceInvoiceRequest request,

        CancellationToken ct)

    {

        var order = await orderService.CreateServiceInvoiceAsync(request, currentUser.UserId, ct);

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);

    }



    [HttpGet("{id}")]

    public async Task<ActionResult<OrderResponse>> GetById(string id, CancellationToken ct) =>

        Ok(await orderService.GetOrderAsync(id, ct));



    [HttpPut("{id}")]

    public async Task<ActionResult<OrderResponse>> Update(

        string id,

        [FromBody] UpdateServiceInvoiceRequest request,

        CancellationToken ct) =>

        Ok(await orderService.UpdateServiceInvoiceAsync(id, request, ct));



    [HttpGet]

    public async Task<ActionResult<IReadOnlyList<OrderResponse>>> List(

        [FromQuery] OrderStatus? status,

        [FromQuery] string? phone,

        [FromQuery] string? appointmentId,

        CancellationToken ct) =>

        Ok(await orderService.ListServiceInvoicesAsync(status, phone, appointmentId, ct));

}


