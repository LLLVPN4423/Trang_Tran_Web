using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.DTOs;

public sealed record CreatePrivacyRequestRequest(
    PrivacyRequestType Type,
    string Description);

public sealed record AdminUpdatePrivacyRequestRequest(
    PrivacyRequestStatus Status,
    string? CustomerVisibleResult,
    string? CustomerVisibleNote,
    string? InternalNote);

public sealed record PrivacyRequestHistoryCustomerItem(
    DateTime At,
    string ActorRole,
    PrivacyRequestStatus? FromStatus,
    PrivacyRequestStatus ToStatus,
    string? CustomerVisibleNote);

public sealed record PrivacyRequestHistoryAdminItem(
    DateTime At,
    string ActorUid,
    string ActorRole,
    PrivacyRequestStatus? FromStatus,
    PrivacyRequestStatus ToStatus,
    string? CustomerVisibleNote,
    string? InternalNote);

/// <summary>Customer-facing DTO — never includes internal notes.</summary>
public sealed record PrivacyRequestCustomerResponse(
    string Id,
    PrivacyRequestType Type,
    string Description,
    PrivacyRequestStatus Status,
    string? CustomerVisibleResult,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IReadOnlyList<PrivacyRequestHistoryCustomerItem> History);

/// <summary>Admin-facing DTO — includes internal notes and customer snapshots.</summary>
public sealed record PrivacyRequestAdminResponse(
    string Id,
    string CustomerFirebaseUid,
    string? CustomerId,
    string? CustomerNameSnapshot,
    string? CustomerEmailSnapshot,
    string? CustomerPhoneSnapshot,
    PrivacyRequestType Type,
    string Description,
    PrivacyRequestStatus Status,
    string? CustomerVisibleResult,
    string? InternalNotes,
    string? AssignedAdminUid,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IReadOnlyList<PrivacyRequestHistoryAdminItem> History);
