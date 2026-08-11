using Google.Apis.Auth.OAuth2;

namespace TrangTranHair.Infrastructure.Firebase;

public static class FirebaseEnvironment
{
    public static string? ResolveCredentialsPath(string? configuredPath = null)
    {
        configuredPath ??= "./firebase-service-account.json";

        if (Path.IsPathRooted(configuredPath) && File.Exists(configuredPath))
            return configuredPath;

        var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (dir is not null)
        {
            var candidate = Path.Combine(dir.FullName, configuredPath);
            if (File.Exists(candidate))
                return candidate;

            var fileName = Path.GetFileName(configuredPath);
            if (!string.IsNullOrEmpty(fileName) && fileName != configuredPath)
            {
                candidate = Path.Combine(dir.FullName, fileName);
                if (File.Exists(candidate))
                    return candidate;
            }

            dir = dir.Parent;
        }

        var envCredentials = Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS");
        if (!string.IsNullOrWhiteSpace(envCredentials) && File.Exists(envCredentials))
            return envCredentials;

        return null;
    }

    public static GoogleCredential? LoadCredential(string? configuredPath = null)
    {
        var resolved = ResolveCredentialsPath(configuredPath);
        if (resolved is null)
            return null;

        return GoogleCredential.FromFile(resolved);
    }

    public static string? ReadServiceAccountProjectId(string? configuredPath = null)
    {
        var resolved = ResolveCredentialsPath(configuredPath);
        if (resolved is null)
            return null;

        try
        {
            using var stream = File.OpenRead(resolved);
            using var doc = System.Text.Json.JsonDocument.Parse(stream);
            return doc.RootElement.TryGetProperty("project_id", out var id)
                ? id.GetString()
                : null;
        }
        catch
        {
            return null;
        }
    }
}
