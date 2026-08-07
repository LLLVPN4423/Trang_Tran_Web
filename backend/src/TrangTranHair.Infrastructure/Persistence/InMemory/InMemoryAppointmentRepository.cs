using System.Collections.Concurrent;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Infrastructure.Persistence.InMemory;

public sealed class InMemoryAppointmentRepository : IAppointmentRepository
{
    private readonly ConcurrentDictionary<string, Appointment> _store = new();

    public Task<Appointment?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        _store.TryGetValue(id, out var item);
        return Task.FromResult(item);
    }

    public Task<IReadOnlyList<Appointment>> GetAllAsync(AppointmentStatus? status = null, CancellationToken cancellationToken = default)
    {
        IEnumerable<Appointment> query = _store.Values;
        if (status is not null)
            query = query.Where(a => a.Status == status);

        return Task.FromResult<IReadOnlyList<Appointment>>(query.OrderByDescending(a => a.CreatedAt).ToList());
    }

    public Task<Appointment> CreateAsync(Appointment appointment, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(appointment.Id))
            appointment.Id = Guid.NewGuid().ToString();

        appointment.CreatedAt = DateTime.UtcNow;
        _store[appointment.Id] = appointment;
        return Task.FromResult(appointment);
    }

    public Task<Appointment> UpdateAsync(Appointment appointment, CancellationToken cancellationToken = default)
    {
        appointment.UpdatedAt = DateTime.UtcNow;
        _store[appointment.Id] = appointment;
        return Task.FromResult(appointment);
    }
}
