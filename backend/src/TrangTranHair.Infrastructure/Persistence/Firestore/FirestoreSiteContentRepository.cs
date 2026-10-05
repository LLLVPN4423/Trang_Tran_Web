using Google.Cloud.Firestore;
using TrangTranHair.Application.Common;
using TrangTranHair.Application.DTOs;
using TrangTranHair.Application.Interfaces;

namespace TrangTranHair.Infrastructure.Persistence.Firestore;

public sealed class FirestoreSiteContentRepository(FirestoreDb db) : ISiteContentRepository
{
    private const string HomepageId = "homepage";

    private DocumentReference Document => db.Collection("siteContent").Document(HomepageId);

    public async Task<SiteContentResponse?> GetHomepageAsync(CancellationToken cancellationToken = default)
    {
        var snapshot = await Document.GetSnapshotAsync(cancellationToken);
        if (!snapshot.Exists) return null;

        var doc = snapshot.ConvertTo<SiteContentDocument>();
        return MapFromDocument(doc);
    }

    public async Task SaveHomepageAsync(SiteContentResponse content, CancellationToken cancellationToken = default)
    {
        await Document.SetAsync(MapToDocument(content), cancellationToken: cancellationToken);
    }

    private static SiteContentResponse MapFromDocument(SiteContentDocument doc)
    {
        var defaults = SiteContentDefaults.Create();
        var contactDoc = doc.Contact;
        var contact = contactDoc is null || string.IsNullOrWhiteSpace(contactDoc.Phone)
            ? defaults.Contact
            : new ContactContentDto(
                contactDoc.Phone,
                contactDoc.PhoneRaw,
                contactDoc.Address,
                contactDoc.Note);

        var socialLinks = doc.SocialLinks is { Count: > 0 }
            ? doc.SocialLinks
                .Where(l => !string.IsNullOrWhiteSpace(l.Url))
                .Select(l => new SocialLinkDto(l.Label, l.Url))
                .ToList()
            : defaults.SocialLinks;

        return new SiteContentResponse(
            new HeroContentDto(
                doc.Hero.ImageUrl,
                doc.Hero.Eyebrow,
                doc.Hero.Title,
                doc.Hero.Tagline),
            new ArtistContentDto(
                doc.Artist.MainImageUrl,
                doc.Artist.SecondaryImageUrl,
                doc.Artist.Eyebrow,
                doc.Artist.Heading,
                doc.Artist.HeadingAccent,
                doc.Artist.Bio,
                doc.Artist.StatementLines ?? []),
            new LookbookSectionDto(
                doc.Lookbook.Eyebrow,
                doc.Lookbook.Title,
                doc.Lookbook.Items.Select(i => new LookbookItemDto(
                    i.Id,
                    i.Label,
                    i.ImageUrl,
                    i.Aspect,
                    i.Speed)).ToList()),
            contact,
            socialLinks);
    }

    private static SiteContentDocument MapToDocument(SiteContentResponse content) =>
        new()
        {
            Hero = new HeroContentDocument
            {
                ImageUrl = content.Hero.ImageUrl,
                Eyebrow = content.Hero.Eyebrow,
                Title = content.Hero.Title,
                Tagline = content.Hero.Tagline,
            },
            Artist = new ArtistContentDocument
            {
                MainImageUrl = content.Artist.MainImageUrl,
                SecondaryImageUrl = content.Artist.SecondaryImageUrl,
                Eyebrow = content.Artist.Eyebrow,
                Heading = content.Artist.Heading,
                HeadingAccent = content.Artist.HeadingAccent,
                Bio = content.Artist.Bio,
                StatementLines = content.Artist.StatementLines.ToList(),
            },
            Lookbook = new LookbookSectionDocument
            {
                Eyebrow = content.Lookbook.Eyebrow,
                Title = content.Lookbook.Title,
                Items = content.Lookbook.Items.Select(i => new LookbookItemDocument
                {
                    Id = i.Id,
                    Label = i.Label,
                    ImageUrl = i.ImageUrl,
                    Aspect = i.Aspect,
                    Speed = i.Speed,
                }).ToList(),
            },
            Contact = new ContactContentDocument
            {
                Phone = content.Contact.Phone,
                PhoneRaw = content.Contact.PhoneRaw,
                Address = content.Contact.Address,
                Note = content.Contact.Note,
            },
            SocialLinks = content.SocialLinks
                .Select(l => new SocialLinkDocument { Label = l.Label, Url = l.Url })
                .ToList(),
            UpdatedAt = FirestoreMapper.ToTimestamp(DateTime.UtcNow),
        };
}

[FirestoreData]
internal sealed class SiteContentDocument
{
    [FirestoreProperty]
    public HeroContentDocument Hero { get; set; } = new();

    [FirestoreProperty]
    public ArtistContentDocument Artist { get; set; } = new();

    [FirestoreProperty]
    public LookbookSectionDocument Lookbook { get; set; } = new();

    [FirestoreProperty]
    public ContactContentDocument? Contact { get; set; }

    [FirestoreProperty]
    public List<SocialLinkDocument>? SocialLinks { get; set; }

    [FirestoreProperty]
    public Timestamp UpdatedAt { get; set; }
}

[FirestoreData]
internal sealed class ContactContentDocument
{
    [FirestoreProperty]
    public string Phone { get; set; } = string.Empty;

    [FirestoreProperty]
    public string PhoneRaw { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Address { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Note { get; set; } = string.Empty;
}

[FirestoreData]
internal sealed class SocialLinkDocument
{
    [FirestoreProperty]
    public string Label { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Url { get; set; } = string.Empty;
}

[FirestoreData]
internal sealed class HeroContentDocument
{
    [FirestoreProperty]
    public string ImageUrl { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Eyebrow { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Title { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Tagline { get; set; } = string.Empty;
}

[FirestoreData]
internal sealed class ArtistContentDocument
{
    [FirestoreProperty]
    public string MainImageUrl { get; set; } = string.Empty;

    [FirestoreProperty]
    public string SecondaryImageUrl { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Eyebrow { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Heading { get; set; } = string.Empty;

    [FirestoreProperty]
    public string HeadingAccent { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Bio { get; set; } = string.Empty;

    [FirestoreProperty]
    public List<string> StatementLines { get; set; } = [];
}

[FirestoreData]
internal sealed class LookbookSectionDocument
{
    [FirestoreProperty]
    public string Eyebrow { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Title { get; set; } = string.Empty;

    [FirestoreProperty]
    public List<LookbookItemDocument> Items { get; set; } = [];
}

[FirestoreData]
internal sealed class LookbookItemDocument
{
    [FirestoreProperty]
    public int Id { get; set; }

    [FirestoreProperty]
    public string Label { get; set; } = string.Empty;

    [FirestoreProperty]
    public string ImageUrl { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Aspect { get; set; } = "square";

    [FirestoreProperty]
    public double Speed { get; set; }
}
