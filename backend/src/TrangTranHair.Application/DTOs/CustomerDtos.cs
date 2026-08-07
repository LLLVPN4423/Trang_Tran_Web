namespace TrangTranHair.Application.DTOs;

public sealed record SyncCustomerRequest(
    string Name,
    string Phone,
    string? Email);

public sealed record CustomerResponse(
    string Id,
    string Name,
    string Phone,
    string? Email,
    int LoyaltyPoints,
    decimal TotalSpent,
    DateTime CreatedAt);

public sealed record UpdateCustomerRequest(
    string Name,
    string Phone,
    string? Email);
