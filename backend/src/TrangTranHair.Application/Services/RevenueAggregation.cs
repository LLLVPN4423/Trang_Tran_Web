using TrangTranHair.Application.DTOs;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Services;

public static class RevenueAggregation
{
    public static readonly TimeZoneInfo SalonTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById(
            OperatingSystem.IsWindows() ? "SE Asia Standard Time" : "Asia/Ho_Chi_Minh");

    public static RevenueSummaryResponse BuildSummary(
        IEnumerable<Order> paidOrders,
        DateOnly fromLocal,
        DateOnly toLocal)
    {
        if (toLocal < fromLocal)
            throw new ArgumentException("toLocal must be >= fromLocal.");

        var fromUtc = LocalDateStartUtc(fromLocal);
        var toUtcExclusive = LocalDateStartUtc(toLocal.AddDays(1));

        var inRange = paidOrders
            .Where(o => o.Status == OrderStatus.Paid)
            .Where(o =>
            {
                var at = o.PaidAt ?? o.CreatedAt;
                return at >= fromUtc && at < toUtcExclusive;
            })
            .ToList();

        var current = Totals(inRange);
        var spanDays = toLocal.DayNumber - fromLocal.DayNumber + 1;
        var prevTo = fromLocal.AddDays(-1);
        var prevFrom = prevTo.AddDays(-(spanDays - 1));
        var prevFromUtc = LocalDateStartUtc(prevFrom);
        var prevToUtcExclusive = LocalDateStartUtc(prevTo.AddDays(1));

        var previousOrders = paidOrders
            .Where(o => o.Status == OrderStatus.Paid)
            .Where(o =>
            {
                var at = o.PaidAt ?? o.CreatedAt;
                return at >= prevFromUtc && at < prevToUtcExclusive;
            })
            .ToList();

        var previous = Totals(previousOrders);
        decimal? pct = null;
        if (previous.Total > 0)
            pct = Math.Round((current.Total - previous.Total) / previous.Total * 100m, 1);
        else if (current.Total > 0)
            pct = 100m;

        var daily = BuildDaily(inRange, fromLocal, toLocal);
        var byPayment = inRange
            .GroupBy(o => o.PaymentMethod.ToString())
            .Select(g => new RevenuePaymentMethodBucket(
                g.Key,
                g.Sum(o => o.TotalAmount),
                g.Count()))
            .OrderByDescending(x => x.Amount)
            .ToList();

        var topItems = inRange
            .SelectMany(o => o.Items.Select(i => (Order: o, Item: i)))
            .GroupBy(x => (x.Item.Name, x.Item.ItemType))
            .Select(g => new RevenueTopItem(
                g.Key.Name,
                g.Key.ItemType.ToString(),
                g.Sum(x => x.Item.Quantity),
                g.Sum(x => x.Item.Subtotal)))
            .OrderByDescending(x => x.Revenue)
            .Take(10)
            .ToList();

        return new RevenueSummaryResponse(
            fromLocal,
            toLocal,
            current,
            new RevenuePreviousPeriodComparison(previous, pct),
            daily,
            byPayment,
            topItems);
    }

    public static DateTime LocalDateStartUtc(DateOnly localDate)
    {
        var localMidnight = localDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified);
        return TimeZoneInfo.ConvertTimeToUtc(localMidnight, SalonTimeZone);
    }

    private static RevenuePeriodTotals Totals(IReadOnlyList<Order> orders)
    {
        var service = orders.Where(o => o.Kind == OrderKind.ServiceInvoice).Sum(o => o.TotalAmount);
        var retail = orders.Where(o => o.Kind != OrderKind.ServiceInvoice).Sum(o => o.TotalAmount);
        return new RevenuePeriodTotals(service, retail, service + retail, orders.Count);
    }

    private static List<RevenueDailyBucket> BuildDaily(
        IReadOnlyList<Order> orders,
        DateOnly fromLocal,
        DateOnly toLocal)
    {
        var buckets = new Dictionary<DateOnly, (decimal Service, decimal Retail)>();
        for (var d = fromLocal; d <= toLocal; d = d.AddDays(1))
            buckets[d] = (0, 0);

        foreach (var o in orders)
        {
            var at = o.PaidAt ?? o.CreatedAt;
            var local = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(
                DateTime.SpecifyKind(at, DateTimeKind.Utc),
                SalonTimeZone));
            if (!buckets.TryGetValue(local, out var acc))
                continue;
            if (o.Kind == OrderKind.ServiceInvoice)
                buckets[local] = (acc.Service + o.TotalAmount, acc.Retail);
            else
                buckets[local] = (acc.Service, acc.Retail + o.TotalAmount);
        }

        return buckets
            .OrderBy(kv => kv.Key)
            .Select(kv => new RevenueDailyBucket(
                kv.Key,
                kv.Value.Service,
                kv.Value.Retail,
                kv.Value.Service + kv.Value.Retail))
            .ToList();
    }
}
