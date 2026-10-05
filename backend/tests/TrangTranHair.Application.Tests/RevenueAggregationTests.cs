using TrangTranHair.Application.Services;
using Xunit;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Tests;

public class RevenueAggregationTests
{
    private static Order PaidOrder(
        OrderKind kind,
        decimal total,
        DateTime paidAtUtc,
        params (string name, OrderItemType type, int qty, decimal unit)[] lines)
    {
        return new Order
        {
            Id = Guid.NewGuid().ToString(),
            Kind = kind,
            Status = OrderStatus.Paid,
            TotalAmount = total,
            PaidAt = paidAtUtc,
            CreatedAt = paidAtUtc,
            PaymentMethod = kind == OrderKind.ServiceInvoice
                ? PaymentMethod.CashAtSalon
                : PaymentMethod.BankTransfer,
            Items = lines.Select(l => new OrderItem
            {
                Name = l.name,
                ItemType = l.type,
                Quantity = l.qty,
                UnitPrice = l.unit,
            }).ToList(),
        };
    }

    [Fact]
    public void BuildSummary_splits_service_and_retail_by_paid_at_vn_day()
    {
        var from = new DateOnly(2026, 3, 1);
        var to = new DateOnly(2026, 3, 2);
        // 2026-03-01 10:00 VN = 2026-03-01 03:00 UTC
        var day1Utc = RevenueAggregation.LocalDateStartUtc(from).AddHours(3);
        var day2Utc = RevenueAggregation.LocalDateStartUtc(to).AddHours(5);

        var orders = new[]
        {
            PaidOrder(OrderKind.ServiceInvoice, 500_000m, day1Utc, ("Cat toc", OrderItemType.Service, 1, 500_000m)),
            PaidOrder(OrderKind.Retail, 200_000m, day2Utc, ("Dau goi", OrderItemType.Product, 1, 200_000m)),
        };

        var summary = RevenueAggregation.BuildSummary(orders, from, to);

        Assert.Equal(500_000m, summary.Current.TotalService);
        Assert.Equal(200_000m, summary.Current.TotalRetail);
        Assert.Equal(700_000m, summary.Current.Total);
        Assert.Equal(2, summary.Current.OrderCount);
        Assert.Equal(2, summary.Daily.Count);
        Assert.Equal(500_000m, summary.Daily[0].Service);
        Assert.Equal(200_000m, summary.Daily[1].Retail);
    }

    [Fact]
    public void BuildSummary_computes_previous_period_percent_change()
    {
        var from = new DateOnly(2026, 3, 8);
        var to = new DateOnly(2026, 3, 14);
        var currentDay = RevenueAggregation.LocalDateStartUtc(from).AddHours(4);
        var prevDay = RevenueAggregation.LocalDateStartUtc(from.AddDays(-7)).AddHours(4);

        var orders = new[]
        {
            PaidOrder(OrderKind.ServiceInvoice, 1_000_000m, currentDay),
            PaidOrder(OrderKind.ServiceInvoice, 500_000m, prevDay),
        };

        var summary = RevenueAggregation.BuildSummary(orders, from, to);

        Assert.Equal(1_000_000m, summary.Current.Total);
        Assert.Equal(500_000m, summary.Comparison.Previous.Total);
        Assert.Equal(100m, summary.Comparison.PercentChangeTotal);
    }

    [Fact]
    public void BuildSummary_top_items_groups_by_name_and_type()
    {
        var from = new DateOnly(2026, 4, 1);
        var to = from;
        var at = RevenueAggregation.LocalDateStartUtc(from).AddHours(2);
        var orders = new[]
        {
            PaidOrder(OrderKind.ServiceInvoice, 600_000m, at,
                ("Nhuom", OrderItemType.Service, 1, 400_000m),
                ("Nhuom", OrderItemType.Service, 1, 200_000m)),
        };

        var summary = RevenueAggregation.BuildSummary(orders, from, to);
        var top = Assert.Single(summary.TopItems);
        Assert.Equal("Nhuom", top.Name);
        Assert.Equal(2, top.Quantity);
        Assert.Equal(600_000m, top.Revenue);
    }
}
