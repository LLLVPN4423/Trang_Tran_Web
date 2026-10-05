using TrangTranHair.Application.DTOs;

using TrangTranHair.Application.Exceptions;

using TrangTranHair.Domain.Entities;

using TrangTranHair.Domain.Enums;

using TrangTranHair.Infrastructure.Persistence.InMemory;

using Xunit;



namespace TrangTranHair.Application.Tests;



public class ServiceInvoiceTests

{

    [Fact]

    public async Task CreateServiceInvoice_with_service_and_custom_lines()

    {

        var (orderService, _, services, _, _, _) = OrderServiceTestFactory.Create();



        await services.CreateAsync(new Service

        {

            Id = "svc-cut",

            Name = "Cắt tóc",

            Category = ServiceCategory.Cut,

            BasePrice = 150_000,

            IsActive = true,

        });



        var invoice = await orderService.CreateServiceInvoiceAsync(new CreateServiceInvoiceRequest(

            CustomerName: "Lan",

            CustomerPhone: "0901111222",

            CustomerEmail: null,

            CustomerId: null,

            AppointmentId: null,

            Notes: "Làm xong",

            InternalNotes: "Walk-in",

            Lines:

            [

                new ServiceInvoiceLineRequest(OrderItemType.Service, "svc-cut", null, null, 1, null),

                new ServiceInvoiceLineRequest(OrderItemType.Custom, null, "Dưỡng thêm", null, 1, 50_000),

            ],

            ManualDiscountAmount: 10_000,

            PaymentMethod: PaymentMethod.BankTransfer));



        Assert.Equal(OrderKind.ServiceInvoice, invoice.Kind);

        Assert.StartsWith("HD", invoice.PaymentCode);

        Assert.Equal(OrderStatus.Pending, invoice.Status);

        Assert.Equal(190_000, invoice.TotalAmount);

        Assert.Equal(2, invoice.Items.Count);

    }



    [Fact]

    public async Task CreateServiceInvoice_cash_immediate_marks_paid()

    {

        var (orderService, _, services, _, _, _) = OrderServiceTestFactory.Create();



        await services.CreateAsync(new Service

        {

            Id = "svc-1",

            Name = "Gội",

            Category = ServiceCategory.Recovery,

            BasePrice = 80_000,

            IsActive = true,

        });



        var invoice = await orderService.CreateServiceInvoiceAsync(new CreateServiceInvoiceRequest(

            CustomerName: "Nam",

            CustomerPhone: "0903333444",

            CustomerEmail: null,

            CustomerId: null,

            AppointmentId: null,

            Notes: null,

            InternalNotes: null,

            Lines: [new ServiceInvoiceLineRequest(OrderItemType.Service, "svc-1", null, null, 1, null)],

            PaymentMethod: PaymentMethod.CashAtSalon,

            MarkPaidImmediately: true));



        Assert.Equal(OrderStatus.Paid, invoice.Status);

        Assert.Equal(PaymentMethod.CashAtSalon, invoice.PaymentMethod);

    }



    [Fact]

    public async Task UpdateServiceInvoice_only_when_pending()

    {

        var (orderService, _, services, _, _, _) = OrderServiceTestFactory.Create();



        await services.CreateAsync(new Service

        {

            Id = "svc-2",

            Name = "Uốn",

            Category = ServiceCategory.Perm,

            BasePrice = 500_000,

            IsActive = true,

        });



        var created = await orderService.CreateServiceInvoiceAsync(new CreateServiceInvoiceRequest(

            "A", "0905555666", null, null, null, null, null,

            [new ServiceInvoiceLineRequest(OrderItemType.Service, "svc-2", null, HairSize.M, 1, 480_000)],

            PaymentMethod: PaymentMethod.BankTransfer));



        var updated = await orderService.UpdateServiceInvoiceAsync(created.Id, new UpdateServiceInvoiceRequest(

            "A", "0905555666", null, null, null, "Thêm tip", null,

            [

                new ServiceInvoiceLineRequest(OrderItemType.Service, "svc-2", null, HairSize.M, 1, 480_000),

                new ServiceInvoiceLineRequest(OrderItemType.Custom, null, "Tip", null, 1, 20_000),

            ],

            PaymentMethod: PaymentMethod.BankTransfer));



        Assert.Equal(500_000, updated.TotalAmount);

        Assert.Equal("Thêm tip", updated.Notes);



        await orderService.UpdateStatusAsync(created.Id, OrderStatus.Paid);



        await Assert.ThrowsAsync<ValidationException>(() =>

            orderService.UpdateServiceInvoiceAsync(created.Id, new UpdateServiceInvoiceRequest(

                "A", "0905555666", null, null, null, null, null,

                [new ServiceInvoiceLineRequest(OrderItemType.Service, "svc-2", null, null, 1, null)],

                PaymentMethod: PaymentMethod.BankTransfer)));

    }



    [Fact]

    public async Task Paid_service_invoice_completes_linked_appointment()

    {

        var (orderService, _, services, _, _, appointments) = OrderServiceTestFactory.Create();

        var apptRepo = appointments;



        await services.CreateAsync(new Service

        {

            Id = "svc-3",

            Name = "Balayage",

            Category = ServiceCategory.Balayage,

            BasePrice = 1_000_000,

            IsActive = true,

        });



        var appt = await apptRepo.CreateAsync(new Appointment

        {

            CustomerName = "Hoa",

            CustomerPhone = "0907777888",

            ServiceInterest = "Balayage",

            Status = AppointmentStatus.Confirmed,

            AccessToken = TrangTranHair.Application.Common.AccessTokenGenerator.Create(),

        });



        var invoice = await orderService.CreateServiceInvoiceAsync(new CreateServiceInvoiceRequest(

            "Hoa", "0907777888", null, null, appt.Id, null, null,

            [new ServiceInvoiceLineRequest(OrderItemType.Service, "svc-3", null, null, 1, null)],

            PaymentMethod: PaymentMethod.CashAtSalon,

            MarkPaidImmediately: true));



        var updatedAppt = await apptRepo.GetByIdAsync(appt.Id);

        Assert.Equal(AppointmentStatus.Completed, updatedAppt!.Status);

        Assert.Equal(appt.Id, invoice.AppointmentId);

    }

}


