using TrangTranHair.Domain.Enums;



namespace TrangTranHair.Application.DTOs;



public sealed record ServiceInvoiceLineRequest(

    OrderItemType ItemType,

    string? ItemId,

    string? Name,

    HairSize? HairSize,

    int Quantity = 1,

    decimal? UnitPrice = null);



public sealed record CreateServiceInvoiceRequest(

    string CustomerName,

    string CustomerPhone,

    string? CustomerEmail,

    string? CustomerId,

    string? AppointmentId,

    string? Notes,

    string? InternalNotes,

    List<ServiceInvoiceLineRequest> Lines,

    decimal ManualDiscountAmount = 0,

    string? PromoCode = null,

    int PointsToRedeem = 0,

    PaymentMethod PaymentMethod = PaymentMethod.BankTransfer,

    bool MarkPaidImmediately = false);



public sealed record UpdateServiceInvoiceRequest(

    string CustomerName,

    string CustomerPhone,

    string? CustomerEmail,

    string? CustomerId,

    string? AppointmentId,

    string? Notes,

    string? InternalNotes,

    List<ServiceInvoiceLineRequest> Lines,

    decimal ManualDiscountAmount = 0,

    string? PromoCode = null,

    int PointsToRedeem = 0,

    PaymentMethod PaymentMethod = PaymentMethod.BankTransfer);


