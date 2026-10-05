using TrangTranHair.Application.Common;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Application.Services;

public sealed partial class OrderService(
    IProductRepository productRepository,
    IServiceRepository serviceRepository,
    IOrderRepository orderRepository,
    IPromotionService promotionService,
    ILoyaltyService loyaltyService,
    ICustomerRepository customerRepository,
    IAppointmentRepository appointmentRepository) : IOrderService
{
    public const int StockReservationMinutes = 15;
    public const int CodStockReservationMinutes = 48 * 60;

    public static int GetReservationMinutes(PaymentMethod paymentMethod) =>
        paymentMethod == PaymentMethod.COD ? CodStockReservationMinutes : StockReservationMinutes;

    public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request, CancellationToken cancellationToken = default)
    {
        await ReleaseExpiredPendingReservationsAsync(cancellationToken);

        ValidateRequest(request);

        var orderItems = new List<OrderItem>();
        decimal subtotal = 0;

        foreach (var item in request.Items)
        {
            if (item.ItemType != OrderItemType.Product)
                throw new ValidationException("items", "Online checkout chỉ hỗ trợ sản phẩm. Dịch vụ vui lòng đặt lịch trên trang chủ.");

            var orderItem = await BuildProductItemAsync(item, cancellationToken);
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
        var shippingFee = 0m;
        ShippingZone? shippingZone = null;
        var fulfillmentStatus = FulfillmentStatus.None;

        if (request.FulfillmentMethod == FulfillmentMethod.Delivery)
        {
            if (request.ShippingZone is null)
                throw new ValidationException("shippingZone", "Vui lòng chọn khu vực giao hàng.");

            shippingZone = request.ShippingZone.Value;
            shippingFee = ShippingCalculator.GetFee(shippingZone.Value);
            total += shippingFee;

            fulfillmentStatus = request.PaymentMethod == PaymentMethod.COD
                ? FulfillmentStatus.AwaitingApproval
                : FulfillmentStatus.None;
        }

        var pointsEarned = loyaltyService.CalculateEarnPoints(total);

        var order = new Order
        {
            Kind = OrderKind.Retail,
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
            PaymentMethod = request.PaymentMethod,
            FulfillmentMethod = request.FulfillmentMethod,
            DeliveryAddress = request.FulfillmentMethod == FulfillmentMethod.Delivery
                ? request.DeliveryAddress?.Trim()
                : null,
            ShippingFee = shippingFee,
            ShippingZone = shippingZone,
            FulfillmentStatus = fulfillmentStatus,
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
        OrderKind? kind = null,
        CancellationToken cancellationToken = default)
    {
        var orders = await orderRepository.GetAllAsync(status, phone, customerId, kind, appointmentId: null, cancellationToken);
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

        if (order.FulfillmentMethod == FulfillmentMethod.Delivery
            && order.FulfillmentStatus == FulfillmentStatus.None)
        {
            order.FulfillmentStatus = FulfillmentStatus.Approved;
            order.ApprovedAt = DateTime.UtcNow;
        }

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

        await CompleteLinkedAppointmentIfNeededAsync(order, cancellationToken);

        return MapToResponse(order);
    }

    public async Task<OrderResponse> ApproveFulfillmentAsync(string id, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order '{id}' not found.");

        if (order.FulfillmentMethod != FulfillmentMethod.Delivery)
            throw new ValidationException("fulfillmentMethod", "Chỉ đơn giao hàng mới cần duyệt.");

        if (order.PaymentMethod != PaymentMethod.COD)
            throw new ValidationException("paymentMethod", "Chỉ đơn COD cần duyệt trước khi giao.");

        if (order.FulfillmentStatus != FulfillmentStatus.AwaitingApproval)
            throw new ValidationException("fulfillmentStatus", "Đơn không ở trạng thái chờ duyệt.");

        if (order.Status == OrderStatus.Cancelled)
            throw new ValidationException("status", "Không thể duyệt đơn đã hủy.");

        order.FulfillmentStatus = FulfillmentStatus.Approved;
        order.ApprovedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        var updated = await orderRepository.UpdateAsync(order, cancellationToken);
        return MapToResponse(updated);
    }

    public async Task<OrderResponse> UpdateShipmentAsync(
        string id,
        UpdateShipmentRequest request,
        CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order '{id}' not found.");

        if (order.FulfillmentMethod != FulfillmentMethod.Delivery)
            throw new ValidationException("fulfillmentMethod", "Chỉ đơn giao hàng mới có vận chuyển.");

        if (order.FulfillmentStatus != FulfillmentStatus.Approved)
            throw new ValidationException("fulfillmentStatus", "Đơn cần được duyệt trước khi giao hàng.");

        if (string.IsNullOrWhiteSpace(request.TrackingCode))
            throw new ValidationException("trackingCode", "Mã vận đơn là bắt buộc.");

        order.TrackingCode = request.TrackingCode.Trim();
        order.TrackingUrl = string.IsNullOrWhiteSpace(request.TrackingUrl) ? null : request.TrackingUrl.Trim();
        order.Carrier = string.IsNullOrWhiteSpace(request.Carrier) ? null : request.Carrier.Trim();
        order.FulfillmentStatus = FulfillmentStatus.Shipped;
        order.ShippedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        var updated = await orderRepository.UpdateAsync(order, cancellationToken);
        return MapToResponse(updated);
    }

    public async Task<OrderResponse> MarkDeliveredAsync(string id, CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order '{id}' not found.");

        if (order.FulfillmentMethod != FulfillmentMethod.Delivery)
            throw new ValidationException("fulfillmentMethod", "Chỉ đơn giao hàng mới có trạng thái đã giao.");

        if (order.FulfillmentStatus != FulfillmentStatus.Shipped)
            throw new ValidationException("fulfillmentStatus", "Đơn cần ở trạng thái đang giao.");

        order.FulfillmentStatus = FulfillmentStatus.Delivered;
        order.DeliveredAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        var updated = await orderRepository.UpdateAsync(order, cancellationToken);
        return MapToResponse(updated);
    }

    public async Task<OrderResponse> ConfirmReceivedAsync(
        string id,
        string? accessToken,
        CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order '{id}' not found.");

        EnsureCustomerAccess(order, accessToken);

        if (order.FulfillmentStatus == FulfillmentStatus.Completed)
            return MapToResponse(order);

        if (order.FulfillmentMethod == FulfillmentMethod.Delivery)
        {
            if (order.FulfillmentStatus != FulfillmentStatus.Delivered)
                throw new ValidationException("fulfillmentStatus", "Chỉ xác nhận khi đơn đã giao tới bạn.");
        }
        else if (order.Status != OrderStatus.Paid)
        {
            throw new ValidationException("status", "Đơn nhận tại salon cần thanh toán trước khi xác nhận.");
        }

        order.FulfillmentStatus = FulfillmentStatus.Completed;
        order.CompletedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        var updated = await orderRepository.UpdateAsync(order, cancellationToken);
        return MapToResponse(updated);
    }

    public async Task<OrderResponse> SubmitDisputeAsync(
        string id,
        SubmitDisputeRequest request,
        string? accessToken,
        CancellationToken cancellationToken = default)
    {
        var order = await orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Order '{id}' not found.");

        EnsureCustomerAccess(order, accessToken);

        if (order.FulfillmentMethod != FulfillmentMethod.Delivery)
            throw new ValidationException("fulfillmentMethod", "Khiếu nại chỉ áp dụng cho đơn giao hàng.");

        if (order.FulfillmentStatus is not (FulfillmentStatus.Shipped or FulfillmentStatus.Delivered))
            throw new ValidationException("fulfillmentStatus", "Chỉ khiếu nại khi đơn đang giao hoặc đã giao.");

        if (string.IsNullOrWhiteSpace(request.Reason))
            throw new ValidationException("reason", "Vui lòng chọn lý do khiếu nại.");

        order.DisputeReason = request.Reason.Trim();
        order.DisputeNotes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        order.DisputedAt = DateTime.UtcNow;
        order.FulfillmentStatus = FulfillmentStatus.Disputed;
        order.UpdatedAt = DateTime.UtcNow;

        var updated = await orderRepository.UpdateAsync(order, cancellationToken);
        return MapToResponse(updated);
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
        var pending = await orderRepository.GetAllAsync(OrderStatus.Pending, cancellationToken: cancellationToken);
        var now = DateTime.UtcNow;

        foreach (var order in pending.Where(o => o.StockReserved))
        {
            var reservedAt = order.StockReservedAt ?? order.CreatedAt;
            var expiresAt = reservedAt.AddMinutes(GetReservationMinutes(order.PaymentMethod));
            if (expiresAt >= now)
                continue;

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

        foreach (var order in pending.Where(o =>
                     o.Kind == OrderKind.ServiceInvoice &&
                     !o.StockReserved &&
                     o.PaymentMethod == PaymentMethod.BankTransfer))
        {
            if (order.CreatedAt.Add(OrderService.ServiceInvoicePendingExpiry) >= now)
                continue;

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

        if (request.Items.Any(i => i.ItemType != OrderItemType.Product))
            throw new ValidationException("items", "Online checkout chỉ hỗ trợ sản phẩm. Dịch vụ vui lòng đặt lịch trên trang chủ.");

        if (request.FulfillmentMethod == FulfillmentMethod.Delivery
            && string.IsNullOrWhiteSpace(request.DeliveryAddress))
            throw new ValidationException("deliveryAddress", "Vui lòng nhập địa chỉ giao hàng.");
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

    private static void EnsureCustomerAccess(Order order, string? accessToken)
    {
        if (AccessTokenGenerator.Matches(order.AccessToken, accessToken))
            return;

        throw new ValidationException("accessToken", "Không có quyền thực hiện thao tác này.");
    }

    private static OrderResponse MapToResponse(Order order) =>
        new(
            order.Id,
            order.Kind,
            order.AppointmentId,
            order.InternalNotes,
            order.ManualDiscountAmount,
            order.CreatedByAdminUid,
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
            order.PaymentMethod,
            order.FulfillmentMethod,
            order.DeliveryAddress,
            order.ShippingFee,
            order.ShippingZone,
            order.FulfillmentStatus,
            order.TrackingCode,
            order.TrackingUrl,
            order.Carrier,
            order.ApprovedAt,
            order.ShippedAt,
            order.DeliveredAt,
            order.CompletedAt,
            order.DisputeReason,
            order.DisputeNotes,
            order.DisputedAt,
            order.PaymentCode,
            order.AccessToken,
            order.CreatedAt,
            order.PaidAt);
}
