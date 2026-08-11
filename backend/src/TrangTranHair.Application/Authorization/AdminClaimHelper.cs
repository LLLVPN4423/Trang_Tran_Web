using System.Security.Claims;

namespace TrangTranHair.Application.Authorization;

public static class AdminClaimHelper
{
    public static bool HasAdminClaim(ClaimsPrincipal user) =>
        user.Claims.Any(c =>
            c.Type is "admin" &&
            IsTruthyAdminValue(c.Value));

    public static string? GetUserId(ClaimsPrincipal user) =>
        user.FindFirst("user_id")?.Value
        ?? user.FindFirst("sub")?.Value
        ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    internal static bool IsTruthyAdminValue(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        (value.Equals("true", StringComparison.OrdinalIgnoreCase) || value == "1");
}
