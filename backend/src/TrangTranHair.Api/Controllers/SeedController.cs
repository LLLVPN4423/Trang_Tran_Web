using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedController(IDataSeedService seedService, IHostEnvironment env) : ControllerBase
{
    [HttpPost]
    [Authorize(Policy = "Admin")]
    public async Task<IActionResult> Seed([FromQuery] bool force = false, CancellationToken ct = default)
    {
        var result = await seedService.SeedAsync(force, ct);
        return Ok(new
        {
            result.ServicesSeeded,
            result.ProductsSeeded,
            result.Skipped,
            message = result.Skipped
                ? "Data already exists. Use ?force=true to re-seed."
                : "Seed completed successfully."
        });
    }

    /// <summary>Dev-only unauthenticated seed for local testing without Firebase Admin token.</summary>
    [HttpPost("dev")]
    public async Task<IActionResult> SeedDev([FromQuery] bool force = false, CancellationToken ct = default)
    {
        if (!env.IsDevelopment())
            return NotFound();

        var result = await seedService.SeedAsync(force, ct);
        return Ok(new
        {
            result.ServicesSeeded,
            result.ProductsSeeded,
            result.Skipped,
            message = result.Skipped
                ? "Data already exists. Use ?force=true to re-seed."
                : "Dev seed completed."
        });
    }
}
