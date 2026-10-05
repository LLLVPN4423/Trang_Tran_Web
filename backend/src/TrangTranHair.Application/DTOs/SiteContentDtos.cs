namespace TrangTranHair.Application.DTOs;

public sealed record LookbookItemDto(
    int Id,
    string Label,
    string ImageUrl,
    string Aspect,
    double Speed);

public sealed record HeroContentDto(
    string ImageUrl,
    string Eyebrow,
    string Title,
    string Tagline);

public sealed record ArtistContentDto(
    string MainImageUrl,
    string SecondaryImageUrl,
    string Eyebrow,
    string Heading,
    string HeadingAccent,
    string Bio,
    IReadOnlyList<string> StatementLines);

public sealed record LookbookSectionDto(
    string Eyebrow,
    string Title,
    IReadOnlyList<LookbookItemDto> Items);

public sealed record ContactContentDto(
    string Phone,
    string PhoneRaw,
    string Address,
    string Note);

public sealed record SocialLinkDto(string Label, string Url);

public sealed record SiteContentResponse(
    HeroContentDto Hero,
    ArtistContentDto Artist,
    LookbookSectionDto Lookbook,
    ContactContentDto Contact,
    IReadOnlyList<SocialLinkDto> SocialLinks);

public sealed record UpdateSiteContentRequest(
    HeroContentDto Hero,
    ArtistContentDto Artist,
    LookbookSectionDto Lookbook,
    ContactContentDto Contact,
    IReadOnlyList<SocialLinkDto> SocialLinks);
