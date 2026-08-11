using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Interfaces;

public interface ICustomerRepository
{
    Task<Customer?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<Customer?> GetByFirebaseUidAsync(string firebaseUid, CancellationToken cancellationToken = default);
    Task<Customer> CreateAsync(Customer customer, CancellationToken cancellationToken = default);
    Task<Customer> UpdateAsync(Customer customer, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Customer>> GetAllAsync(CancellationToken cancellationToken = default);
}

public interface IPromotionRepository
{
    Task<Promotion?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<Promotion?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Promotion>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Promotion> CreateAsync(Promotion promotion, CancellationToken cancellationToken = default);
    Task<Promotion> UpdateAsync(Promotion promotion, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}

public interface ILoyaltyRepository
{
    Task<IReadOnlyList<LoyaltyTransaction>> GetByCustomerIdAsync(string customerId, CancellationToken cancellationToken = default);
    Task<LoyaltyTransaction?> GetEarnByOrderIdAsync(string orderId, CancellationToken cancellationToken = default);
    Task<LoyaltyTransaction> CreateAsync(LoyaltyTransaction transaction, CancellationToken cancellationToken = default);
}

public interface ICurrentUserService
{
    string? UserId { get; }
    bool IsAuthenticated { get; }
}
