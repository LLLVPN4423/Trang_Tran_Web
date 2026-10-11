using System.Threading.RateLimiting;
using System.Text.Json.Serialization;
using TrangTranHair.Api.Extensions;
using TrangTranHair.Api.Middleware;
using TrangTranHair.Application;
using TrangTranHair.Infrastructure;

LoadRootEnvFile();
ResolveFirebaseCredentialsPath();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddOpenApi();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<TrangTranHair.Application.Interfaces.ICurrentUserService, TrangTranHair.Api.Services.CurrentUserService>();
builder.Services.AddFirebaseAuthentication(builder.Configuration);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("public-writes", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
});

builder.Services.AddCors(options =>
{
    var configuredOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
        ?? ["http://localhost:5173"];
    var originSet = new HashSet<string>(configuredOrigins, StringComparer.OrdinalIgnoreCase);

    options.AddPolicy("Frontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                if (originSet.Contains(origin)) return true;
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;
                if (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)) return true;
                if (uri.Host.EndsWith(".pages.dev", StringComparison.OrdinalIgnoreCase)) return true;
                return false;
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

var firebaseProjectId = app.Configuration["Firebase:ProjectId"];
if (string.IsNullOrWhiteSpace(firebaseProjectId))
{
    app.Logger.LogWarning(
        "Firebase:ProjectId chưa cấu hình — mọi API [Authorize] sẽ trả 401. Đặt FIREBASE_PROJECT_ID trong .env (phải khớp VITE_FIREBASE_PROJECT_ID).");
}
else if (firebaseProjectId.Contains("your-firebase-project", StringComparison.OrdinalIgnoreCase))
{
    app.Logger.LogWarning(
        "FIREBASE_PROJECT_ID vẫn là placeholder 'your-firebase-project-id' — đổi thành {Hint} trong .env",
        Environment.GetEnvironmentVariable("VITE_FIREBASE_PROJECT_ID") ?? "ID project Firebase thật");
}
else
{
    app.Logger.LogInformation("Firebase JWT validation enabled for project {ProjectId}", firebaseProjectId);
}

TrangTranHair.Infrastructure.DependencyInjection.LogPersistenceDiagnostics(app.Logger, app.Configuration);

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

static void LoadRootEnvFile()
{
    var envPath = FindUpwards(".env");
    if (envPath is null) return;

    foreach (var line in File.ReadAllLines(envPath))
    {
        var trimmed = line.Trim();
        if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith('#')) continue;
        var eq = trimmed.IndexOf('=');
        if (eq <= 0) continue;

        var key = trimmed[..eq].Trim();
        var value = trimmed[(eq + 1)..].Trim().Trim('"');
        Environment.SetEnvironmentVariable(key, value);
    }

    MapEnv("FIREBASE_PROJECT_ID", "Firebase__ProjectId");
    MapEnv("FIREBASE_CREDENTIALS_PATH", "Firebase__CredentialsPath");
    MapEnv("FIREBASE_ADMIN_UIDS", "Firebase__AdminUids");
    MapEnv("FIREBASE_SALON_ADMIN_UIDS", "Firebase__SalonAdminUids");
    MapEnv("SEPAY_WEBHOOK_SECRET", "SePay__WebhookSecret");
}

static void ResolveFirebaseCredentialsPath()
{
    var configured = Environment.GetEnvironmentVariable("Firebase__CredentialsPath")
        ?? "./firebase-service-account.json";

    if (Path.IsPathRooted(configured) && File.Exists(configured))
        return;

    var found = FindUpwards(Path.GetFileName(configured) ?? "firebase-service-account.json");
    if (found is not null)
        Environment.SetEnvironmentVariable("Firebase__CredentialsPath", found);
}

static string? FindUpwards(string fileName)
{
    var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
    while (dir is not null)
    {
        var candidate = Path.Combine(dir.FullName, fileName);
        if (File.Exists(candidate))
            return candidate;
        dir = dir.Parent;
    }

    return null;
}

static void MapEnv(string fromKey, string toKey)
{
    var value = Environment.GetEnvironmentVariable(fromKey);
    if (!string.IsNullOrWhiteSpace(value))
        Environment.SetEnvironmentVariable(toKey, value);
}
