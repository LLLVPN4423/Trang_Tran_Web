using TrangTranHair.Application.DTOs;

namespace TrangTranHair.Application.Interfaces;

public interface ISePayWebhookHandler
{
    Task<SePayWebhookResult> HandleAsync(string rawBody, string? signature, string? timestamp, CancellationToken cancellationToken = default);
}

public sealed record SePayWebhookResult(bool Success, string Message, int StatusCode = 200);
