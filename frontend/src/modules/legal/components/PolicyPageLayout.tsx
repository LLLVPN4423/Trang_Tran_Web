import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageLayout } from '@/shared/components/PageLayout'
import { useSalonDocumentMeta } from '@/shared/hooks/useSalonDocumentMeta'
import {
  customerFacingPublicationLabel,
  isPageReadyForFinalPublication,
  pageHasBlockingGaps,
  showLegalDraftDiagnostics,
  type LegalPageMeta,
} from '@/shared/config/legal'
import { PolicyNav } from './PolicyNav'

interface Props {
  meta: LegalPageMeta
  children: ReactNode
}

export function PolicyPageLayout({ meta, children }: Props) {
  useSalonDocumentMeta(true, {
    title: `${meta.title} · Trang Trần Hair`,
    description: meta.description,
    canonicalPath: meta.path,
  })

  const ready = isPageReadyForFinalPublication(meta)
  const blocking = pageHasBlockingGaps(meta)
  const draftUi = showLegalDraftDiagnostics()

  return (
    <PageLayout>
      <article className="section-inner px-5 py-14 sm:px-8 sm:py-20">
        <p className="section-eyebrow">Thông tin pháp lý</p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">{meta.description}</p>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-subtle">
          <span>Phiên bản: {meta.version}</span>
          <span>Cập nhật: {meta.lastUpdated}</span>
          <Link to="/" className="text-gold-700 transition hover:text-gold-300">
            ← Trang chủ
          </Link>
        </div>

        {!ready && (
          <div
            className="mt-8 border border-gold-500/25 bg-gold-500/5 px-4 py-4 text-sm leading-relaxed text-ink-muted sm:px-5"
            role="status"
          >
            {customerFacingPublicationLabel(meta.publicationStatus)}
            {blocking && (
              <span className="mt-2 block text-ink-subtle">
                Các mục bắt buộc còn thiếu được ghi nhận nội bộ để chủ sở hữu bổ sung — website không bịa số liệu.
              </span>
            )}
          </div>
        )}

        {draftUi && (
          <div className="mt-4 border border-warning/30 bg-warning/10 px-4 py-3 font-mono text-[11px] leading-relaxed text-warning/95">
            DEV/DRAFT UI — publicationStatus: {meta.publicationStatus}
            {blocking ? ' · mandatory gaps: yes' : ' · mandatory gaps: no'}
          </div>
        )}

        <div className="legal-prose mt-12 max-w-3xl space-y-10 text-ink-muted">{children}</div>

        <PolicyNav />
      </article>
    </PageLayout>
  )
}

export function PolicySection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed sm:text-base">{children}</div>
    </section>
  )
}

export function PendingPolicyNote({ topic }: { topic: string }) {
  const draftUi = showLegalDraftDiagnostics()
  return (
    <p className="text-sm italic leading-relaxed text-ink-subtle sm:text-base">
      {topic}: thông tin đang được cập nhật bởi chủ sở hữu.
      {draftUi && (
        <span className="mt-1 block font-mono text-[10px] not-italic uppercase tracking-wider text-warning/90">
          pending owner policy text — not invented
        </span>
      )}
    </p>
  )
}
