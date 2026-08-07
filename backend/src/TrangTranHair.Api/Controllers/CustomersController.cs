using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController(
    ICustomerService customerService,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost("sync")]
    [Authorize]
    public async Task<ActionResult<CustomerResponse>> Sync([FromBody] SyncCustomerRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Unauthorized();

        var customer = await customerService.SyncAsync(currentUser.UserId, request, ct);
        return Ok(customer);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<CustomerResponse>> GetMe(CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Unauthorized();

        return Ok(await customerService.GetMeAsync(currentUser.UserId, ct));
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult<CustomerResponse>> UpdateMe([FromBody] UpdateCustomerRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(currentUser.UserId))
            return Unauthorized();

        return Ok(await customerService.UpdateMeAsync(currentUser.UserId, request, ct));
    }

    [HttpGet]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<IReadOnlyList<CustomerResponse>>> List(CancellationToken ct) =>
        Ok(await customerService.ListAsync(ct));
}
