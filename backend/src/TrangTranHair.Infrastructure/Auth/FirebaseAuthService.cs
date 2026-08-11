using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Infrastructure.Firebase;

namespace TrangTranHair.Infrastructure.Auth;

public sealed class FirebaseAuthService : IAuthService
{
    private readonly ILogger<FirebaseAuthService> _logger;
    private readonly IAdminAllowlist _allowlist;
    private readonly bool _isConfigured;

    public FirebaseAuthService(
        IConfiguration configuration,
        IAdminAllowlist allowlist,
        ILogger<FirebaseAuthService> logger)
    {
        _logger = logger;
        _allowlist = allowlist;
        _isConfigured = TryInitializeFirebase(configuration);
        PersistenceRuntimeInfo.FirebaseAdminSdkReady = _isConfigured;
    }

    public async Task<bool> ValidateAdminClaimAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (!_allowlist.Contains(userId))
            return false;

        if (!_isConfigured)
        {
            _logger.LogWarning("Firebase Admin SDK chưa cấu hình — không thể xác minh admin claim.");
            return false;
        }

        try
        {
            var user = await FirebaseAuth.DefaultInstance.GetUserAsync(userId, cancellationToken);
            if (!user.CustomClaims.TryGetValue("admin", out var adminClaim))
                return false;

            return adminClaim switch
            {
                bool isAdmin => isAdmin,
                string text => text.Equals("true", StringComparison.OrdinalIgnoreCase) || text == "1",
                _ => false,
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate admin claim for user {UserId}", userId);
            return false;
        }
    }

    private bool TryInitializeFirebase(IConfiguration configuration)
    {
        if (FirebaseApp.DefaultInstance is not null)
            return true;

        var projectId = configuration["Firebase:ProjectId"];
        if (string.IsNullOrWhiteSpace(projectId) ||
            projectId.Contains("your-firebase-project", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Firebase Admin SDK: FIREBASE_PROJECT_ID chưa cấu hình đúng.");
            return false;
        }

        try
        {
            var options = new AppOptions { ProjectId = projectId };
            var credential = FirebaseEnvironment.LoadCredential(configuration["Firebase:CredentialsPath"]);

            if (credential is not null)
            {
                options.Credential = credential;
            }
            else
            {
                _logger.LogWarning("Firebase Admin SDK: không tìm thấy service account JSON.");
                options.Credential = GoogleCredential.GetApplicationDefault();
            }

            FirebaseApp.Create(options);
            _logger.LogInformation("Firebase Admin SDK initialized for project {ProjectId}", projectId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Firebase Admin SDK initialization failed.");
            return false;
        }
    }
}
