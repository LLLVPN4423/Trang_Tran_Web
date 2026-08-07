using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.DTOs;

public sealed record LoyaltySummaryResponse(
    int Points,
    decimal TotalSpent,
    int PointsPerTenThousandVnd,
    int RedeemRatePoints,
    decimal RedeemRateValueVnd);

public sealed record LoyaltyTransactionResponse(
    string Id,
    LoyaltyTransactionType Type,
    int Points,
    string Description,
    string? OrderId,
    DateTime CreatedAt);

public sealed record AdjustLoyaltyRequest(
    string CustomerId,
    int Points,
    string Description);
