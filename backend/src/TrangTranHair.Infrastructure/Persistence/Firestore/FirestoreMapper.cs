using Google.Cloud.Firestore;

namespace TrangTranHair.Infrastructure.Persistence.Firestore;

internal static class FirestoreMapper
{
    public static Timestamp ToTimestamp(DateTime utc) =>
        Timestamp.FromDateTime(DateTime.SpecifyKind(utc, DateTimeKind.Utc));

    public static DateTime FromTimestamp(Timestamp ts) => ts.ToDateTime();

    public static DateTime? FromTimestamp(Timestamp? ts) =>
        ts is null ? null : ts.Value.ToDateTime();

    public static Dictionary<string, decimal>? ToDecimalDict(Dictionary<string, double>? source) =>
        source?.ToDictionary(kv => kv.Key, kv => (decimal)kv.Value);

    public static Dictionary<string, double>? ToDoubleDict(Dictionary<string, decimal>? source) =>
        source?.ToDictionary(kv => kv.Key, kv => (double)kv.Value);
}
