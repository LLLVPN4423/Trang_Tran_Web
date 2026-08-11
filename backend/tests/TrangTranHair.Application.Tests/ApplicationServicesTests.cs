using TrangTranHair.Application.Common;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Services;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;
using TrangTranHair.Infrastructure.Persistence.InMemory;
using Xunit;

namespace TrangTranHair.Application.Tests;

public class AccessTokenGeneratorTests
{
    [Fact]
    public void Matches_returns_true_for_equal_tokens()
    {
        var token = AccessTokenGenerator.Create();
        Assert.True(AccessTokenGenerator.Matches(token, token));
    }

    [Fact]
    public void Matches_returns_false_for_different_tokens()
    {
        Assert.False(AccessTokenGenerator.Matches(AccessTokenGenerator.Create(), AccessTokenGenerator.Create()));
    }
}

public class LoyaltyServiceTests
{
    [Fact]
    public async Task EarnPointsForOrder_is_idempotent()
    {
        var customers = new InMemoryCustomerRepository();
        var loyalty = new InMemoryLoyaltyRepository();
        var orders = new InMemoryOrderRepository();
        var service = new LoyaltyService(customers, loyalty, orders);

        var customer = new Customer
        {
            Id = "user-1",
            FirebaseUid = "user-1",
            Name = "Test",
            Phone = "0901111111",
        };
        await customers.CreateAsync(customer);

        await service.EarnPointsForOrderAsync("user-1", "order-1", 50_000m);
        await service.EarnPointsForOrderAsync("user-1", "order-1", 50_000m);

        var summary = await service.GetSummaryAsync("user-1");
        Assert.Equal(5, summary.Points);
        Assert.Equal(50_000m, summary.TotalSpent);
    }

    [Fact]
    public async Task SyncMissedEarns_backfills_paid_orders_by_phone()
    {
        var customers = new InMemoryCustomerRepository();
        var loyalty = new InMemoryLoyaltyRepository();
        var orders = new InMemoryOrderRepository();
        var service = new LoyaltyService(customers, loyalty, orders);

        await customers.CreateAsync(new Customer
        {
            Id = "user-2",
            FirebaseUid = "user-2",
            Name = "Guest Later",
            Phone = "0902222222",
        });

        await orders.CreateAsync(new Order
        {
            Id = "order-guest",
            CustomerPhone = "0902222222",
            CustomerName = "Guest Later",
            TotalAmount = 30_000m,
            Status = OrderStatus.Paid,
            PaymentCode = "DH12345678",
            AccessToken = AccessTokenGenerator.Create(),
        });

        var synced = await service.SyncMissedEarnsForCustomerAsync("user-2");
        var summary = await service.GetSummaryAsync("user-2");

        Assert.Equal(1, synced);
        Assert.Equal(3, summary.Points);
    }
}

public class OrderServiceLinkTests
{
    [Fact]
    public async Task LinkGuestOrders_assigns_customer_id_by_phone()
    {
        var services = new InMemoryServiceRepository();
        var products = new InMemoryProductRepository();
        var orders = new InMemoryOrderRepository();
        var promotions = new InMemoryPromotionRepository();
        var customers = new InMemoryCustomerRepository();
        var loyaltyRepo = new InMemoryLoyaltyRepository();
        var loyalty = new LoyaltyService(customers, loyaltyRepo, orders);
        var promotionService = new PromotionService(promotions);
        var orderService = new OrderService(services, products, orders, promotionService, loyalty, customers);

        await orders.CreateAsync(new Order
        {
            Id = "guest-order",
            CustomerName = "A",
            CustomerPhone = "0903333333",
            TotalAmount = 10_000m,
            Status = OrderStatus.Pending,
            PaymentCode = "DHABCDEFGH",
            AccessToken = AccessTokenGenerator.Create(),
        });

        var linked = await orderService.LinkGuestOrdersAsync("user-3", "0903333333");
        var order = await orders.GetByIdAsync("guest-order");

        Assert.Equal(1, linked);
        Assert.Equal("user-3", order!.CustomerId);
    }
}

public class PromotionServiceTests
{
    [Fact]
    public async Task ListActive_returns_only_active_unexpired()
    {
        var repo = new InMemoryPromotionRepository();
        var service = new PromotionService(repo);

        await repo.CreateAsync(new Promotion
        {
            Id = "p1",
            Code = "ACTIVE",
            Name = "Active",
            Type = PromotionType.FixedAmount,
            Value = 10_000,
            IsActive = true,
        });

        await repo.CreateAsync(new Promotion
        {
            Id = "p2",
            Code = "OFF",
            Name = "Inactive",
            Type = PromotionType.FixedAmount,
            Value = 10_000,
            IsActive = false,
        });

        var active = await service.ListActiveAsync();
        Assert.Single(active);
        Assert.Equal("ACTIVE", active[0].Code);
    }
}

public class OrderServiceStockTests
{
    [Fact]
    public async Task CreateOrder_reserves_product_stock_while_pending()
    {
        var services = new InMemoryServiceRepository();
        var products = new InMemoryProductRepository();
        var orders = new InMemoryOrderRepository();
        var promotions = new InMemoryPromotionRepository();
        var customers = new InMemoryCustomerRepository();
        var loyaltyRepo = new InMemoryLoyaltyRepository();
        var loyalty = new LoyaltyService(customers, loyaltyRepo, orders);
        var promotionService = new PromotionService(promotions);
        var orderService = new OrderService(services, products, orders, promotionService, loyalty, customers);

        await products.CreateAsync(new Product
        {
            Id = "prod-1",
            Name = "Oil",
            Price = 100_000,
            Stock = 2,
            IsActive = true,
        });

        var order = await orderService.CreateOrderAsync(new CreateOrderRequest(
            "A",
            "0909999999",
            null,
            null,
            [new CreateOrderItemRequest("prod-1", OrderItemType.Product, 1, null)]));

        var product = await products.GetByIdAsync("prod-1");
        var stored = await orders.GetByIdAsync(order.Id);

        Assert.Equal(OrderStatus.Pending, order.Status);
        Assert.Equal(1, product!.Stock);
        Assert.True(stored!.StockReserved);
    }

    [Fact]
    public async Task Cancel_pending_order_releases_reserved_stock()
    {
        var services = new InMemoryServiceRepository();
        var products = new InMemoryProductRepository();
        var orders = new InMemoryOrderRepository();
        var promotions = new InMemoryPromotionRepository();
        var customers = new InMemoryCustomerRepository();
        var loyaltyRepo = new InMemoryLoyaltyRepository();
        var loyalty = new LoyaltyService(customers, loyaltyRepo, orders);
        var promotionService = new PromotionService(promotions);
        var orderService = new OrderService(services, products, orders, promotionService, loyalty, customers);

        await products.CreateAsync(new Product
        {
            Id = "prod-2",
            Name = "Mask",
            Price = 50_000,
            Stock = 1,
            IsActive = true,
        });

        var created = await orderService.CreateOrderAsync(new CreateOrderRequest(
            "B",
            "0908888888",
            null,
            null,
            [new CreateOrderItemRequest("prod-2", OrderItemType.Product, 1, null)]));

        await orderService.UpdateStatusAsync(created.Id, OrderStatus.Cancelled);

        var product = await products.GetByIdAsync("prod-2");
        Assert.Equal(1, product!.Stock);
    }
}
