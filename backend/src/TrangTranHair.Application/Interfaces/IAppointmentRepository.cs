using TrangTranHair.Application.DTOs;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Interfaces;

public interface IAppointmentRepository
{
    Task<Appointment?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Appointment>> GetAllAsync(AppointmentStatus? status = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Appointment>> GetByCustomerIdAsync(string customerId, CancellationToken cancellationToken = default);
    Task<Appointment> CreateAsync(Appointment appointment, CancellationToken cancellationToken = default);
    Task<Appointment> UpdateAsync(Appointment appointment, CancellationToken cancellationToken = default);
}

public interface IAppointmentService
{
    Task<AppointmentResponse> CreateAsync(CreateAppointmentRequest request, string? customerId, CancellationToken cancellationToken = default);
    Task<AppointmentResponse> GetAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AppointmentResponse>> ListAsync(AppointmentStatus? status = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AppointmentResponse>> ListByCustomerAsync(string customerId, CancellationToken cancellationToken = default);
    Task<AppointmentResponse> UpdateStatusAsync(string id, AppointmentStatus status, CancellationToken cancellationToken = default);
}
