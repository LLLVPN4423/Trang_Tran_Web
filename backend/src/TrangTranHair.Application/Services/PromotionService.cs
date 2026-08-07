using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Services;

public sealed class PromotionService(IPromotionRepository promotionRepository) : IPromotionService
{
    public async Task<IReadOnlyList<PromotionResponse>> ListAsync(CancellationToken cancellationToken = default)
    {
        var promotions = await promotionRepository.GetAllAsync(cancellationToken);
        return promotions.Select(Map).ToList();
    }

    public async Task<PromotionResponse> GetAsync(string id, CancellationToken cancellationToken = default)
    {
        var promotion = await promotionRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Promotion '{id}' not found.");
        return Map(promotion);
    }

    public async Task<PromotionResponse> CreateAsync(CreatePromotionRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRequest(request.Code, request.Value, request.Type);

        var promotion = new Promotion
        {
            Code = request.Code.Trim().ToUpperInvariant(),
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Type = request.Type,
            Value = request.Value,
            MinOrderAmount = request.MinOrderAmount,
            MaxUses = request.MaxUses,
            ExpiresAt = request.ExpiresAt,
            IsActive = request.IsActive,
        };

        var created = await promotionRepository.CreateAsync(promotion, cancellationToken);
        return Map(created);
    }

    public async Task<PromotionResponse> UpdateAsync(string id, UpdatePromotionRequest request, CancellationToken cancellationToken = default)
    {
        var promotion = await promotionRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Promotion '{id}' not found.");

        ValidateRequest(request.Code, request.Value, request.Type);

        promotion.Code = request.Code.Trim().ToUpperInvariant();
        promotion.Name = request.Name.Trim();
        promotion.Description = request.Description?.Trim();
        promotion.Type = request.Type;
        promotion.Value = request.Value;
        promotion.MinOrderAmount = request.MinOrderAmount;
        promotion.MaxUses = request.MaxUses;
        promotion.ExpiresAt = request.ExpiresAt;
        promotion.IsActive = request.IsActive;

        var updated = await promotionRepository.UpdateAsync(promotion, cancellationToken);
        return Map(updated);
    }

    public Task DeleteAsync(string id, CancellationToken cancellationToken = default) =>
        promotionRepository.DeleteAsync(id, cancellationToken);

    public async Task<ValidatePromotionResponse> ValidateAsync(string code, decimal subtotalAmount, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(code))
            return new ValidatePromotionResponse(false, "Mã khuyến mãi trống.", 0, null, null);

        var promotion = await promotionRepository.GetByCodeAsync(code.Trim().ToUpperInvariant(), cancellationToken);
        if (promotion is null || !promotion.IsActive)
            return new ValidatePromotionResponse(false, "Mã khuyến mãi không hợp lệ.", 0, null, null);

        if (promotion.ExpiresAt is not null && promotion.ExpiresAt < DateTime.UtcNow)
            return new ValidatePromotionResponse(false, "Mã khuyến mãi đã hết hạn.", 0, null, null);

        if (promotion.MaxUses is not null && promotion.UsedCount >= promotion.MaxUses)
            return new ValidatePromotionResponse(false, "Mã khuyến mãi đã hết lượt sử dụng.", 0, null, null);

        if (subtotalAmount < promotion.MinOrderAmount)
            return new ValidatePromotionResponse(false, $"Đơn tối thiểu {promotion.MinOrderAmount:N0}đ.", 0, null, null);

        var discount = promotion.Type switch
        {
            PromotionType.Percentage => Math.Round(subtotalAmount * promotion.Value / 100m, 0),
            PromotionType.FixedAmount => promotion.Value,
            _ => 0m
        };

        discount = Math.Min(discount, subtotalAmount);
        if (discount <= 0)
            return new ValidatePromotionResponse(false, "Không thể áp dụng khuyến mãi.", 0, null, null);

        return new ValidatePromotionResponse(true, null, discount, promotion.Id, promotion.Name);
    }

    public async Task ApplyUsageAsync(string promotionId, CancellationToken cancellationToken = default)
    {
        var promotion = await promotionRepository.GetByIdAsync(promotionId, cancellationToken);
        if (promotion is null) return;

        promotion.UsedCount++;
        await promotionRepository.UpdateAsync(promotion, cancellationToken);
    }

    private static void ValidateRequest(string code, decimal value, PromotionType type)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new ValidationException("code", "Promotion code is required.");

        if (value <= 0)
            throw new ValidationException("value", "Promotion value must be positive.");

        if (type == PromotionType.Percentage && value > 100)
            throw new ValidationException("value", "Percentage cannot exceed 100.");
    }

    private static PromotionResponse Map(Promotion promotion) =>
        new(
            promotion.Id,
            promotion.Code,
            promotion.Name,
            promotion.Description,
            promotion.Type,
            promotion.Value,
            promotion.MinOrderAmount,
            promotion.MaxUses,
            promotion.UsedCount,
            promotion.ExpiresAt,
            promotion.IsActive);
}
