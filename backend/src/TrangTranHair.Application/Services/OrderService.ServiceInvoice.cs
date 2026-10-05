using TrangTranHair.Application.Common;

using TrangTranHair.Application.DTOs;

using TrangTranHair.Application.Exceptions;

using TrangTranHair.Domain.Entities;

using TrangTranHair.Domain.Enums;



namespace TrangTranHair.Application.Services;



public sealed partial class OrderService

{
    private const decimal MaxManualDiscountRatio = 0.5m;
    private const decimal MinPriceOverrideRatio = 0.75m;
    public static readonly TimeSpan ServiceInvoicePendingExpiry = TimeSpan.FromHours(72);

    public async Task<OrderResponse> CreateServiceInvoiceAsync(

        CreateServiceInvoiceRequest request,

        string? createdByAdminUid = null,

        CancellationToken cancellationToken = default)

    {

        await ReleaseExpiredPendingReservationsAsync(cancellationToken);

        ValidateServiceInvoicePayment(request.PaymentMethod, request.MarkPaidImmediately);



        var order = await BuildServiceInvoiceOrderAsync(

            request.CustomerName,

            request.CustomerPhone,

            request.CustomerEmail,

            request.CustomerId,

            request.AppointmentId,

            request.Notes,

            request.InternalNotes,

            request.Lines,

            request.ManualDiscountAmount,

            request.PromoCode,

            request.PointsToRedeem,

            request.PaymentMethod,

            applyPromotionUsage: true,

            existingOrder: null,

            cancellationToken);



        order.PaymentCode = $"HD{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

        order.AccessToken = AccessTokenGenerator.Create();

        order.CreatedByAdminUid = string.IsNullOrWhiteSpace(createdByAdminUid) ? null : createdByAdminUid.Trim();



        var shouldReserveStock = order.Status == OrderStatus.Pending

            && order.Items.Any(i => i.ItemType == OrderItemType.Product)

            && request.PaymentMethod == PaymentMethod.BankTransfer;



        if (shouldReserveStock)

        {

            await ReserveStockForOrderAsync(order, cancellationToken);

            order.StockReserved = true;

            order.StockReservedAt = DateTime.UtcNow;

        }



        Order saved;

        try

        {

            saved = await orderRepository.CreateAsync(order, cancellationToken);

        }

        catch

        {

            if (order.StockReserved)

                await ReleaseStockForOrderAsync(order, cancellationToken);

            throw;

        }



        if (!string.IsNullOrWhiteSpace(request.CustomerId) && order.PointsRedeemed > 0)

            await loyaltyService.RedeemPointsAsync(request.CustomerId, order.PointsRedeemed, saved.Id, cancellationToken);



        if (request.MarkPaidImmediately)

            return await ConfirmPaymentAsync(saved.Id, null, cancellationToken);



        return MapToResponse(saved);

    }



    public async Task<OrderResponse> UpdateServiceInvoiceAsync(

        string id,

        UpdateServiceInvoiceRequest request,

        CancellationToken cancellationToken = default)

