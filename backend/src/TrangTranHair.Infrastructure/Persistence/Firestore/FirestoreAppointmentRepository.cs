using Google.Cloud.Firestore;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Infrastructure.Persistence.Firestore;

public sealed class FirestoreAppointmentRepository(FirestoreDb db) : IAppointmentRepository
{
    private CollectionReference Collection => db.Collection("appointments");

    public async Task<Appointment?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var doc = await Collection.Document(id).GetSnapshotAsync(cancellationToken);
        return doc.Exists ? MapFrom(doc.ConvertTo<AppointmentDocument>()) : null;
    }

    public async Task<IReadOnlyList<Appointment>> GetAllAsync(AppointmentStatus? status = null, CancellationToken cancellationToken = default)
    {
        Query query = Collection;
        if (status is not null)
            query = query.WhereEqualTo("Status", status.ToString());

        var snapshot = await query.GetSnapshotAsync(cancellationToken);
        return snapshot.Documents
            .Select(d => MapFrom(d.ConvertTo<AppointmentDocument>()))
            .OrderByDescending(a => a.CreatedAt)
            .ToList();
    }

    public async Task<IReadOnlyList<Appointment>> GetByCustomerIdAsync(string customerId, CancellationToken cancellationToken = default)
    {
        var snapshot = await Collection
            .WhereEqualTo("CustomerId", customerId)
            .GetSnapshotAsync(cancellationToken);

        return snapshot.Documents
            .Select(d => MapFrom(d.ConvertTo<AppointmentDocument>()))
            .OrderByDescending(a => a.CreatedAt)
            .ToList();
    }

    public async Task<Appointment> CreateAsync(Appointment appointment, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(appointment.Id))
            appointment.Id = Guid.NewGuid().ToString();

        appointment.CreatedAt = DateTime.UtcNow;
        await Collection.Document(appointment.Id).SetAsync(MapTo(appointment), cancellationToken: cancellationToken);
        return appointment;
    }

    public async Task<Appointment> UpdateAsync(Appointment appointment, CancellationToken cancellationToken = default)
    {
        appointment.UpdatedAt = DateTime.UtcNow;
        await Collection.Document(appointment.Id).SetAsync(MapTo(appointment), cancellationToken: cancellationToken);
        return appointment;
    }

    private static Appointment MapFrom(AppointmentDocument doc) =>
        new()
        {
            Id = doc.Id,
            CustomerId = doc.CustomerId,
            CustomerName = doc.CustomerName,
            CustomerPhone = doc.CustomerPhone,
            ServiceInterest = doc.ServiceInterest,
            Notes = doc.Notes,
            Status = Enum.Parse<AppointmentStatus>(doc.Status),
            AccessToken = doc.AccessToken ?? string.Empty,
            CreatedAt = FirestoreMapper.FromTimestamp(doc.CreatedAt),
            UpdatedAt = FirestoreMapper.FromTimestamp(doc.UpdatedAt),
        };

    private static AppointmentDocument MapTo(Appointment appointment) =>
        new()
        {
            Id = appointment.Id,
            CustomerId = appointment.CustomerId,
            CustomerName = appointment.CustomerName,
            CustomerPhone = appointment.CustomerPhone,
            ServiceInterest = appointment.ServiceInterest,
            Notes = appointment.Notes,
            Status = appointment.Status.ToString(),
            AccessToken = appointment.AccessToken,
            CreatedAt = FirestoreMapper.ToTimestamp(appointment.CreatedAt),
            UpdatedAt = appointment.UpdatedAt is null ? null : FirestoreMapper.ToTimestamp(appointment.UpdatedAt.Value),
        };
}

[FirestoreData]
internal sealed class AppointmentDocument
{
    [FirestoreDocumentId]
    public string Id { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? CustomerId { get; set; }

    [FirestoreProperty]
    public string CustomerName { get; set; } = string.Empty;

    [FirestoreProperty]
    public string CustomerPhone { get; set; } = string.Empty;

    [FirestoreProperty]
    public string ServiceInterest { get; set; } = string.Empty;

    [FirestoreProperty]
    public string? Notes { get; set; }

    [FirestoreProperty]
    public string Status { get; set; } = AppointmentStatus.Pending.ToString();

    [FirestoreProperty]
    public string? AccessToken { get; set; }

    [FirestoreProperty]
    public Timestamp CreatedAt { get; set; }

    [FirestoreProperty]
    public Timestamp? UpdatedAt { get; set; }
}
