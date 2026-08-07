using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Services;

public sealed class OrderService(
    IServiceRepository serviceRepository,
    IProductRepository productRepository,
    IOrderRepository orderRepository,
    IPromotionService promotionService,
    ILoyaltyService loyaltyService,
    ICustomerRepository customerRepository) : IOrderService
{
    public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRequest(request);

        var orderItems = new List<OrderItem>();
        decimal subtotal = 0;

        foreach (var item in request.Items)
        {
            var orderItem = item.ItemType switch
            {
                OrderItemType.Service => await BuildServiceItemAsync(item, cancellationToken),
                OrderItemType.Product => await BuildProductItemAsync(item, cancellationToken),
                _ => throw new ValidationException("itemType", "Invalid item type.")
            };

            orderItems.Add(orderItem);
            subtotal += orderItem.Subtotal;
        }

        decimal discount = 0;
        string? promotionCode = null;

        if (!string.IsNullOrWhiteSpace(request.PromoCode))
        {
            var promo = await promotionService.ValidateAsync(request.PromoCode, subtotal, cancellationToken);
            if (!promo.IsValid)
                throw new ValidationException("promoCode", promo.Message ?? "Invalid promotion.");

            discount = promo.DiscountAmount;
            promotionCode = request.PromoCode.Trim().ToUpperInvariant();

            if (promo.PromotionId is not null)
                await promotionService.ApplyUsageAsync(promo.PromotionId, cancellationToken);
        }

        var subtotalAfterPromo = Math.Max(0, subtotal - discount);
        var pointsRedeemed = 0;
        var pointsDiscount = 0m;

        if (!string.IsNullOrWhiteSpace(request.CustomerId) && request.PointsToRedeem > 0)
        {
            var customer = await customerRepository.GetByIdAsync(request.CustomerId, cancellationToken)
                ?? throw new NotFoundException("Customer not found.");

            var maxPoints = loyaltyService.CalculateMaxRedeemablePoints(customer.LoyaltyPoints, subtotalAfterPromo);
            pointsRedeemed = Math.Min(request.PointsToRedeem, maxPoints);
            pointsDiscount = loyaltyService.CalculateRedeemDiscount(pointsRedeemed);

            if (pointsRedeemed > 0 && pointsRedeemed % LoyaltyService.RedeemRatePoints != 0)
                throw new ValidationException("pointsToRedeem", "Invalid points amount.");
        }

        var total = Math.Max(0, subtotalAfterPromo - pointsDiscount);
        var pointsEarned = loyaltyService.CalculateEarnPoints(total);

        var order = new Order
        {
            CustomerId = request.CustomerId,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CustomerEmail = request.CustomerEmail?.Trim(),
            Notes = request.Notes?.Trim(),
            Items = orderItems,
            SubtotalAmount = subtotal,
            DiscountAmount = discount + pointsDiscount,
            PromotionCode = promotionCode,
            PointsRedeemed = pointsRedeemed,
            PointsEarned = pointsEarned,
            TotalAmount = total,
            Status = OrderStatus.Pending,
            PaymentCode = $"DH{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}",
        };

        var saved = await orderRepository.CreateAsync(order, cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.CustomerId) && pointsRedeemed > 0)
            await loyaltyService.RedeemPointsAsync(request.CustomerId, pointsRedeemed, saved.Id, cancellationToken);

        return MapToResponse(saved);
    }

    public async Task<OrderResponse> GetOrderAsync(string id, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order '{id}' not found.");

        return MapToResponse(order);
    }

    public async Task<IReadOnlyList<OrderResponse>> ListOrdersAsync(
        OrderStatus? status = null,
        string? phone = null,
        string? customerId = null,
        CancellationToken cancellationToken = default)
    {
        var orders = await orderRepository.GetAllAsync(status, phone, customerId, cancellationToken);
        return orders
            .OrderByDescending(o => o.CreatedAt)
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<OrderResponse> UpdateStatusAsync(string id, OrderStatus status, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order '{id}' not found.");

        order.Status = status;
        if (status == OrderStatus.Paid && order.PaidAt is null)
            order.PaidAt = DateTime.UtcNow;

        var updated = await orderRepository.UpdateAsync(order, cancellationToken);
        return MapToResponse(updated);
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
            HairSize = item.HairSize,
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
            UnitPrice = product.Price,
        };
    }

    private static OrderResponse MapToResponse(Order order) =>
        new(
            order.Id,
            order.CustomerId,
            order.CustomerName,
            order.CustomerPhone,
            order.CustomerEmail,
            order.Notes,
            order.Items.Select(i => new OrderItemResponse(
                i.ItemId, i.ItemType, i.Name, i.Quantity, i.UnitPrice, i.HairSize, i.Subtotal)).ToList(),
            order.SubtotalAmount,
            order.DiscountAmount,
            order.PromotionCode,
            order.PointsRedeemed,
            order.PointsEarned,
            order.TotalAmount,
            order.Status,
            order.PaymentCode,
            order.CreatedAt,
            order.PaidAt);
}
