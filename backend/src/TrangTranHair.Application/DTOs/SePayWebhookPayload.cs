namespace TrangTranHair.Application.DTOs;

public sealed record SePayWebhookPayload(
    int Id,
    string? Gateway,
    string? TransactionDate,
    string? AccountNumber,
    string? Code,
    string? Content,
    int TransferAmount,
    string? TransferType,
    string? ReferenceCode);
