using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Services;

public sealed class AppointmentService(IAppointmentRepository repository) : IAppointmentService
{
    public async Task<AppointmentResponse> CreateAsync(
        CreateAppointmentRequest request,
        string? customerId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
            throw new ValidationException("customerName", "Họ tên là bắt buộc.");

        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
            throw new ValidationException("customerPhone", "Số điện thoại là bắt buộc.");

        var appointment = new Appointment
        {
            CustomerId = customerId,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            ServiceInterest = request.ServiceInterest.Trim(),
            Notes = request.Notes?.Trim(),
            Status = AppointmentStatus.Pending,
        };

        var saved = await repository.CreateAsync(appointment, cancellationToken);
        return Map(saved);
    }

    public async Task<AppointmentResponse> GetAsync(string id, CancellationToken cancellationToken = default)
    {
        var appointment = await repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Appointment '{id}' not found.");
        return Map(appointment);
    }

    public async Task<IReadOnlyList<AppointmentResponse>> ListAsync(
        AppointmentStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var items = await repository.GetAllAsync(status, cancellationToken);
        return items.Select(Map).ToList();
    }

    public async Task<AppointmentResponse> UpdateStatusAsync(
        string id,
        AppointmentStatus status,
        CancellationToken cancellationToken = default)
    {
        var appointment = await repository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Appointment '{id}' not found.");

        appointment.Status = status;
        var updated = await repository.UpdateAsync(appointment, cancellationToken);
        return Map(updated);
    }

    private static AppointmentResponse Map(Appointment a) =>
        new(a.Id, a.CustomerId, a.CustomerName, a.CustomerPhone, a.ServiceInterest, a.Notes, a.Status, a.CreatedAt);
}
