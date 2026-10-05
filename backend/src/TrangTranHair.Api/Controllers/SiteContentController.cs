using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Api.Controllers;

[ApiController]
[Route("api/site-content")]
public class SiteContentController(ISiteContentService siteContentService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SiteContentResponse>> GetHomepage(CancellationToken ct) =>
        Ok(await siteContentService.GetHomepageAsync(ct));

    [HttpPut]
    [Authorize(Policy = "Admin")]
    public async Task<ActionResult<SiteContentResponse>> UpdateHomepage(
        [FromBody] UpdateSiteContentRequest request,
        CancellationToken ct) =>
        Ok(await siteContentService.UpdateHomepageAsync(request, ct));
}
