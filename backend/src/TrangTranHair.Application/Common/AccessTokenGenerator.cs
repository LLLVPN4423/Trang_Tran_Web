using System.Security.Cryptography;

namespace TrangTranHair.Application.Common;

public static class AccessTokenGenerator
{
    public static string Create() =>
        Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();

    public static bool Matches(string? expected, string? provided)
    {
        if (string.IsNullOrWhiteSpace(expected) || string.IsNullOrWhiteSpace(provided))
            return false;

        var left = expected.Trim();
        var right = provided.Trim();
        if (left.Length != right.Length)
            return false;

        return CryptographicOperations.FixedTimeEquals(
            System.Text.Encoding.UTF8.GetBytes(left),
            System.Text.Encoding.UTF8.GetBytes(right));
    }
}
