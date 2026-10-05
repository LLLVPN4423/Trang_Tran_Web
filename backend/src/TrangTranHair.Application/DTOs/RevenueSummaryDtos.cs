namespace TrangTranHair.Application.DTOs;

public record RevenuePeriodTotals(
    decimal TotalService,
    decimal TotalRetail,
    decimal Total,
    int OrderCount);

public record RevenuePreviousPeriodComparison(
    RevenuePeriodTotals Previous,
    decimal? PercentChangeTotal);

public record RevenueDailyBucket(
    DateOnly DateLocal,
    decimal Service,
    decimal Retail,
    decimal Total);

public record RevenuePaymentMethodBucket(
    string PaymentMethod,
    decimal Amount,
    int OrderCount);

public record RevenueTopItem(
    string Name,
    string ItemType,
    int Quantity,
    decimal Revenue);

public record RevenueSummaryResponse(
    DateOnly FromLocal,
    DateOnly ToLocal,
    RevenuePeriodTotals Current,
    RevenuePreviousPeriodComparison Comparison,
    IReadOnlyList<RevenueDailyBucket> Daily,
    IReadOnlyList<RevenuePaymentMethodBucket> ByPaymentMethod,
    IReadOnlyList<RevenueTopItem> TopItems);
