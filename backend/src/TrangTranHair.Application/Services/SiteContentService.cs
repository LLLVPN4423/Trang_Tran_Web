using TrangTranHair.Application.Common;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Exceptions;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Application.Services;

public sealed class SiteContentService(ISiteContentRepository repository) : ISiteContentService
{
    private static readonly HashSet<string> ValidAspects = new(StringComparer.OrdinalIgnoreCase)
    {
        "tall", "wide", "square",
    };

    public async Task<SiteContentResponse> GetHomepageAsync(CancellationToken cancellationToken = default)
    {
        var stored = await repository.GetHomepageAsync(cancellationToken);
        return MergeWithDefaults(stored ?? SiteContentDefaults.Create());
    }

    public async Task<SiteContentResponse> UpdateHomepageAsync(
        UpdateSiteContentRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(request);

        var normalized = Normalize(request);
        await repository.SaveHomepageAsync(normalized, cancellationToken);
        return normalized;
    }

    private static void Validate(UpdateSiteContentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Hero.ImageUrl))
            throw new ValidationException("hero.imageUrl", "Ảnh Hero là bắt buộc.");

        if (string.IsNullOrWhiteSpace(request.Artist.MainImageUrl))
            throw new ValidationException("artist.mainImageUrl", "Ảnh chính The Artist là bắt buộc.");

        if (request.Lookbook.Items is null || request.Lookbook.Items.Count == 0)
            throw new ValidationException("lookbook.items", "Cần ít nhất một ảnh Lookbook.");

        if (request.Lookbook.Items.Count > 24)
            throw new ValidationException("lookbook.items", "Tối đa 24 ảnh Lookbook.");

        foreach (var item in request.Lookbook.Items)
        {
            if (string.IsNullOrWhiteSpace(item.ImageUrl))
                throw new ValidationException("lookbook.items", $"Ảnh Lookbook #{item.Id} thiếu link.");

            if (!ValidAspects.Contains(item.Aspect))
                throw new ValidationException("lookbook.items", $"Lookbook #{item.Id}: aspect phải là tall, wide hoặc square.");
        }

        if (string.IsNullOrWhiteSpace(request.Contact.Phone))
            throw new ValidationException("contact.phone", "Số điện thoại hiển thị là bắt buộc.");

        if (string.IsNullOrWhiteSpace(request.Contact.Address))
            throw new ValidationException("contact.address", "Địa chỉ là bắt buộc.");

        var socialCount = request.SocialLinks?.Count(l => !string.IsNullOrWhiteSpace(l.Url)) ?? 0;
        if (socialCount > 16)
            throw new ValidationException("socialLinks", "Tối đa 16 link mạng xã hội.");
    }

    private static SiteContentResponse Normalize(UpdateSiteContentRequest request)
    {
        var lookbookItems = request.Lookbook.Items
            .Select((item, index) => new LookbookItemDto(
                item.Id > 0 ? item.Id : index + 1,
                item.Label.Trim(),
                item.ImageUrl.Trim(),
                item.Aspect.Trim().ToLowerInvariant(),
                Math.Clamp(item.Speed, 0.05, 0.35)))
            .ToList();

        return new SiteContentResponse(
            new HeroContentDto(
                request.Hero.ImageUrl.Trim(),
                request.Hero.Eyebrow.Trim(),
                request.Hero.Title.Trim(),
                request.Hero.Tagline.Trim()),
            new ArtistContentDto(
                request.Artist.MainImageUrl.Trim(),
                request.Artist.SecondaryImageUrl.Trim(),
                request.Artist.Eyebrow.Trim(),
                request.Artist.Heading.Trim(),
                request.Artist.HeadingAccent.Trim(),
                request.Artist.Bio.Trim(),
                request.Artist.StatementLines
                    .Select(l => l.Trim())
                    .Where(l => !string.IsNullOrWhiteSpace(l))
                    .ToList()),
            new LookbookSectionDto(
                request.Lookbook.Eyebrow.Trim(),
                request.Lookbook.Title.Trim(),
                lookbookItems),
            NormalizeContact(request.Contact),
            NormalizeSocialLinks(request.SocialLinks));
    }

    private static SiteContentResponse MergeWithDefaults(SiteContentResponse content)
    {
        var defaults = SiteContentDefaults.Create();
        var contact = string.IsNullOrWhiteSpace(content.Contact.Phone)
            ? defaults.Contact
            : NormalizeContact(content.Contact);

        var socialLinks = content.SocialLinks is { Count: > 0 }
            ? NormalizeSocialLinks(content.SocialLinks)
            : defaults.SocialLinks;

        return content with { Contact = contact, SocialLinks = socialLinks };
    }

    private static ContactContentDto NormalizeContact(ContactContentDto contact)
    {
        var phone = contact.Phone.Trim();
        var phoneRaw = contact.PhoneRaw.Trim();
        if (string.IsNullOrWhiteSpace(phoneRaw))
            phoneRaw = new string(phone.Where(char.IsDigit).ToArray());

        return new ContactContentDto(
            phone,
            phoneRaw,
            contact.Address.Trim(),
            contact.Note.Trim());
    }

    private static IReadOnlyList<SocialLinkDto> NormalizeSocialLinks(IReadOnlyList<SocialLinkDto>? links) =>
        (links ?? [])
            .Select(l => new SocialLinkDto(l.Label.Trim(), l.Url.Trim()))
            .Where(l => !string.IsNullOrWhiteSpace(l.Label) && !string.IsNullOrWhiteSpace(l.Url))
            .ToList();
}
