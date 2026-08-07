using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Infrastructure.Auth;

public sealed class FirebaseAuthService : IAuthService
{
    private readonly ILogger<FirebaseAuthService> _logger;
    private readonly bool _isConfigured;

    public FirebaseAuthService(IConfiguration configuration, ILogger<FirebaseAuthService> logger)
    {
        _logger = logger;
        _isConfigured = TryInitializeFirebase(configuration);
    }

    public async Task<bool> ValidateAdminClaimAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (!_isConfigured)
        {
            _logger.LogWarning("Firebase not configured — admin claim validation skipped.");
            return false;
        }

        try
        {
            var user = await FirebaseAuth.DefaultInstance.GetUserAsync(userId, cancellationToken);
            return user.CustomClaims.TryGetValue("admin", out var adminClaim)
                   && adminClaim is bool isAdmin && isAdmin;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate admin claim for user {UserId}", userId);
            return false;
        }
    }

    private static bool TryInitializeFirebase(IConfiguration configuration)
    {
        if (FirebaseApp.DefaultInstance is not null)
            return true;

        var projectId = configuration["Firebase:ProjectId"];
        var credentialsPath = configuration["Firebase:CredentialsPath"];

        if (string.IsNullOrWhiteSpace(projectId))
            return false;

        try
        {
            var options = new AppOptions { ProjectId = projectId };

            if (!string.IsNullOrWhiteSpace(credentialsPath) && File.Exists(credentialsPath))
            {
                options.Credential = GoogleCredential.FromFile(credentialsPath);
            }
            else
            {
                options.Credential = GoogleCredential.GetApplicationDefault();
            }

            FirebaseApp.Create(options);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
