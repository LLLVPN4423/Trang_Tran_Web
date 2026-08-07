using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.DTOs;

public sealed record PromotionResponse(
    string Id,
    string Code,
    string Name,
    string? Description,
    PromotionType Type,
    decimal Value,
    decimal MinOrderAmount,
    int? MaxUses,
    int UsedCount,
    DateTime? ExpiresAt,
    bool IsActive);

public sealed record CreatePromotionRequest(
    string Code,
    string Name,
    string? Description,
    PromotionType Type,
    decimal Value,
    decimal MinOrderAmount,
    int? MaxUses,
    DateTime? ExpiresAt,
    bool IsActive = true);

public sealed record UpdatePromotionRequest(
    string Code,
    string Name,
    string? Description,
    PromotionType Type,
    decimal Value,
    decimal MinOrderAmount,
    int? MaxUses,
    DateTime? ExpiresAt,
    bool IsActive);

public sealed record ValidatePromotionRequest(
    string Code,
    decimal SubtotalAmount);

public sealed record ValidatePromotionResponse(
    bool IsValid,
    string? Message,
    decimal DiscountAmount,
    string? PromotionId,
    string? PromotionName);
