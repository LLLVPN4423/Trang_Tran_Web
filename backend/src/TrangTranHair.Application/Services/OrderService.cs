using TrangTranHair.Application.Common;
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
    public const int StockReservationMinutes = 15;

    public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        await ReleaseExpiredPendingReservationsAsync(cancellationToken);

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
            AccessToken = AccessTokenGenerator.Create(),
        };

        await ReserveStockForOrderAsync(order, cancellationToken);
        order.StockReserved = true;
        order.StockReservedAt = DateTime.UtcNow;

        Order saved;
        try
        {
            saved = await orderRepository.CreateAsync(order, cancellationToken);
        }
        catch
        {
            await ReleaseStockForOrderAsync(order, cancellationToken);
            throw;
        }

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

        if (order.Status == status)
            return MapToResponse(order);

        if (status == OrderStatus.Paid)
            return await ConfirmPaymentAsync(id, null, cancellationToken);

        if (status == OrderStatus.Cancelled && order.Status == OrderStatus.Pending)
        {
            if (order.StockReserved)
            {
                await ReleaseStockForOrderAsync(order, cancellationToken);
                order.StockReserved = false;
                order.StockReservedAt = null;
            }

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(order.CustomerId) && order.PointsRedeemed > 0)
            {
                await loyaltyService.RefundRedeemedPointsAsync(
                    order.CustomerId,
                    order.PointsRedeemed,
                    order.Id,
                    cancellationToken);
            }

            var cancelled = await orderRepository.UpdateAsync(order, cancellationToken);
            return MapToResponse(cancelled);
        }

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;
        var updated = await orderRepository.UpdateAsync(order, cancellationToken);
        return MapToResponse(updated);
    }

    public async Task<OrderResponse> ConfirmPaymentAsync(
        string id,
        string? sePayTransactionId = null,
        CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order '{id}' not found.");

        if (order.Status == OrderStatus.Paid)
            return MapToResponse(order);

        if (order.Status != OrderStatus.Pending)
            throw new ValidationException("status", "Only pending orders can be marked as paid.");

        await ReleaseExpiredPendingReservationsAsync(cancellationToken);

        order = await orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order '{id}' not found.");

        if (order.Status != OrderStatus.Pending)
            throw new ValidationException("status", "Only pending orders can be marked as paid.");

        order.Status = OrderStatus.Paid;
        order.PaidAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(sePayTransactionId))
            order.SePayTransactionId = sePayTransactionId;

        if (!order.StockReserved)
            await DeductStockForOrderAsync(order, cancellationToken);
        else
            order.StockReserved = false;

        order.StockReservedAt = null;
        await orderRepository.UpdateAsync(order, cancellationToken);

        if (!string.IsNullOrWhiteSpace(order.CustomerId))
        {
            await loyaltyService.EarnPointsForOrderAsync(
                order.CustomerId,
                order.Id,
                order.TotalAmount,
                cancellationToken);
        }

        return MapToResponse(order);
    }

    public async Task<int> LinkGuestOrdersAsync(string customerId, string phone, CancellationToken cancellationToken = default)
    {
        var normalized = PhoneNormalizer.Normalize(phone);
        if (string.IsNullOrEmpty(normalized)) return 0;

        var candidates = await orderRepository.GetAllAsync(phone: phone, cancellationToken: cancellationToken);
        var linked = 0;

        foreach (var order in candidates.Where(o => string.IsNullOrWhiteSpace(o.CustomerId)))
        {
            if (PhoneNormalizer.Normalize(order.CustomerPhone) != normalized)
                continue;

            order.CustomerId = customerId;
            await orderRepository.UpdateAsync(order, cancellationToken);
            linked++;
        }

        return linked;
    }

    private async Task ReserveStockForOrderAsync(Order order, CancellationToken cancellationToken)
    {
        foreach (var item in order.Items.Where(i => i.ItemType == OrderItemType.Product))
        {
            var product = await productRepository.GetByIdAsync(item.ItemId, cancellationToken)
                ?? throw new NotFoundException($"Product '{item.ItemId}' not found.");

            if (product.Stock < item.Quantity)
                throw new ValidationException("stock", $"Không đủ tồn kho cho '{product.Name}'.");

            product.Stock -= item.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
            await productRepository.UpdateAsync(product, cancellationToken);
        }
    }

    private async Task ReleaseStockForOrderAsync(Order order, CancellationToken cancellationToken)
    {
        foreach (var item in order.Items.Where(i => i.ItemType == OrderItemType.Product))
        {
            var product = await productRepository.GetByIdAsync(item.ItemId, cancellationToken);
            if (product is null) continue;

            product.Stock += item.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
            await productRepository.UpdateAsync(product, cancellationToken);
        }
    }

    private async Task ReleaseExpiredPendingReservationsAsync(CancellationToken cancellationToken)
    {
        var cutoff = DateTime.UtcNow.AddMinutes(-StockReservationMinutes);
        var pending = await orderRepository.GetAllAsync(OrderStatus.Pending, cancellationToken: cancellationToken);

        foreach (var order in pending.Where(o => o.StockReserved && o.CreatedAt < cutoff))
        {
            await ReleaseStockForOrderAsync(order, cancellationToken);
            order.StockReserved = false;
            order.StockReservedAt = null;

            if (!string.IsNullOrWhiteSpace(order.CustomerId) && order.PointsRedeemed > 0)
            {
                await loyaltyService.RefundRedeemedPointsAsync(
                    order.CustomerId,
                    order.PointsRedeemed,
                    order.Id,
                    cancellationToken);
            }

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;
            await orderRepository.UpdateAsync(order, cancellationToken);
        }
    }

    private async Task DeductStockForOrderAsync(Order order, CancellationToken cancellationToken)
    {
        foreach (var item in order.Items.Where(i => i.ItemType == OrderItemType.Product))
        {
            var product = await productRepository.GetByIdAsync(item.ItemId, cancellationToken);
            if (product is null) continue;

            if (product.Stock < item.Quantity)
                throw new ValidationException("stock", $"Không đủ tồn kho cho '{product.Name}'.");

            product.Stock -= item.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
            await productRepository.UpdateAsync(product, cancellationToken);
        }
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
            order.AccessToken,
            order.CreatedAt,
            order.PaidAt);
}
