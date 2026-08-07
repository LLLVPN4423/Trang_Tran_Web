using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;
using TrangTranHair.Application.Mappings;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductResponse>>> GetAll(CancellationToken ct)
    {
        var products = await repository.GetAllAsync(ct);
        return Ok(products.Select(p => p.ToResponse()));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponse>> GetById(string id, CancellationToken ct)
    {
        var product = await repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Product '{id}' not found.");
        return Ok(product.ToResponse());
    }

    [HttpPost]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<ProductResponse>> Create([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        var product = request.ToEntity();
        var created = await repository.CreateAsync(product, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.ToResponse());
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<ProductResponse>> Update(string id, [FromBody] UpdateProductRequest request, CancellationToken ct)
    {
        var product = await repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Product '{id}' not found.");

        product.ApplyUpdate(request);
        var updated = await repository.UpdateAsync(product, ct);
        return Ok(updated.ToResponse());
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Admin")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        _ = await repository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Product '{id}' not found.");

        await repository.DeleteAsync(id, ct);
        return NoContent();
    }
}
