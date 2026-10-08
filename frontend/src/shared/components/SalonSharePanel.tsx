import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SALON_PUBLIC } from '@/shared/lib/salonPublicInfo'
import {
  copySalonLink,
  facebookShareUrl,
  salonPublicUrl,
  shareSalonNative,
} from '@/shared/lib/salonShare'

type Props = {
  /** Đường dẫn share; mặc định trang hiện tại. */
  path?: string
  compact?: boolean
}

/** Chia sẻ link salon — copy / Facebook / chia sẻ máy (không phí). */
export function SalonSharePanel({ path, compact }: Props) {
  const { pathname } = useLocation()
  const sharePath = path ?? pathname
  const url = salonPublicUrl(sharePath)
  const [copied, setCopied] = useState(false)

  const shareTitle = `${SALON_PUBLIC.nameVi} · Sóc Trăng`
  const shareText = `Đặt lịch & bảng giá: ${url} · Hotline ${SALON_PUBLIC.phoneDisplay}`

  const onCopy = async () => {
    const ok = await copySalonLink(url)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    }
  }

  const onNativeShare = async () => {
    const result = await shareSalonNative({ url, title: shareTitle, text: shareText })
    if (result === 'unsupported') await onCopy()
  }

  const btn =
    'rounded-sm border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-zinc-300 transition hover:border-gold/40 hover:text-gold'

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onCopy} className={btn}>
          {copied ? 'Đã copy link' : 'Copy link'}
        </button>
        <a href={facebookShareUrl(url)} target="_blank" rel="noopener noreferrer" className={btn}>
          Facebook
        </a>
        <button type="button" onClick={onNativeShare} className={btn}>
          Chia sẻ
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-sm border border-zinc-800/80 bg-zinc-900/30 p-5">
      <p className="label-caps text-zinc-600">Giới thiệu salon (miễn phí)</p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        Gửi link web cho bạn bè hoặc đăng lên Facebook — khách vào thẳng bảng giá và đặt lịch, không cần app
        quảng cáo.
      </p>
      <p className="mt-3 break-all font-mono text-xs text-zinc-500">{url}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onCopy} className="btn-gold px-4 py-2 text-[10px] uppercase tracking-widest">
          {copied ? 'Đã copy' : 'Copy link web'}
        </button>
        <a
          href={facebookShareUrl(url)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-editorial px-4 py-2 text-[10px] uppercase tracking-widest"
        >
          Chia sẻ Facebook
        </a>
        <button type="button" onClick={onNativeShare} className={btn}>
          Chia sẻ điện thoại
        </button>
      </div>
    </div>
  )
}
