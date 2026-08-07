using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Application.Mappings;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController(IServiceRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ServiceResponse>>> GetAll(CancellationToken ct)
    {
        var services = await repository.GetAllAsync(ct);
        return Ok(services.Select(s => s.ToResponse()));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse>> GetById(string id, CancellationToken ct)
    {
        var service = await repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Service '{id}' not found.");
        return Ok(service.ToResponse());
    }

    [HttpPost]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<ServiceResponse>> Create([FromBody] CreateServiceRequest request, CancellationToken ct)
    {
        var service = request.ToEntity();
        var created = await repository.CreateAsync(service, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToResponse());
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<ServiceResponse>> Update(string id, [FromBody] UpdateServiceRequest request, CancellationToken ct)
    {
        var service = await repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Service '{id}' not found.");

        service.ApplyUpdate(request);
        var updated = await repository.UpdateAsync(service, ct);
        return Ok(updated.ToResponse());
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Admin")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        _ = await repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Service '{id}' not found.");

        await repository.DeleteAsync(id, ct);
        return NoContent();
    }
}
