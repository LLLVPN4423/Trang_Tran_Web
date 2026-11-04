using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Domain.Entities;

/// <summary>
/// Customer privacy / data-subject request. Status changes and history are staff-mediated.
/// Completion never auto-deletes orders, payments, or Firebase Auth accounts.
/// </summary>
public class PrivacyRequest : Common.BaseEntity
{
    public string CustomerFirebaseUid { get; set; } = string.Empty;
    public string? CustomerId { get; set; }
    public string? CustomerNameSnapshot { get; set; }
    public string? CustomerEmailSnapshot { get; set; }
    public string? CustomerPhoneSnapshot { get; set; }
    public PrivacyRequestType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public PrivacyRequestStatus Status { get; set; } = PrivacyRequestStatus.Submitted;
    public string? CustomerVisibleResult { get; set; }
    public string? InternalNotes { get; set; }
    public string? AssignedAdminUid { get; set; }
    public List<PrivacyRequestHistoryEntry> History { get; set; } = [];
}

public class PrivacyRequestHistoryEntry
{
    public DateTime At { get; set; } = DateTime.UtcNow;
    public string ActorUid { get; set; } = string.Empty;
    public string ActorRole { get; set; } = "Customer";
    public PrivacyRequestStatus? FromStatus { get; set; }
    public PrivacyRequestStatus ToStatus { get; set; }
    public string? CustomerVisibleNote { get; set; }
    public string? InternalNote { get; set; }
}
