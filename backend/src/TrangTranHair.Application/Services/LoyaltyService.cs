using TrangTranHair.Application.Common;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Services;

public sealed class LoyaltyService(
    ICustomerRepository customerRepository,
    ILoyaltyRepository loyaltyRepository,
    IOrderRepository orderRepository) : ILoyaltyService
{
    public const int PointsPerTenThousandVnd = 1;
    public const int RedeemRatePoints = 100;
    public const decimal RedeemRateValueVnd = 10_000m;

    public LoyaltySummaryResponse GetRules() =>
        new(0, 0, PointsPerTenThousandVnd, RedeemRatePoints, RedeemRateValueVnd);

    public async Task<LoyaltySummaryResponse> GetSummaryAsync(string customerId, CancellationToken cancellationToken = default)
    {
        await SyncMissedEarnsForCustomerAsync(customerId, cancellationToken);

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
        await SyncMissedEarnsForCustomerAsync(customerId, cancellationToken);

        var transactions = await loyaltyRepository.GetByCustomerIdAsync(customerId, cancellationToken);
        return transactions
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new LoyaltyTransactionResponse(t.Id, t.Type, t.Points, t.Description, t.OrderId, t.CreatedAt))
            .ToList();
    }

    public async Task<int> SyncMissedEarnsForCustomerAsync(string customerId, CancellationToken cancellationToken = default)
    {
        var customer = await ResolveCustomerAsync(customerId, cancellationToken);
        if (customer is null) return 0;

        var paidOrders = await GetPaidOrdersForCustomerAsync(customer, cancellationToken);
        var synced = 0;

        foreach (var order in paidOrders)
        {
            if (await loyaltyRepository.GetEarnByOrderIdAsync(order.Id, cancellationToken) is not null)
                continue;

            if (string.IsNullOrWhiteSpace(order.CustomerId))
            {
                order.CustomerId = customer.Id;
                await orderRepository.UpdateAsync(order, cancellationToken);
            }

            await EarnPointsForOrderAsync(customer.Id, order.Id, order.TotalAmount, cancellationToken);
            synced++;
        }

        return synced;
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
        if (await loyaltyRepository.GetEarnByOrderIdAsync(orderId, cancellationToken) is not null)
            return;

        var points = CalculateEarnPoints(paidAmount);
        if (points <= 0) return;

        var customer = await ResolveCustomerAsync(customerId, cancellationToken);
        if (customer is null) return;

        customer.LoyaltyPoints += points;
        customer.TotalSpent += paidAmount;
        await customerRepository.UpdateAsync(customer, cancellationToken);

        await loyaltyRepository.CreateAsync(new LoyaltyTransaction
        {
            CustomerId = customer.Id,
            OrderId = orderId,
            Type = LoyaltyTransactionType.Earn,
            Points = points,
            Description = $"Tích {points} điểm từ đơn đã thanh toán",
        }, cancellationToken);
    }

    public async Task RefundRedeemedPointsAsync(string customerId, int points, string orderId, CancellationToken cancellationToken = default)
    {
        if (points <= 0) return;

        var customer = await customerRepository.GetByIdAsync(customerId, cancellationToken)
            ?? throw new NotFoundException("Customer not found.");

        customer.LoyaltyPoints += points;
        await customerRepository.UpdateAsync(customer, cancellationToken);

        await loyaltyRepository.CreateAsync(new LoyaltyTransaction
        {
            CustomerId = customerId,
            OrderId = orderId,
            Type = LoyaltyTransactionType.Adjust,
            Points = points,
            Description = $"Hoàn {points} điểm — đơn {orderId} đã hủy",
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

    private async Task<Customer?> ResolveCustomerAsync(string customerId, CancellationToken cancellationToken)
    {
        return await customerRepository.GetByIdAsync(customerId, cancellationToken)
            ?? await customerRepository.GetByFirebaseUidAsync(customerId, cancellationToken);
    }

    private async Task<IReadOnlyList<Order>> GetPaidOrdersForCustomerAsync(Customer customer, CancellationToken cancellationToken)
    {
        var byCustomerId = await orderRepository.GetAllAsync(OrderStatus.Paid, customerId: customer.Id, cancellationToken: cancellationToken);
        var byPhone = await orderRepository.GetAllAsync(OrderStatus.Paid, phone: customer.Phone, cancellationToken: cancellationToken);
        var normalizedPhone = PhoneNormalizer.Normalize(customer.Phone);

        return byCustomerId
            .Concat(byPhone.Where(o =>
                string.IsNullOrWhiteSpace(o.CustomerId)
                || o.CustomerId == customer.Id
                || o.CustomerId == customer.FirebaseUid
                || PhoneNormalizer.Normalize(o.CustomerPhone) == normalizedPhone))
            .GroupBy(o => o.Id)
            .Select(g => g.First())
            .ToList();
    }
}
