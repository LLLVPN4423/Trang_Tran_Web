using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController(
    IAppointmentService appointmentService,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<AppointmentResponse>> Create([FromBody] CreateAppointmentRequest request, CancellationToken ct)
    {
        var customerId = currentUser.IsAuthenticated ? currentUser.UserId : null;
        var appointment = await appointmentService.CreateAsync(request, customerId, ct);
        return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, appointment);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AppointmentResponse>> GetById(string id, CancellationToken ct) =>
        Ok(await appointmentService.GetAsync(id, ct));

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
