using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Google.Cloud.Firestore;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Infrastructure.Firebase;
using TrangTranHair.Infrastructure.Persistence.Firestore;
using TrangTranHair.Infrastructure.Persistence.InMemory;

namespace TrangTranHair.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IAdminAllowlist, Auth.FirebaseAdminAllowlist>();
        services.AddSingleton<IAdminAccessService, Auth.AdminAccessService>();
        services.AddSingleton<IAuthService, Auth.FirebaseAuthService>();

        if (TryCreateFirestoreDb(configuration, out var firestoreDb, out var failureReason))
        {
            var projectId = configuration["Firebase:ProjectId"]!;
            PersistenceRuntimeInfo.SetFirestore(projectId);

            services.AddSingleton(firestoreDb);
            services.AddSingleton<IServiceRepository, FirestoreServiceRepository>();
            services.AddSingleton<IProductRepository, FirestoreProductRepository>();
            services.AddSingleton<IOrderRepository, FirestoreOrderRepository>();
            services.AddSingleton<ICustomerRepository, FirestoreCustomerRepository>();
            services.AddSingleton<IPromotionRepository, FirestorePromotionRepository>();
            services.AddSingleton<ILoyaltyRepository, FirestoreLoyaltyRepository>();
            services.AddSingleton<IAppointmentRepository, FirestoreAppointmentRepository>();
            services.AddSingleton<ISiteContentRepository, FirestoreSiteContentRepository>();
        }
        else
        {
            PersistenceRuntimeInfo.SetInMemory(failureReason ?? "Unknown reason");

            services.AddSingleton<IServiceRepository, InMemoryServiceRepository>();
            services.AddSingleton<IProductRepository, InMemoryProductRepository>();
            services.AddSingleton<IOrderRepository, InMemoryOrderRepository>();
            services.AddSingleton<ICustomerRepository, InMemoryCustomerRepository>();
            services.AddSingleton<IPromotionRepository, InMemoryPromotionRepository>();
            services.AddSingleton<ILoyaltyRepository, InMemoryLoyaltyRepository>();
            services.AddSingleton<IAppointmentRepository, InMemoryAppointmentRepository>();
            services.AddSingleton<ISiteContentRepository, InMemorySiteContentRepository>();
        }

        return services;
    }

    public static void LogPersistenceDiagnostics(ILogger logger, IConfiguration configuration)
    {
        var projectId = configuration["Firebase:ProjectId"];
        var saProjectId = FirebaseEnvironment.ReadServiceAccountProjectId(configuration["Firebase:CredentialsPath"]);

        if (PersistenceRuntimeInfo.Mode == "firestore")
        {
            logger.LogInformation(
                "Data persistence: Firestore (project {ProjectId}). Dữ liệu lưu vĩnh viễn trên Firebase.",
                PersistenceRuntimeInfo.ProjectId);
        }
        else
        {
            logger.LogWarning(
                "Data persistence: IN-MEMORY ONLY — {Detail}. Dữ liệu MẤT khi restart API. Sửa .env và Firestore (xem FIREBASE_SETUP.md).",
                PersistenceRuntimeInfo.Detail);
        }

        if (string.IsNullOrWhiteSpace(projectId))
        {
            logger.LogWarning("FIREBASE_PROJECT_ID chưa đặt trong .env");
        }
        else if (!string.IsNullOrWhiteSpace(saProjectId) &&
                 !string.Equals(projectId, saProjectId, StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning(
                "FIREBASE_PROJECT_ID ({ConfigProject}) khác project trong service account ({SaProject}). Đặt cùng một giá trị.",
                projectId,
                saProjectId);
        }

        if (!PersistenceRuntimeInfo.FirebaseAdminSdkReady)
        {
            logger.LogWarning(
                "Firebase Admin SDK chưa sẵn sàng — xác thực admin qua API có thể thất bại. Kiểm tra firebase-service-account.json.");
        }
    }

    private static bool TryCreateFirestoreDb(
        IConfiguration configuration,
        out FirestoreDb firestoreDb,
        out string? failureReason)
    {
        firestoreDb = null!;
        failureReason = null;

        var projectId = configuration["Firebase:ProjectId"];
        if (string.IsNullOrWhiteSpace(projectId))
        {
            failureReason = "FIREBASE_PROJECT_ID trống trong .env";
            return false;
        }

        if (projectId.Contains("your-firebase-project", StringComparison.OrdinalIgnoreCase))
        {
            failureReason = "FIREBASE_PROJECT_ID vẫn là placeholder — đổi thành ID project thật (khớp VITE_FIREBASE_PROJECT_ID)";
            return false;
        }

        var credentialsPath = configuration["Firebase:CredentialsPath"];
        var resolvedCredentials = FirebaseEnvironment.ResolveCredentialsPath(credentialsPath);
        if (resolvedCredentials is null)
        {
            failureReason = "Không tìm thấy firebase-service-account.json — tải từ Firebase Console";
            return false;
        }

        var saProjectId = FirebaseEnvironment.ReadServiceAccountProjectId(credentialsPath);
        if (!string.IsNullOrWhiteSpace(saProjectId) &&
            !string.Equals(projectId, saProjectId, StringComparison.OrdinalIgnoreCase))
        {
            failureReason =
                $"FIREBASE_PROJECT_ID ({projectId}) khác service account ({saProjectId})";
            return false;
        }

        try
        {
            var credential = FirebaseEnvironment.LoadCredential(credentialsPath);
            firestoreDb = new FirestoreDbBuilder
            {
                ProjectId = projectId,
                Credential = credential,
            }.Build();

            return true;
        }
        catch (Exception ex)
        {
            failureReason =
                $"Không kết nối Firestore: {ex.Message}. Tạo Firestore Database trên Firebase Console (asia-southeast1).";
            return false;
        }
    }
}
