import { parseProductVideoUrl } from '@/shared/lib/productMedia'

interface Props {
  videoUrl: string | null
  title: string
}

export function ProductVideo({ videoUrl, title }: Props) {
  const parsed = parseProductVideoUrl(videoUrl)
  if (!parsed) return null

  if (parsed.kind === 'drive' || parsed.kind === 'youtube') {
    return (
      <section className="mt-10">
        <h2 className="section-eyebrow mb-4">Video</h2>
        <div className="aspect-video w-full overflow-hidden rounded-sm border border-zinc-800 bg-black">
          <iframe
            src={parsed.embedUrl}
            title={`Video ${title}`}
            className="h-full w-full"
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>
    )
  }

  if (parsed.kind === 'mp4') {
    return (
      <section className="mt-10">
        <h2 className="section-eyebrow mb-4">Video</h2>
        <div className="overflow-hidden rounded-sm border border-zinc-800 bg-black">
          <video src={parsed.src} controls className="w-full" preload="metadata">
            Trình duyệt không hỗ trợ video.
          </video>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-10">
      <h2 className="section-eyebrow mb-4">Video sản phẩm</h2>
      <a
        href={parsed.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gold-muted hover:text-gold hover:underline"
      >
        Xem video (TikTok / link ngoài) →
      </a>
    </section>
  )
}
