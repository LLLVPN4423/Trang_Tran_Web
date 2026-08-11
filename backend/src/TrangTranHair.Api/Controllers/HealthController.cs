using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Infrastructure.Firebase;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController(IConfiguration configuration, IAdminAllowlist adminAllowlist) : ControllerBase
{
    [HttpGet]
    public IActionResult Get() =>
        Ok(new
        {
            status = "healthy",
            service = "TrangTranHair.Api",
            timestamp = DateTime.UtcNow,
            persistence = new
            {
                mode = PersistenceRuntimeInfo.Mode,
                detail = PersistenceRuntimeInfo.Detail,
                projectId = PersistenceRuntimeInfo.ProjectId,
                firebaseAdminSdk = PersistenceRuntimeInfo.FirebaseAdminSdkReady,
            },
            firebase = new
            {
                configuredProjectId = configuration["Firebase:ProjectId"],
                credentialsFound = FirebaseEnvironment.ResolveCredentialsPath(configuration["Firebase:CredentialsPath"]) is not null,
                serviceAccountProjectId = FirebaseEnvironment.ReadServiceAccountProjectId(configuration["Firebase:CredentialsPath"]),
                adminAllowlistConfigured = adminAllowlist.IsConfigured,
                adminAllowlistCount = adminAllowlist.AllowedUids.Count,
            },
        });

    [HttpGet("protected")]
    [Authorize]
    public IActionResult GetProtected() =>
        Ok(new
        {
            status = "authenticated",
            userId = User.FindFirst("user_id")?.Value ?? User.FindFirst("sub")?.Value,
            timestamp = DateTime.UtcNow,
        });

    [HttpGet("admin")]
    [Authorize(Policy = "Admin")]
    public IActionResult GetAdmin() =>
        Ok(new
        {
            status = "admin",
            message = "Admin access granted.",
            timestamp = DateTime.UtcNow,
        });
}
