using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/webhooks/sepay")]
public class SePayWebhookController(ISePayWebhookHandler handler) : ControllerBase
{
    [HttpPost]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> Handle(CancellationToken ct)
    {
        Request.EnableBuffering();
        using var reader = new StreamReader(Request.Body, leaveOpen: true);
        var rawBody = await reader.ReadToEndAsync(ct);
        Request.Body.Position = 0;

        var signature = Request.Headers["X-SePay-Signature"].FirstOrDefault();
        var timestamp = Request.Headers["X-SePay-Timestamp"].FirstOrDefault();

        var result = await handler.HandleAsync(rawBody, signature, timestamp, ct);

        return StatusCode(result.StatusCode, new { success = result.Success, message = result.Message });
    }
}
