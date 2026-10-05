using Microsoft.Extensions.DependencyInjection;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Application.Services;

namespace TrangTranHair.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IDataSeedService, DataSeedService>();
        services.AddScoped<ISePayWebhookHandler, SePayWebhookHandler>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IPromotionService, PromotionService>();
        services.AddScoped<ILoyaltyService, LoyaltyService>();
        services.AddScoped<IAppointmentService, AppointmentService>();
        services.AddScoped<ISiteContentService, SiteContentService>();
        return services;
    }
}
