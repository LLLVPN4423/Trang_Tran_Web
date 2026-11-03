import type { ProductResponse } from '@/shared/api/types'

export const MAX_PRODUCT_GALLERY = 7

/** Trích ID file từ link chia sẻ Google Drive. */
export function extractGoogleDriveFileId(url: string): string | null {
  const trimmed = url.trim()
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i,
    /drive\.google\.com\/uc\?(?:export=(?:view|download)&)?id=([a-zA-Z0-9_-]+)/i,
    /[?&]id=([a-zA-Z0-9_-]{10,})/i,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

export function isGoogleDriveUrl(url: string): boolean {
  return /drive\.google\.com/i.test(url) || extractGoogleDriveFileId(url) !== null
}

/** URL hiển thị ảnh — tự chuyển link Drive sang dạng xem được trên web. */
export function resolveProductImageUrl(url: string): string {
  const id = extractGoogleDriveFileId(url)
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`
  return url.trim()
}

export function getProductGallery(product: Pick<ProductResponse, 'imageUrl' | 'galleryUrls'>): string[] {
  const seen = new Set<string>()
  const urls: string[] = []

  const add = (url: string | null | undefined) => {
    if (!url?.trim()) return
    const key = url.trim()
    const dedupeKey = extractGoogleDriveFileId(key) ?? key.toLowerCase()
    if (seen.has(dedupeKey)) return
    if (urls.length >= MAX_PRODUCT_GALLERY) return
    seen.add(dedupeKey)
    urls.push(key)
  }

  add(product.imageUrl)
  for (const url of product.galleryUrls ?? []) add(url)

  return urls
}

export type ProductVideoEmbed =
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'drive'; embedUrl: string }
  | { kind: 'mp4'; src: string }
  | { kind: 'external'; href: string }

export function parseProductVideoUrl(url: string | null | undefined): ProductVideoEmbed | null {
  if (!url?.trim()) return null
  const href = url.trim()

  const driveId = extractGoogleDriveFileId(href)
  if (driveId) {
    return {
      kind: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
    }
  }

  const ytMatch =
    href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/i) ??
    href.match(/youtube\.com\/.*[?&]v=([\w-]{11})/i)

  if (ytMatch?.[1]) {
    return {
      kind: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`,
    }
  }

  if (/\.(mp4|webm|mov)(\?|$)/i.test(href)) {
    return { kind: 'mp4', src: href }
  }

  return { kind: 'external', href }
}

export function parseGalleryLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_PRODUCT_GALLERY)
}

export function getCatalogGallery(item: Pick<ProductResponse, 'imageUrl' | 'galleryUrls'>): string[] {
  return getProductGallery(item)
}

export function galleryToTextarea(urls: string[] | null | undefined): string {
  return (urls ?? []).join('\n')
}

export const GOOGLE_DRIVE_SHARE_HINT =
  'Trên Drive: Chuột phải file → Chia sẻ → "Bất kỳ ai có đường liên kết" → Sao chép liên kết → dán vào Admin.'
