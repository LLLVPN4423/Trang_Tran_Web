using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Services;

/// <summary>
/// Privacy / data-subject request workflow.
/// WP5: never deletes customers, orders, payments, appointments, or Firebase Auth accounts.
/// Admin completion only records a decision; any data action remains a separate, approved process.
/// </summary>
public sealed class PrivacyRequestService(
    IPrivacyRequestRepository privacyRequestRepository,
    ICustomerRepository customerRepository) : IPrivacyRequestService
{
    public async Task<PrivacyRequestCustomerResponse> CreateAsync(
        string customerFirebaseUid,
        CreatePrivacyRequestRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(customerFirebaseUid))
            throw new ValidationException("customerFirebaseUid", "Yêu cầu đăng nhập.");

        if (!Enum.IsDefined(request.Type))
            throw new ValidationException("type", "Loại yêu cầu không hợp lệ.");

        if (string.IsNullOrWhiteSpace(request.Description) || request.Description.Trim().Length < 10)
            throw new ValidationException("description", "Vui lòng mô tả yêu cầu (tối thiểu 10 ký tự).");

        var customer = await customerRepository.GetByFirebaseUidAsync(customerFirebaseUid, cancellationToken);

        var entity = new PrivacyRequest
        {
            CustomerFirebaseUid = customerFirebaseUid,
            CustomerId = customer?.Id,
            CustomerNameSnapshot = customer?.Name,
            CustomerEmailSnapshot = customer?.Email,
            CustomerPhoneSnapshot = customer?.Phone,
            Type = request.Type,
            Description = request.Description.Trim(),
            Status = PrivacyRequestStatus.Submitted,
            History =
            [
                new PrivacyRequestHistoryEntry
                {
                    At = DateTime.UtcNow,
                    ActorUid = customerFirebaseUid,
                    ActorRole = "Customer",
                    FromStatus = null,
                    ToStatus = PrivacyRequestStatus.Submitted,
                    CustomerVisibleNote = "Yêu cầu đã được gửi.",
                },
            ],
        };

        var saved = await privacyRequestRepository.CreateAsync(entity, cancellationToken);
        return MapCustomer(saved);
    }

    public async Task<IReadOnlyList<PrivacyRequestCustomerResponse>> ListMineAsync(
        string customerFirebaseUid,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(customerFirebaseUid))
            throw new ValidationException("customerFirebaseUid", "Yêu cầu đăng nhập.");

        var items = await privacyRequestRepository.GetByCustomerFirebaseUidAsync(customerFirebaseUid, cancellationToken);
        return items.Select(MapCustomer).ToList();
    }

    public async Task<PrivacyRequestCustomerResponse> GetMineAsync(
        string customerFirebaseUid,
        string id,
        CancellationToken cancellationToken = default)
    {
        var entity = await privacyRequestRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Privacy request '{id}' not found.");

        if (!string.Equals(entity.CustomerFirebaseUid, customerFirebaseUid, StringComparison.Ordinal))
            throw new NotFoundException($"Privacy request '{id}' not found.");

        return MapCustomer(entity);
    }

    public async Task<IReadOnlyList<PrivacyRequestAdminResponse>> AdminListAsync(
        PrivacyRequestType? type = null,
        PrivacyRequestStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var items = await privacyRequestRepository.ListAsync(type, status, cancellationToken);
        return items.Select(MapAdmin).ToList();
    }

    public async Task<PrivacyRequestAdminResponse> AdminGetAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        var entity = await privacyRequestRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Privacy request '{id}' not found.");
        return MapAdmin(entity);
    }

    public async Task<PrivacyRequestAdminResponse> AdminUpdateAsync(
        string id,
        string adminUid,
        AdminUpdatePrivacyRequestRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(adminUid))
            throw new ValidationException("adminUid", "Thiếu định danh nhân viên xử lý.");

        if (!Enum.IsDefined(request.Status))
            throw new ValidationException("status", "Trạng thái không hợp lệ.");

        var entity = await privacyRequestRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Privacy request '{id}' not found.");

        if (!IsAllowedTransition(entity.Status, request.Status))
        {
            throw new ValidationException(
                "status",
                $"Không thể chuyển từ {entity.Status} sang {request.Status}.");
        }

        // WP5 hard rule: this service never deletes or anonymizes customer/order/payment data.
        // Deletion/Restriction completion is a recorded decision only.
        if (request.Status is PrivacyRequestStatus.Approved or PrivacyRequestStatus.Completed
            && entity.Type is PrivacyRequestType.Deletion or PrivacyRequestType.Restriction
            && string.IsNullOrWhiteSpace(request.CustomerVisibleResult)
            && string.IsNullOrWhiteSpace(entity.CustomerVisibleResult))
        {
            throw new ValidationException(
                "customerVisibleResult",
                "Yêu cầu xóa/hạn chế cần ghi kết quả phản hồi khách (quyết định thủ công — hệ thống không tự xóa dữ liệu).");
        }

        var from = entity.Status;
        entity.Status = request.Status;
        entity.AssignedAdminUid = adminUid;

        if (!string.IsNullOrWhiteSpace(request.CustomerVisibleResult))
            entity.CustomerVisibleResult = request.CustomerVisibleResult.Trim();

        if (!string.IsNullOrWhiteSpace(request.InternalNote))
            entity.InternalNotes = request.InternalNote.Trim();

        entity.History.Add(new PrivacyRequestHistoryEntry
        {
            At = DateTime.UtcNow,
            ActorUid = adminUid,
            ActorRole = "Admin",
            FromStatus = from,
            ToStatus = request.Status,
            CustomerVisibleNote = string.IsNullOrWhiteSpace(request.CustomerVisibleNote)
                ? null
                : request.CustomerVisibleNote.Trim(),
            InternalNote = string.IsNullOrWhiteSpace(request.InternalNote)
                ? null
                : request.InternalNote.Trim(),
        });

        var updated = await privacyRequestRepository.UpdateAsync(entity, cancellationToken);
        return MapAdmin(updated);
    }

    public static bool IsAllowedTransition(PrivacyRequestStatus from, PrivacyRequestStatus to)
    {
        if (from == to)
            return true;

        return from switch
        {
            PrivacyRequestStatus.Submitted => to is
                PrivacyRequestStatus.IdentityVerificationRequired
                or PrivacyRequestStatus.UnderReview
                or PrivacyRequestStatus.MoreInformationRequired
                or PrivacyRequestStatus.Approved
                or PrivacyRequestStatus.Rejected
                or PrivacyRequestStatus.Completed,

            PrivacyRequestStatus.IdentityVerificationRequired => to is
                PrivacyRequestStatus.UnderReview
                or PrivacyRequestStatus.MoreInformationRequired
                or PrivacyRequestStatus.Approved
                or PrivacyRequestStatus.Rejected
                or PrivacyRequestStatus.Completed,

            PrivacyRequestStatus.UnderReview => to is
                PrivacyRequestStatus.IdentityVerificationRequired
                or PrivacyRequestStatus.MoreInformationRequired
                or PrivacyRequestStatus.Approved
                or PrivacyRequestStatus.Rejected
                or PrivacyRequestStatus.Completed,

            PrivacyRequestStatus.MoreInformationRequired => to is
                PrivacyRequestStatus.IdentityVerificationRequired
                or PrivacyRequestStatus.UnderReview
                or PrivacyRequestStatus.Approved
                or PrivacyRequestStatus.Rejected
                or PrivacyRequestStatus.Completed,

            PrivacyRequestStatus.Approved => to is
                PrivacyRequestStatus.Completed
                or PrivacyRequestStatus.UnderReview,

            PrivacyRequestStatus.Rejected => to is PrivacyRequestStatus.Completed,

            PrivacyRequestStatus.Completed => false,

            _ => false,
        };
    }

    private static PrivacyRequestCustomerResponse MapCustomer(PrivacyRequest r) =>
        new(
            r.Id,
            r.Type,
            r.Description,
            r.Status,
            r.CustomerVisibleResult,
            r.CreatedAt,
            r.UpdatedAt,
            r.History
                .OrderBy(h => h.At)
                .Select(h => new PrivacyRequestHistoryCustomerItem(
                    h.At,
                    h.ActorRole,
                    h.FromStatus,
                    h.ToStatus,
                    h.CustomerVisibleNote))
                .ToList());

    private static PrivacyRequestAdminResponse MapAdmin(PrivacyRequest r) =>
        new(
            r.Id,
            r.CustomerFirebaseUid,
            r.CustomerId,
            r.CustomerNameSnapshot,
            r.CustomerEmailSnapshot,
            r.CustomerPhoneSnapshot,
            r.Type,
            r.Description,
            r.Status,
            r.CustomerVisibleResult,
            r.InternalNotes,
            r.AssignedAdminUid,
            r.CreatedAt,
            r.UpdatedAt,
            r.History
                .OrderBy(h => h.At)
                .Select(h => new PrivacyRequestHistoryAdminItem(
                    h.At,
                    h.ActorUid,
                    h.ActorRole,
                    h.FromStatus,
                    h.ToStatus,
                    h.CustomerVisibleNote,
                    h.InternalNote))
                .ToList());
}