    {

        var existing = await orderRepository.GetByIdAsync(id, cancellationToken)

            ?? throw new NotFoundException($"Order '{id}' not found.");



        if (existing.Kind != OrderKind.ServiceInvoice)

            throw new ValidationException("kind", "Chỉ có thể sửa hóa đơn dịch vụ.");



        if (existing.Status != OrderStatus.Pending)

            throw new ValidationException("status", "Chỉ sửa hóa đơn đang chờ thanh toán.");



        ValidateServiceInvoicePayment(request.PaymentMethod, markPaidImmediately: false);



        if (existing.StockReserved)

        {

            await ReleaseStockForOrderAsync(existing, cancellationToken);

            existing.StockReserved = false;

            existing.StockReservedAt = null;

        }



        if (!string.IsNullOrWhiteSpace(existing.CustomerId) && existing.PointsRedeemed > 0)

        {

            await loyaltyService.RefundRedeemedPointsAsync(

                existing.CustomerId,

                existing.PointsRedeemed,

                existing.Id,

                cancellationToken);

        }



        var rebuilt = await BuildServiceInvoiceOrderAsync(

            request.CustomerName,

            request.CustomerPhone,

            request.CustomerEmail,

            request.CustomerId,

            request.AppointmentId,

            request.Notes,

            request.InternalNotes,

            request.Lines,

            request.ManualDiscountAmount,

            request.PromoCode,

            request.PointsToRedeem,

            request.PaymentMethod,

            applyPromotionUsage: string.IsNullOrWhiteSpace(existing.PromotionCode)

                || !string.Equals(existing.PromotionCode, request.PromoCode?.Trim(), StringComparison.OrdinalIgnoreCase),

            existingOrder: existing,

            cancellationToken);



        rebuilt.Id = existing.Id;

        rebuilt.PaymentCode = existing.PaymentCode;

        rebuilt.AccessToken = existing.AccessToken;

        rebuilt.CreatedAt = existing.CreatedAt;

        rebuilt.Status = OrderStatus.Pending;



        if (rebuilt.Items.Any(i => i.ItemType == OrderItemType.Product)

            && request.PaymentMethod == PaymentMethod.BankTransfer)

        {

            await ReserveStockForOrderAsync(rebuilt, cancellationToken);

            rebuilt.StockReserved = true;

            rebuilt.StockReservedAt = DateTime.UtcNow;

        }



        var saved = await orderRepository.UpdateAsync(rebuilt, cancellationToken);



        if (!string.IsNullOrWhiteSpace(request.CustomerId) && saved.PointsRedeemed > 0)

            await loyaltyService.RedeemPointsAsync(request.CustomerId, saved.PointsRedeemed, saved.Id, cancellationToken);



        return MapToResponse(saved);

    }



    public async Task<IReadOnlyList<OrderResponse>> ListServiceInvoicesAsync(

        OrderStatus? status = null,

        string? phone = null,

        string? appointmentId = null,

        CancellationToken cancellationToken = default)

    {

        var orders = await orderRepository.GetAllAsync(

            status,

            phone,

            customerId: null,

            OrderKind.ServiceInvoice,

            appointmentId,

            cancellationToken);



        return orders.Select(MapToResponse).ToList();

    }



    private async Task<Order> BuildServiceInvoiceOrderAsync(

        string customerName,

        string customerPhone,

        string? customerEmail,

        string? customerId,

        string? appointmentId,

        string? notes,

        string? internalNotes,

        List<ServiceInvoiceLineRequest> lines,

        decimal manualDiscountAmount,

        string? promoCode,

        int pointsToRedeem,

        PaymentMethod paymentMethod,

        bool applyPromotionUsage,

        Order? existingOrder,

        CancellationToken cancellationToken)

