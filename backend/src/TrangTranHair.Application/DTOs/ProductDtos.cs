namespace TrangTranHair.Application.DTOs;

public sealed record ProductResponse(
    string Id,
    string Name,
    string? Description,
    string Brand,
    decimal Price,
    int Stock,
    string? ImageUrl,
    bool IsActive);

public sealed record CreateProductRequest(
    string Name,
    string? Description,
    string Brand,
    decimal Price,
    int Stock,
    string? ImageUrl,
    bool IsActive = true);

public sealed record UpdateProductRequest(
    string Name,
    string? Description,
    string Brand,
    decimal Price,
    int Stock,
    string? ImageUrl,
    bool IsActive);
