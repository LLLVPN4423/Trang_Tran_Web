using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Domain.Enums;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/privacy-requests")]
public class PrivacyRequestsController(
    IPrivacyRequestService privacyRequestService,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<PrivacyRequestCustomerResponse>> Create(
        [FromBody] CreatePrivacyRequestRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Unauthorized();

        // Ownership: always bind to authenticated UID — ignore any client-supplied identity.
        var created = await privacyRequestService.CreateAsync(currentUser.UserId, request, ct);
        return CreatedAtAction(nameof(GetMine), new { id = created.Id }, created);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<PrivacyRequestCustomerResponse>>> ListMine(CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Unauthorized();

        return Ok(await privacyRequestService.ListMineAsync(currentUser.UserId, ct));
    }

    [HttpGet("me/{id}")]
    [Authorize]
    public async Task<ActionResult<PrivacyRequestCustomerResponse>> GetMine(string id, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Unauthorized();

        return Ok(await privacyRequestService.GetMineAsync(currentUser.UserId, id, ct));
    }

    [HttpGet]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<IReadOnlyList<PrivacyRequestAdminResponse>>> AdminList(
        [FromQuery] PrivacyRequestType? type,
        [FromQuery] PrivacyRequestStatus? status,
        CancellationToken ct) =>
        Ok(await privacyRequestService.AdminListAsync(type, status, ct));

    [HttpGet("{id}")]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<PrivacyRequestAdminResponse>> AdminGet(string id, CancellationToken ct) =>
        Ok(await privacyRequestService.AdminGetAsync(id, ct));

    [HttpPatch("{id}")]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<PrivacyRequestAdminResponse>> AdminUpdate(
        string id,
        [FromBody] AdminUpdatePrivacyRequestRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Unauthorized();

        return Ok(await privacyRequestService.AdminUpdateAsync(id, currentUser.UserId, request, ct));
    }
}