    {

        if (string.IsNullOrWhiteSpace(customerName))

            throw new ValidationException("customerName", "Họ tên khách là bắt buộc.");

        if (string.IsNullOrWhiteSpace(customerPhone))

            throw new ValidationException("customerPhone", "Số điện thoại là bắt buộc.");

        if (lines is null || lines.Count == 0)

            throw new ValidationException("lines", "Cần ít nhất một dòng hóa đơn.");



        if (!string.IsNullOrWhiteSpace(appointmentId))

        {

            _ = await appointmentRepository.GetByIdAsync(appointmentId, cancellationToken)

                ?? throw new NotFoundException($"Appointment '{appointmentId}' not found.");

        }



        var orderItems = new List<OrderItem>();

        decimal subtotal = 0;



        foreach (var line in lines)

        {

            var item = await BuildServiceInvoiceLineAsync(line, cancellationToken);

            orderItems.Add(item);

            subtotal += item.Subtotal;

        }



        var manualDiscount = Math.Max(0, manualDiscountAmount);

        if (manualDiscount > subtotal)

            throw new ValidationException("manualDiscountAmount", "Giảm giá không được lớn hơn tổng dịch vụ.");

        if (subtotal > 0 && manualDiscount > subtotal * MaxManualDiscountRatio

            && string.IsNullOrWhiteSpace(internalNotes))

            throw new ValidationException("internalNotes", "Giảm giá trên 50% cần ghi chú nội bộ (lý do).");



        var afterManual = subtotal - manualDiscount;

        decimal promoDiscount = 0;

        string? promotionCode = null;



        if (!string.IsNullOrWhiteSpace(promoCode))

        {

            var promo = await promotionService.ValidateAsync(promoCode, afterManual, cancellationToken);

            if (!promo.IsValid)

                throw new ValidationException("promoCode", promo.Message ?? "Mã khuyến mãi không hợp lệ.");



            promoDiscount = promo.DiscountAmount;

            promotionCode = promoCode.Trim().ToUpperInvariant();



            if (applyPromotionUsage && promo.PromotionId is not null)

                await promotionService.ApplyUsageAsync(promo.PromotionId, cancellationToken);

        }



        var afterPromo = Math.Max(0, afterManual - promoDiscount);

        var pointsRedeemed = 0;

        var pointsDiscount = 0m;



        if (!string.IsNullOrWhiteSpace(customerId) && pointsToRedeem > 0)

        {

            var customer = await customerRepository.GetByIdAsync(customerId, cancellationToken)

                ?? throw new NotFoundException("Customer not found.");



            var maxPoints = loyaltyService.CalculateMaxRedeemablePoints(customer.LoyaltyPoints, afterPromo);

            pointsRedeemed = Math.Min(pointsToRedeem, maxPoints);

            pointsDiscount = loyaltyService.CalculateRedeemDiscount(pointsRedeemed);



            if (pointsRedeemed > 0 && pointsRedeemed % LoyaltyService.RedeemRatePoints != 0)

                throw new ValidationException("pointsToRedeem", "Số điểm đổi không hợp lệ.");

        }



        var total = Math.Max(0, afterPromo - pointsDiscount);

        var pointsEarned = loyaltyService.CalculateEarnPoints(total);



        return new Order

        {

            Kind = OrderKind.ServiceInvoice,

            AppointmentId = string.IsNullOrWhiteSpace(appointmentId) ? null : appointmentId.Trim(),

            InternalNotes = string.IsNullOrWhiteSpace(internalNotes) ? null : internalNotes.Trim(),

            ManualDiscountAmount = manualDiscount,

            CustomerId = customerId,

            CustomerName = customerName.Trim(),

            CustomerPhone = customerPhone.Trim(),

            CustomerEmail = customerEmail?.Trim(),

            Notes = notes?.Trim(),

            Items = orderItems,

            SubtotalAmount = subtotal,

            DiscountAmount = promoDiscount + pointsDiscount,

            PromotionCode = promotionCode,

            PointsRedeemed = pointsRedeemed,

            PointsEarned = pointsEarned,

            TotalAmount = total,

            Status = OrderStatus.Pending,

            PaymentMethod = paymentMethod,

            FulfillmentMethod = FulfillmentMethod.Pickup,

            FulfillmentStatus = FulfillmentStatus.None,

            PaymentCode = existingOrder?.PaymentCode ?? string.Empty,

            AccessToken = existingOrder?.AccessToken ?? string.Empty,

            CreatedAt = existingOrder?.CreatedAt ?? default,

        };

    }



    private async Task<OrderItem> BuildServiceInvoiceLineAsync(

        ServiceInvoiceLineRequest line,

        CancellationToken cancellationToken)

    {

        if (line.Quantity < 1)

            throw new ValidationException("quantity", "Số lượng tối thiểu là 1.");



        return line.ItemType switch

        {

            OrderItemType.Service => await BuildServiceCatalogLineAsync(line, cancellationToken),

            OrderItemType.Product => await BuildServiceInvoiceProductLineAsync(line, cancellationToken),

            OrderItemType.Custom => BuildCustomLine(line),

            _ => throw new ValidationException("itemType", "Loại dòng không hợp lệ."),

        };

    }



    private async Task<OrderItem> BuildServiceCatalogLineAsync(

        ServiceInvoiceLineRequest line,

        CancellationToken cancellationToken)

