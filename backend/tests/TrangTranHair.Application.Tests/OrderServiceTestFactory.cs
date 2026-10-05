using TrangTranHair.Application.Services;
using TrangTranHair.Infrastructure.Persistence.InMemory;

namespace TrangTranHair.Application.Tests;

internal static class OrderServiceTestFactory
{
    public static (
        OrderService OrderService,
        InMemoryProductRepository Products,
        InMemoryServiceRepository Services,
        InMemoryOrderRepository Orders,
        InMemoryCustomerRepository Customers,
        InMemoryAppointmentRepository Appointments) Create()
    {
        var services = new InMemoryServiceRepository();
        var products = new InMemoryProductRepository();
        var orders = new InMemoryOrderRepository();
        var promotions = new InMemoryPromotionRepository();
        var customers = new InMemoryCustomerRepository();
        var loyaltyRepo = new InMemoryLoyaltyRepository();
        var appointments = new InMemoryAppointmentRepository();
        var loyalty = new LoyaltyService(customers, loyaltyRepo, orders);
        var promotionService = new PromotionService(promotions);
        var orderService = new OrderService(
            products,
            services,
            orders,
            promotionService,
            loyalty,
            customers,
            appointments);

        return (orderService, products, services, orders, customers, appointments);
    }
}
