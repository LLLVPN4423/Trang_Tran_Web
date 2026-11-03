using TrangTranHair.Application.DTOs;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Interfaces;

public interface ICustomerService
{
    Task<CustomerResponse> SyncAsync(string firebaseUid, SyncCustomerRequest request, CancellationToken cancellationToken = default);
    Task<CustomerResponse> GetMeAsync(string firebaseUid, CancellationToken cancellationToken = default);
    Task<CustomerResponse> UpdateMeAsync(string firebaseUid, UpdateCustomerRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CustomerResponse>> ListAsync(CancellationToken cancellationToken = default);
}

public interface IPromotionService
{
    Task<IReadOnlyList<PromotionResponse>> ListAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PromotionResponse>> ListActiveAsync(CancellationToken cancellationToken = default);
    Task<PromotionResponse> GetAsync(string id, CancellationToken cancellationToken = default);
    Task<PromotionResponse> CreateAsync(CreatePromotionRequest request, CancellationToken cancellationToken = default);
    Task<PromotionResponse> UpdateAsync(string id, UpdatePromotionRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    Task<ValidatePromotionResponse> ValidateAsync(string code, decimal subtotalAmount, CancellationToken cancellationToken = default);
    Task ApplyUsageAsync(string promotionId, CancellationToken cancellationToken = default);
}

public interface ILoyaltyService
{
    LoyaltySummaryResponse GetRules();
    Task<LoyaltySummaryResponse> GetSummaryAsync(string customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LoyaltyTransactionResponse>> GetHistoryAsync(string customerId, CancellationToken cancellationToken = default);
    Task<int> RedeemPointsAsync(string customerId, int points, string orderId, CancellationToken cancellationToken = default);
    Task EarnPointsForOrderAsync(string customerId, string orderId, decimal paidAmount, CancellationToken cancellationToken = default);
    Task<int> SyncMissedEarnsForCustomerAsync(string customerId, CancellationToken cancellationToken = default);
    Task RefundRedeemedPointsAsync(string customerId, int points, string orderId, CancellationToken cancellationToken = default);
    Task AdjustPointsAsync(string customerId, int points, string description, CancellationToken cancellationToken = default);
    int CalculateRedeemDiscount(int points);
    int CalculateMaxRedeemablePoints(int availablePoints, decimal subtotalAfterPromo);
    int CalculateEarnPoints(decimal paidAmount);
}