    {

        if (string.IsNullOrWhiteSpace(line.ItemId))

            throw new ValidationException("itemId", "Chọn dịch vụ từ bảng giá.");



        var service = await serviceRepository.GetByIdAsync(line.ItemId, cancellationToken)

            ?? throw new NotFoundException($"Service '{line.ItemId}' not found.");



        if (!service.IsActive)

            throw new ValidationException("itemId", $"Dịch vụ '{service.Name}' đang tắt.");



        var catalogPrice = service.ResolvePrice(line.HairSize);
        var unitPrice = line.UnitPrice ?? catalogPrice;

        if (line.UnitPrice is not null && catalogPrice > 0 && unitPrice < catalogPrice * MinPriceOverrideRatio)
            throw new ValidationException("unitPrice", $"Giá '{service.Name}' thấp hơn 75% bảng giá — cần sửa bảng giá hoặc dùng phí phát sinh có ghi chú nội bộ.");



        return new OrderItem

        {

            ItemId = service.Id,

            ItemType = OrderItemType.Service,

            Name = service.Name,

            Quantity = line.Quantity,

            UnitPrice = unitPrice,

            HairSize = line.HairSize,

        };

    }



    private async Task<OrderItem> BuildServiceInvoiceProductLineAsync(

        ServiceInvoiceLineRequest line,

        CancellationToken cancellationToken)

    {

        if (string.IsNullOrWhiteSpace(line.ItemId))

            throw new ValidationException("itemId", "Chọn sản phẩm.");



        var product = await productRepository.GetByIdAsync(line.ItemId, cancellationToken)

            ?? throw new NotFoundException($"Product '{line.ItemId}' not found.");



        if (!product.IsActive)

            throw new ValidationException("itemId", $"Sản phẩm '{product.Name}' không khả dụng.");



        return new OrderItem

        {

            ItemId = product.Id,

            ItemType = OrderItemType.Product,

            Name = product.Name,

            Quantity = line.Quantity,

            UnitPrice = line.UnitPrice ?? product.Price,

        };

    }



    private static OrderItem BuildCustomLine(ServiceInvoiceLineRequest line)

    {

        if (string.IsNullOrWhiteSpace(line.Name))

            throw new ValidationException("name", "Nhập tên phí phát sinh.");

        if (line.UnitPrice is null or <= 0)

            throw new ValidationException("unitPrice", "Nhập đơn giá phí phát sinh.");



        return new OrderItem

        {

            ItemId = string.Empty,

            ItemType = OrderItemType.Custom,

            Name = line.Name.Trim(),

            Quantity = line.Quantity,

            UnitPrice = line.UnitPrice.Value,

        };

    }



    private static void ValidateServiceInvoicePayment(PaymentMethod paymentMethod, bool markPaidImmediately)

    {

        if (paymentMethod is not (PaymentMethod.BankTransfer or PaymentMethod.CashAtSalon))

            throw new ValidationException("paymentMethod", "Hóa đơn dịch vụ chỉ hỗ trợ chuyển khoản hoặc tiền mặt tại tiệm.");



        if (markPaidImmediately && paymentMethod != PaymentMethod.CashAtSalon)

            throw new ValidationException("markPaidImmediately", "Chỉ đánh dấu thu tiền ngay khi chọn tiền mặt tại tiệm.");

    }



    private async Task CompleteLinkedAppointmentIfNeededAsync(Order order, CancellationToken cancellationToken)

    {

        if (order.Kind != OrderKind.ServiceInvoice || order.Status != OrderStatus.Paid)

            return;

        if (string.IsNullOrWhiteSpace(order.AppointmentId))

            return;



        var appointment = await appointmentRepository.GetByIdAsync(order.AppointmentId, cancellationToken);

        if (appointment is null || appointment.Status == AppointmentStatus.Completed)

            return;



        appointment.Status = AppointmentStatus.Completed;

        await appointmentRepository.UpdateAsync(appointment, cancellationToken);

    }

}


