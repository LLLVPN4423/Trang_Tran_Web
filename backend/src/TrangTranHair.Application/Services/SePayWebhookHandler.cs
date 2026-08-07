using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Services;

public sealed class SePayWebhookHandler(
    IOrderRepository orderRepository,
    ILoyaltyService loyaltyService,
    IConfiguration configuration,
    ILogger<SePayWebhookHandler> logger) : ISePayWebhookHandler
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public async Task<SePayWebhookResult> HandleAsync(
        string rawBody,
        string? signature,
        string? timestamp,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(rawBody))
            return new SePayWebhookResult(false, "Empty body.", 400);

        var secret = configuration["SePay:WebhookSecret"];
        if (!string.IsNullOrWhiteSpace(secret))
        {
            var validation = ValidateSignature(rawBody, signature, timestamp, secret);
            if (!validation.Success)
                return validation;
        }
        else
        {
            logger.LogWarning("SePay webhook secret not configured — signature validation skipped (dev only).");
        }

        SePayWebhookPayload? payload;
        try
        {
            payload = JsonSerializer.Deserialize<SePayWebhookPayload>(rawBody, JsonOptions);
        }
        catch (JsonException)
        {
            return new SePayWebhookResult(false, "Invalid JSON payload.", 400);
        }

        if (payload is null || payload.Id <= 0)
            return new SePayWebhookResult(false, "Invalid payload.", 400);

        if (!string.Equals(payload.TransferType, "in", StringComparison.OrdinalIgnoreCase))
            return new SePayWebhookResult(true, "Outgoing transfer ignored.");

        if (string.IsNullOrWhiteSpace(payload.Code))
            return new SePayWebhookResult(true, "No payment code — ignored.");

        var order = await orderRepository.GetByPaymentCodeAsync(payload.Code, cancellationToken);
        if (order is null)
        {
            logger.LogWarning("No order found for payment code {Code}", payload.Code);
            return new SePayWebhookResult(true, "Order not found — acknowledged.");
        }

        if (order.Status == OrderStatus.Paid)
            return new SePayWebhookResult(true, "Order already paid.");

        if (payload.TransferAmount != (int)order.TotalAmount)
        {
            logger.LogWarning(
                "Amount mismatch for order {OrderId}: expected {Expected}, got {Actual}",
                order.Id, order.TotalAmount, payload.TransferAmount);
            return new SePayWebhookResult(false, "Amount mismatch.", 400);
        }

        order.Status = OrderStatus.Paid;
        order.SePayTransactionId = payload.Id.ToString();
        order.PaidAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await orderRepository.UpdateAsync(order, cancellationToken);

        if (!string.IsNullOrWhiteSpace(order.CustomerId))
        {
            await loyaltyService.EarnPointsForOrderAsync(
                order.CustomerId,
                order.Id,
                order.TotalAmount,
                cancellationToken);
        }

        logger.LogInformation("Order {OrderId} marked as paid via SePay transaction {TxId}", order.Id, payload.Id);

        return new SePayWebhookResult(true, "Payment confirmed.");
    }

    private static SePayWebhookResult ValidateSignature(string rawBody, string? signature, string? timestamp, string secret)
    {
        if (string.IsNullOrWhiteSpace(signature) || string.IsNullOrWhiteSpace(timestamp))
            return new SePayWebhookResult(false, "Missing signature headers.", 401);

        if (!long.TryParse(timestamp, out var ts))
            return new SePayWebhookResult(false, "Invalid timestamp.", 401);

        if (Math.Abs(DateTimeOffset.UtcNow.ToUnixTimeSeconds() - ts) > 300)
            return new SePayWebhookResult(false, "Request expired.", 401);

        var expected = "sha256=" + ComputeHmac($"{timestamp}.{rawBody}", secret);

        var sigBytes = Encoding.UTF8.GetBytes(signature);
        var expBytes = Encoding.UTF8.GetBytes(expected);

        if (sigBytes.Length != expBytes.Length || !CryptographicOperations.FixedTimeEquals(sigBytes, expBytes))
            return new SePayWebhookResult(false, "Invalid signature.", 401);

        return new SePayWebhookResult(true, "Signature valid.");
    }

    private static string ComputeHmac(string data, string secret)
    {
        var hash = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
