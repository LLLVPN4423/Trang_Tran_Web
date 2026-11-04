using TrangTranHair.Application.DTOs;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Interfaces;

public interface IPrivacyRequestRepository
{
    Task<PrivacyRequest?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PrivacyRequest>> GetByCustomerFirebaseUidAsync(string firebaseUid, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PrivacyRequest>> ListAsync(
        PrivacyRequestType? type = null,
        PrivacyRequestStatus? status = null,
        CancellationToken cancellationToken = default);
    Task<PrivacyRequest> CreateAsync(PrivacyRequest request, CancellationToken cancellationToken = default);
    Task<PrivacyRequest> UpdateAsync(PrivacyRequest request, CancellationToken cancellationToken = default);
}

public interface IPrivacyRequestService
{
    Task<PrivacyRequestCustomerResponse> CreateAsync(
        string customerFirebaseUid,
        CreatePrivacyRequestRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PrivacyRequestCustomerResponse>> ListMineAsync(
        string customerFirebaseUid,
        CancellationToken cancellationToken = default);

    Task<PrivacyRequestCustomerResponse> GetMineAsync(
        string customerFirebaseUid,
        string id,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PrivacyRequestAdminResponse>> AdminListAsync(
        PrivacyRequestType? type = null,
        PrivacyRequestStatus? status = null,
        CancellationToken cancellationToken = default);

    Task<PrivacyRequestAdminResponse> AdminGetAsync(
        string id,
        CancellationToken cancellationToken = default);

    Task<PrivacyRequestAdminResponse> AdminUpdateAsync(
        string id,
        string adminUid,
        AdminUpdatePrivacyRequestRequest request,
        CancellationToken cancellationToken = default);
}
