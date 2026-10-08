import { SALON_PUBLIC } from '@/shared/lib/salonPublicInfo'

/** URL trang công khai (dùng khi share — luôn trỏ domain chính). */
export function salonPublicUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SALON_PUBLIC.siteUrl}${normalized === '/' ? '/' : normalized}`
}

export function facebookShareUrl(pageUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
}

export async function copySalonLink(pageUrl: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(pageUrl)
    return true
  } catch {
    return false
  }
}

export function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

export async function shareSalonNative(opts: {
  url: string
  title: string
  text: string
}): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (!canUseWebShare()) return 'unsupported'
  try {
    await navigator.share({ url: opts.url, title: opts.title, text: opts.text })
    return 'shared'
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    return 'unsupported'
  }
}
