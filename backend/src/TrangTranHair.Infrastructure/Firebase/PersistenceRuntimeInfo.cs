namespace TrangTranHair.Infrastructure.Firebase;

/// <summary>Startup persistence diagnostics exposed via /api/health.</summary>
public static class PersistenceRuntimeInfo
{
    public static string Mode { get; private set; } = "unknown";
    public static string? Detail { get; private set; }
    public static string? ProjectId { get; private set; }
    public static bool FirebaseAdminSdkReady { get; set; }

    public static void SetFirestore(string projectId) =>
        Set("firestore", projectId, "Firestore connected");

    public static void SetInMemory(string reason) =>
        Set("inmemory", null, reason);

    private static void Set(string mode, string? projectId, string detail)
    {
        Mode = mode;
        ProjectId = projectId;
        Detail = detail;
    }
}
