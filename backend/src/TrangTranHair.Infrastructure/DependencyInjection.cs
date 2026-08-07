using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Infrastructure.Persistence.Firestore;
using TrangTranHair.Infrastructure.Persistence.InMemory;

namespace TrangTranHair.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IAuthService, Auth.FirebaseAuthService>();

        if (TryCreateFirestoreDb(configuration, out var firestoreDb))
        {
            services.AddSingleton(firestoreDb);
            services.AddSingleton<IServiceRepository, FirestoreServiceRepository>();
            services.AddSingleton<IProductRepository, FirestoreProductRepository>();
            services.AddSingleton<IOrderRepository, FirestoreOrderRepository>();
            services.AddSingleton<ICustomerRepository, FirestoreCustomerRepository>();
            services.AddSingleton<IPromotionRepository, FirestorePromotionRepository>();
            services.AddSingleton<ILoyaltyRepository, FirestoreLoyaltyRepository>();
            services.AddSingleton<IAppointmentRepository, FirestoreAppointmentRepository>();
        }
        else
        {
            services.AddSingleton<IServiceRepository, InMemoryServiceRepository>();
            services.AddSingleton<IProductRepository, InMemoryProductRepository>();
            services.AddSingleton<IOrderRepository, InMemoryOrderRepository>();
            services.AddSingleton<ICustomerRepository, InMemoryCustomerRepository>();
            services.AddSingleton<IPromotionRepository, InMemoryPromotionRepository>();
            services.AddSingleton<ILoyaltyRepository, InMemoryLoyaltyRepository>();
            services.AddSingleton<IAppointmentRepository, InMemoryAppointmentRepository>();
        }

        return services;
    }

    private static bool TryCreateFirestoreDb(IConfiguration configuration, out FirestoreDb firestoreDb)
    {
        firestoreDb = null!;

        var projectId = configuration["Firebase:ProjectId"];
        if (string.IsNullOrWhiteSpace(projectId))
            return false;

        var credentialsPath = configuration["Firebase:CredentialsPath"];
        var hasCredentials = (!string.IsNullOrWhiteSpace(credentialsPath) && File.Exists(credentialsPath))
            || !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS"));

        if (!hasCredentials)
            return false;

        try
        {
            if (!string.IsNullOrWhiteSpace(credentialsPath) && File.Exists(credentialsPath))
            {
                var credential = GoogleCredential.FromFile(credentialsPath);
                firestoreDb = new FirestoreDbBuilder
                {
                    ProjectId = projectId,
                    Credential = credential
                }.Build();
            }
            else
            {
                firestoreDb = FirestoreDb.Create(projectId);
            }

            return true;
        }
        catch
        {
            return false;
        }
    }
}
