import { SALON_FAQ } from '@/shared/lib/salonFaq'

/** FAQ công khai — giúp Google / khách tìm “salon Sóc Trăng”, không tốn phí hosting. */
export function SalonFaqSection() {
  return (
    <section id="faq" className="section-shell border-t border-zinc-900/90 bg-zinc-950">
      <div className="section-inner py-16 md:py-24">
        <p className="section-eyebrow">FAQ</p>
        <h2 className="section-title">Câu hỏi thường gặp</h2>
        <p className="section-body mt-4 max-w-xl">
          Thông tin nhanh khi tìm salon tóc tại Sóc Trăng — cũng giúp Google hiểu rõ dịch vụ và địa chỉ tiệm.
        </p>
        <ul className="mt-10 space-y-3">
          {SALON_FAQ.map((item) => (
            <li key={item.question}>
              <details className="group rounded-sm border border-zinc-800/80 bg-zinc-900/20 px-4 py-3 open:border-gold/20">
                <summary className="cursor-pointer list-none text-sm font-medium text-zinc-200 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.question}
                    <span className="text-gold-muted transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
