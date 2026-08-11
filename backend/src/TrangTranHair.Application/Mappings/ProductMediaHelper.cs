namespace TrangTranHair.Application.Mappings;

public static class ProductMediaHelper
{
    public const int MaxGalleryImages = 7;

    public static List<string> NormalizeGallery(string? imageUrl, IEnumerable<string>? galleryUrls)
    {
        var result = new List<string>();

        void Add(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return;
            var trimmed = url.Trim();
            if (result.Any(u => string.Equals(u, trimmed, StringComparison.OrdinalIgnoreCase))) return;
            if (result.Count >= MaxGalleryImages) return;
            result.Add(trimmed);
        }

        Add(imageUrl);
        if (galleryUrls is not null)
        {
            foreach (var url in galleryUrls)
                Add(url);
        }

        return result;
    }

    public static string? NormalizeVideoUrl(string? videoUrl) =>
        string.IsNullOrWhiteSpace(videoUrl) ? null : videoUrl.Trim();
}
