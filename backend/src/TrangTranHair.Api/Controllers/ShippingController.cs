using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.Common;
using TrangTranHair.Application.DTOs;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/shipping")]
public class ShippingController : ControllerBase
{
    [HttpGet("zones")]
    public ActionResult<IReadOnlyList<ShippingZoneOption>> ListZones() =>
        Ok(ShippingCalculator.ListZones());
}
