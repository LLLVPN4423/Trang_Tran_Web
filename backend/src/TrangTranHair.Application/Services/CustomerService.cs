using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;

namespace TrangTranHair.Application.Services;

public sealed class CustomerService(
    ICustomerRepository customerRepository,
    ILoyaltyService loyaltyService,
    IOrderService orderService) : ICustomerService
{
    public async Task<CustomerResponse> SyncAsync(string firebaseUid, SyncCustomerRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ValidationException("name", "Họ tên là bắt buộc.");
        if (string.IsNullOrWhiteSpace(request.Phone))
            throw new ValidationException("phone", "Số điện thoại là bắt buộc.");

        var existing = await customerRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken);
        CustomerResponse response;
        if (existing is not null)
        {
            existing.Name = request.Name.Trim();
            existing.Phone = request.Phone.Trim();
            existing.Email = request.Email?.Trim();
            var updated = await customerRepository.UpdateAsync(existing, cancellationToken);
            response = Map(updated);
        }
        else
        {
            var customer = new Customer
            {
                Id = firebaseUid,
                FirebaseUid = firebaseUid,
                Name = request.Name.Trim(),
                Phone = request.Phone.Trim(),
                Email = request.Email?.Trim(),
            };

            var created = await customerRepository.CreateAsync(customer, cancellationToken);
            response = Map(created);
        }

        await orderService.LinkGuestOrdersAsync(response.Id, response.Phone, cancellationToken);
        await loyaltyService.SyncMissedEarnsForCustomerAsync(response.Id, cancellationToken);

        var refreshed = await customerRepository.GetByIdAsync(response.Id, cancellationToken)
            ?? await customerRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken);
        return refreshed is null ? response : Map(refreshed);
    }

    public async Task<CustomerResponse> GetMeAsync(string firebaseUid, CancellationToken cancellationToken = default)
    {
        var customer = await customerRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken)
            ?? throw new NotFoundException("Customer profile not found. Call sync first.");
        return Map(customer);
    }

    public async Task<CustomerResponse> UpdateMeAsync(string firebaseUid, UpdateCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var customer = await customerRepository.GetByFirebaseUidAsync(firebaseUid, cancellationToken)
            ?? throw new NotFoundException("Customer profile not found.");

        customer.Name = request.Name.Trim();
        customer.Phone = request.Phone.Trim();
        customer.Email = request.Email?.Trim();

        var updated = await customerRepository.UpdateAsync(customer, cancellationToken);
        return Map(updated);
    }

    public async Task<IReadOnlyList<CustomerResponse>> ListAsync(CancellationToken cancellationToken = default)
    {
        var customers = await customerRepository.GetAllAsync(cancellationToken);
        return customers.Select(Map).ToList();
    }

    private static CustomerResponse Map(Customer customer) =>
        new(customer.Id, customer.Name, customer.Phone, customer.Email, customer.LoyaltyPoints, customer.TotalSpent, customer.CreatedAt);
}
