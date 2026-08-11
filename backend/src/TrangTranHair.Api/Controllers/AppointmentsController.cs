using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using TrangTranHair.Application.Common;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController(
    IAppointmentService appointmentService,
    ICurrentUserService currentUser,
    IAdminAccessService adminAccess) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting("public-writes")]
    public async Task<ActionResult<AppointmentResponse>> Create([FromBody] CreateAppointmentRequest request, CancellationToken ct)
    {
        var customerId = currentUser.IsAuthenticated ? currentUser.UserId : null;
        var appointment = await appointmentService.CreateAsync(request, customerId, ct);
        return CreatedAtAction(nameof(GetById), new { id = appointment.Id, token = appointment.AccessToken }, appointment);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<AppointmentResponse>>> MyAppointments(CancellationToken ct)
    {
        if (string.IsNullOrEmpty(currentUser.UserId))
            return Unauthorized();

        return Ok(await appointmentService.ListByCustomerAsync(currentUser.UserId, ct));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AppointmentResponse>> GetById(string id, [FromQuery] string? token, CancellationToken ct)
    {
        var appointment = await appointmentService.GetAsync(id, ct);

        if (await adminAccess.IsAdminAsync(User, ct))
            return Ok(appointment);

        if (currentUser.IsAuthenticated
            && !string.IsNullOrWhiteSpace(currentUser.UserId)
            && appointment.CustomerId == currentUser.UserId)
            return Ok(appointment);

        if (AccessTokenGenerator.Matches(appointment.AccessToken, token))
            return Ok(appointment);

        return Unauthorized(new { message = "Không có quyền xem lịch hẹn này." });
    }

    [HttpGet]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<IReadOnlyList<AppointmentResponse>>> List(
        [FromQuery] AppointmentStatus? status,
        CancellationToken ct) =>
        Ok(await appointmentService.ListAsync(status, ct));

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<AppointmentResponse>> UpdateStatus(
        string id,
        [FromBody] UpdateAppointmentStatusRequest request,
        CancellationToken ct) =>
        Ok(await appointmentService.UpdateStatusAsync(id, request.Status, ct));
}
