using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Services;

public sealed class OrderService(
    IServiceRepository serviceRepository,
    IProductRepository productRepository,
    IOrderRepository orderRepository) : IOrderService
{
    public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRequest(request);

        var orderItems = new List<OrderItem>();
        decimal total = 0;

        foreach (var item in request.Items)
        {
            var orderItem = item.ItemType switch
            {
                OrderItemType.Service => await BuildServiceItemAsync(item, cancellationToken),
                OrderItemType.Product => await BuildProductItemAsync(item, cancellationToken),
                _ => throw new ValidationException("itemType", "Invalid item type.")
            };

            orderItems.Add(orderItem);
            total += orderItem.Subtotal;
        }

        var order = new Order
        {
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CustomerEmail = request.CustomerEmail?.Trim(),
            Notes = request.Notes?.Trim(),
            Items = orderItems,
            TotalAmount = total,
            Status = OrderStatus.Pending,
            PaymentCode = $"DH{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}"
        };

        var saved = await orderRepository.CreateAsync(order, cancellationToken);
        return MapToResponse(saved);
    }

    public async Task<OrderResponse> GetOrderAsync(string id, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order '{id}' not found.");

        return MapToResponse(order);
    }

    private static void ValidateRequest(CreateOrderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName))
            throw new ValidationException("customerName", "Customer name is required.");

        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
            throw new ValidationException("customerPhone", "Customer phone is required.");

        if (request.Items is null || request.Items.Count == 0)
            throw new ValidationException("items", "At least one item is required.");
    }

    private async Task<OrderItem> BuildServiceItemAsync(CreateOrderItemRequest item, CancellationToken cancellationToken)
    {
        var service = await serviceRepository.GetByIdAsync(item.ItemId, cancellationToken)
            ?? throw new NotFoundException($"Service '{item.ItemId}' not found.");

        if (!service.IsActive)
            throw new ValidationException("itemId", $"Service '{service.Name}' is not available.");

        if (item.Quantity < 1)
            throw new ValidationException("quantity", "Quantity must be at least 1.");

        var unitPrice = service.ResolvePrice(item.HairSize);

        return new OrderItem
        {
            ItemId = service.Id,
            ItemType = OrderItemType.Service,
            Name = service.Name,
            Quantity = item.Quantity,
            UnitPrice = unitPrice,
            HairSize = item.HairSize
        };
    }

    private async Task<OrderItem> BuildProductItemAsync(CreateOrderItemRequest item, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(item.ItemId, cancellationToken)
            ?? throw new NotFoundException($"Product '{item.ItemId}' not found.");

        if (!product.IsActive)
            throw new ValidationException("itemId", $"Product '{product.Name}' is not available.");

        if (item.Quantity < 1)
            throw new ValidationException("quantity", "Quantity must be at least 1.");

        if (product.Stock < item.Quantity)
            throw new ValidationException("quantity", $"Insufficient stock for '{product.Name}'.");

        return new OrderItem
        {
            ItemId = product.Id,
            ItemType = OrderItemType.Product,
            Name = product.Name,
            Quantity = item.Quantity,
            UnitPrice = product.Price
        };
    }

    private static OrderResponse MapToResponse(Order order) =>
        new(
            order.Id,
            order.CustomerName,
            order.CustomerPhone,
            order.CustomerEmail,
            order.Notes,
            order.Items.Select(i => new OrderItemResponse(
                i.ItemId, i.ItemType, i.Name, i.Quantity, i.UnitPrice, i.HairSize, i.Subtotal)).ToList(),
            order.TotalAmount,
            order.Status,
            order.PaymentCode,
            order.CreatedAt);
}
