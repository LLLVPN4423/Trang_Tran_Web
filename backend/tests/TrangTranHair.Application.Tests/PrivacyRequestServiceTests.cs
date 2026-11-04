using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Services;
using TrangTranHair.Domain.Entities;
using TrangTranHair.Domain.Enums;
using TrangTranHair.Infrastructure.Persistence.InMemory;
using Xunit;

namespace TrangTranHair.Application.Tests;

public class PrivacyRequestServiceTests
{
    private static PrivacyRequestService CreateService(
        out InMemoryPrivacyRequestRepository privacyRepo,
        out InMemoryCustomerRepository customerRepo)
    {
        privacyRepo = new InMemoryPrivacyRequestRepository();
        customerRepo = new InMemoryCustomerRepository();
        return new PrivacyRequestService(privacyRepo, customerRepo);
    }

    [Fact]
    public async Task Create_binds_to_authenticated_uid_and_starts_submitted()
    {
        var service = CreateService(out _, out var customers);
        await customers.CreateAsync(new Customer
        {
            Id = "uid-a",
            FirebaseUid = "uid-a",
            Name = "A",
            Phone = "0901111111",
            Email = "a@example.com",
        });

        var created = await service.CreateAsync(
            "uid-a",
            new CreatePrivacyRequestRequest(PrivacyRequestType.Access, "Tôi muốn xem thêm dữ liệu đang lưu."));

        Assert.Equal(PrivacyRequestStatus.Submitted, created.Status);
        Assert.Equal(PrivacyRequestType.Access, created.Type);
        Assert.Single(created.History);

        var adminView = await service.AdminGetAsync(created.Id);
        Assert.Equal("uid-a", adminView.CustomerFirebaseUid);
        Assert.Null(adminView.InternalNotes);
    }

    [Fact]
    public async Task ListMine_only_returns_own_requests()
    {
        var service = CreateService(out _, out _);

        await service.CreateAsync("uid-a", new CreatePrivacyRequestRequest(PrivacyRequestType.Other, "Yêu cầu của A đủ dài."));
        await service.CreateAsync("uid-b", new CreatePrivacyRequestRequest(PrivacyRequestType.Other, "Yêu cầu của B đủ dài."));

        var mine = await service.ListMineAsync("uid-a");
        Assert.Single(mine);
        Assert.Contains("A đủ dài", mine[0].Description);
    }

    [Fact]
    public async Task GetMine_hides_other_customers_as_not_found()
    {
        var service = CreateService(out _, out _);
        var created = await service.CreateAsync(
            "uid-a",
            new CreatePrivacyRequestRequest(PrivacyRequestType.Correction, "Cần sửa dữ liệu lịch sử đơn."));

        await Assert.ThrowsAsync<NotFoundException>(() => service.GetMineAsync("uid-b", created.Id));
    }

    [Fact]
    public async Task Customer_response_excludes_internal_notes()
    {
        var service = CreateService(out _, out _);
        var created = await service.CreateAsync(
            "uid-a",
            new CreatePrivacyRequestRequest(PrivacyRequestType.Access, "Xin hỗ trợ truy cập dữ liệu."));

        await service.AdminUpdateAsync(
            created.Id,
            "admin-1",
            new AdminUpdatePrivacyRequestRequest(
                PrivacyRequestStatus.UnderReview,
                null,
                "Đã tiếp nhận",
                "Ghi chú nội bộ bí mật"));

        var customerView = await service.GetMineAsync("uid-a", created.Id);
        Assert.DoesNotContain("bí mật", System.Text.Json.JsonSerializer.Serialize(customerView));
        Assert.Null(customerView.CustomerVisibleResult);

        var adminView = await service.AdminGetAsync(created.Id);
        Assert.Equal("Ghi chú nội bộ bí mật", adminView.InternalNotes);
        Assert.Contains(adminView.History, h => h.InternalNote == "Ghi chú nội bộ bí mật");
    }

    [Fact]
    public async Task Admin_status_transition_is_validated()
    {
        var service = CreateService(out _, out _);
        var created = await service.CreateAsync(
            "uid-a",
            new CreatePrivacyRequestRequest(PrivacyRequestType.Other, "Yêu cầu kiểm tra chuyển trạng thái."));

        await service.AdminUpdateAsync(
            created.Id,
            "admin-1",
            new AdminUpdatePrivacyRequestRequest(PrivacyRequestStatus.Completed, "Done", null, null));

        await Assert.ThrowsAsync<ValidationException>(() =>
            service.AdminUpdateAsync(
                created.Id,
                "admin-1",
                new AdminUpdatePrivacyRequestRequest(PrivacyRequestStatus.Submitted, null, null, null)));
    }

    [Fact]
    public async Task Deletion_completion_requires_visible_result_and_does_not_delete_customer()
    {
        var service = CreateService(out var privacy, out var customers);
        await customers.CreateAsync(new Customer
        {
            Id = "uid-a",
            FirebaseUid = "uid-a",
            Name = "Keep Me",
            Phone = "0901111111",
        });

        var created = await service.CreateAsync(
            "uid-a",
            new CreatePrivacyRequestRequest(PrivacyRequestType.Deletion, "Xin xóa dữ liệu cá nhân của tôi."));

        await Assert.ThrowsAsync<ValidationException>(() =>
            service.AdminUpdateAsync(
                created.Id,
                "admin-1",
                new AdminUpdatePrivacyRequestRequest(PrivacyRequestStatus.Completed, null, null, "ok nội bộ")));

        var completed = await service.AdminUpdateAsync(
            created.Id,
            "admin-1",
            new AdminUpdatePrivacyRequestRequest(
                PrivacyRequestStatus.Completed,
                "Đã ghi nhận — chưa xóa đơn hàng/thanh toán theo nghĩa vụ lưu trữ.",
                null,
                "Chỉ ghi nhận quyết định; không chạy xóa."));

        Assert.Equal(PrivacyRequestStatus.Completed, completed.Status);

        var customerStillThere = await customers.GetByFirebaseUidAsync("uid-a");
        Assert.NotNull(customerStillThere);
        Assert.Equal("Keep Me", customerStillThere!.Name);

        var stored = await privacy.GetByIdAsync(created.Id);
        Assert.NotNull(stored);
        Assert.Equal(PrivacyRequestStatus.Completed, stored!.Status);
    }

    [Fact]
    public void Allowed_transitions_block_completed_reopen_to_submitted()
    {
        Assert.False(
            PrivacyRequestService.IsAllowedTransition(
                PrivacyRequestStatus.Completed,
                PrivacyRequestStatus.Submitted));
        Assert.True(
            PrivacyRequestService.IsAllowedTransition(
                PrivacyRequestStatus.Submitted,
                PrivacyRequestStatus.UnderReview));
    }

}
