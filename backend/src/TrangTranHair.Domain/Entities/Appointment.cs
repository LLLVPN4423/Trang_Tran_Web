using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Domain.Entities;

public class Appointment : Common.BaseEntity
{
    public string? CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string ServiceInterest { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
    public string AccessToken { get; set; } = string.Empty;
}
