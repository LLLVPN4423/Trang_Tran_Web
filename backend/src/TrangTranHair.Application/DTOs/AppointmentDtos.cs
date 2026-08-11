using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.DTOs;

public sealed record CreateAppointmentRequest(
    string CustomerName,
    string CustomerPhone,
    string ServiceInterest,
    string? Notes);

public sealed record AppointmentResponse(
    string Id,
    string? CustomerId,
    string CustomerName,
    string CustomerPhone,
    string ServiceInterest,
    string? Notes,
    AppointmentStatus Status,
    string AccessToken,
    DateTime CreatedAt);

public sealed record UpdateAppointmentStatusRequest(
    AppointmentStatus Status);
