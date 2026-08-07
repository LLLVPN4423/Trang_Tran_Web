using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Services;

public sealed class LoyaltyService(
    ICustomerRepository customerRepository,
    ILoyaltyRepository loyaltyRepository) : ILoyaltyService
{
    public const int PointsPerTenThousandVnd = 1;
    public const int RedeemRatePoints = 100;
    public const decimal RedeemRateValueVnd = 10_000m;

    public LoyaltySummaryResponse GetRules() =>
        new(0, 0, PointsPerTenThousandVnd, RedeemRatePoints, RedeemRateValueVnd);

    public async Task<LoyaltySummaryResponse> GetSummaryAsync(string customerId, CancellationToken cancellationToken = default)
    {
        var customer = await customerRepository.GetByIdAsync(customerId, cancellationToken)
            ?? throw new NotFoundException("Customer not found.");

        return new LoyaltySummaryResponse(
            customer.LoyaltyPoints,
            customer.TotalSpent,
            PointsPerTenThousandVnd,
            RedeemRatePoints,
            RedeemRateValueVnd);
    }

    public async Task<IReadOnlyList<LoyaltyTransactionResponse>> GetHistoryAsync(string customerId, CancellationToken cancellationToken = default)
    {
        var transactions = await loyaltyRepository.GetByCustomerIdAsync(customerId, cancellationToken);
        return transactions
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new LoyaltyTransactionResponse(t.Id, t.Type, t.Points, t.Description, t.OrderId, t.CreatedAt))
            .ToList();
    }

    public async Task<int> RedeemPointsAsync(string customerId, int points, string orderId, CancellationToken cancellationToken = default)
    {
        if (points <= 0) return 0;

        var customer = await customerRepository.GetByIdAsync(customerId, cancellationToken)
            ?? throw new NotFoundException("Customer not found.");

        if (points > customer.LoyaltyPoints)
            throw new ValidationException("pointsToRedeem", "Không đủ điểm tích lũy.");

        if (points % RedeemRatePoints != 0)
            throw new ValidationException("pointsToRedeem", $"Điểm đổi phải chia hết cho {RedeemRatePoints}.");

        customer.LoyaltyPoints -= points;
        await customerRepository.UpdateAsync(customer, cancellationToken);

        await loyaltyRepository.CreateAsync(new LoyaltyTransaction
        {
            CustomerId = customerId,
            OrderId = orderId,
            Type = LoyaltyTransactionType.Redeem,
            Points = -points,
            Description = $"Đổi {points} điểm cho đơn {orderId}",
        }, cancellationToken);

        return points;
    }

    public async Task EarnPointsForOrderAsync(string customerId, string orderId, decimal paidAmount, CancellationToken cancellationToken = default)
    {
        var points = CalculateEarnPoints(paidAmount);
        if (points <= 0) return;

        var customer = await customerRepository.GetByIdAsync(customerId, cancellationToken);
        if (customer is null) return;

        customer.LoyaltyPoints += points;
        customer.TotalSpent += paidAmount;
        await customerRepository.UpdateAsync(customer, cancellationToken);

        await loyaltyRepository.CreateAsync(new LoyaltyTransaction
        {
            CustomerId = customerId,
            OrderId = orderId,
            Type = LoyaltyTransactionType.Earn,
            Points = points,
            Description = $"Tích {points} điểm từ đơn {orderId}",
        }, cancellationToken);
    }

    public async Task AdjustPointsAsync(string customerId, int points, string description, CancellationToken cancellationToken = default)
    {
        var customer = await customerRepository.GetByIdAsync(customerId, cancellationToken)
            ?? throw new NotFoundException("Customer not found.");

        customer.LoyaltyPoints = Math.Max(0, customer.LoyaltyPoints + points);
        await customerRepository.UpdateAsync(customer, cancellationToken);

        await loyaltyRepository.CreateAsync(new LoyaltyTransaction
        {
            CustomerId = customerId,
            Type = LoyaltyTransactionType.Adjust,
            Points = points,
            Description = description,
        }, cancellationToken);
    }

    public int CalculateRedeemDiscount(int points) =>
        (points / RedeemRatePoints) * (int)RedeemRateValueVnd;

    public int CalculateMaxRedeemablePoints(int availablePoints, decimal subtotalAfterPromo)
    {
        var maxBySubtotal = (int)(subtotalAfterPromo / RedeemRateValueVnd) * RedeemRatePoints;
        var capped = Math.Min(availablePoints, maxBySubtotal);
        return capped - (capped % RedeemRatePoints);
    }

    public int CalculateEarnPoints(decimal paidAmount) =>
        (int)(paidAmount / 10_000m) * PointsPerTenThousandVnd;
}
