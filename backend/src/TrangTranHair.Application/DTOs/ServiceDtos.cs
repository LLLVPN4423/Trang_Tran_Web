using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.DTOs;

public sealed record ServiceResponse(
    string Id,
    string Name,
    string? Description,
    ServiceCategory Category,
    StylistLevel? StylistLevel,
    decimal? BasePrice,
    Dictionary<string, decimal>? PriceBySize,
    int? DurationMinutes,
    bool IsActive);

public sealed record CreateServiceRequest(
    string Name,
    string? Description,
    ServiceCategory Category,
    StylistLevel? StylistLevel,
    decimal? BasePrice,
    Dictionary<string, decimal>? PriceBySize,
    int? DurationMinutes,
    bool IsActive = true);

public sealed record UpdateServiceRequest(
    string Name,
    string? Description,
    ServiceCategory Category,
    StylistLevel? StylistLevel,
    decimal? BasePrice,
    Dictionary<string, decimal>? PriceBySize,
    int? DurationMinutes,
    bool IsActive);
