using TrangTranHair.Application.DTOs;

namespace TrangTranHair.Application.Services;

public partial class OrderService
{
    public async Task<RevenueSummaryResponse> GetRevenueSummaryAsync(
        DateOnly fromLocal,
        DateOnly toLocal,
        CancellationToken cancellationToken = default)
    {
        var orders = await orderRepository.GetAllAsync(
            Domain.Enums.OrderStatus.Paid,
            phone: null,
            customerId: null,
            kind: null,
            appointmentId: null,
            cancellationToken);

        return RevenueAggregation.BuildSummary(orders, fromLocal, toLocal);
    }
}
