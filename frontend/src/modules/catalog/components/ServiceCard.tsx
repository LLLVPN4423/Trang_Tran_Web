import { useState } from 'react'
import type { HairSize, ServiceResponse } from '@/shared/api/types'
import { CATEGORY_LABELS, formatVnd, HAIR_SIZES, resolveServicePrice } from '@/shared/api/types'
import { useCartStore } from '@/shared/store/cartStore'

interface Props {
  service: ServiceResponse
}

export function ServiceCard({ service }: Props) {
  const addService = useCartStore((s) => s.addService)
  const needsSize = service.basePrice == null && service.priceBySize != null
  const [hairSize, setHairSize] = useState<HairSize>('M')
  const [added, setAdded] = useState(false)

  const price = needsSize
    ? resolveServicePrice(service, hairSize)
    : (service.basePrice ?? 0)

  const handleAdd = () => {
    addService(service, needsSize ? hairSize : 'M')
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <article className="group flex flex-col justify-between border border-zinc-800/60 p-6 transition hover:border-zinc-700">
      <div>
        <p className="text-xs uppercase tracking-widest text-gold-muted">
          {CATEGORY_LABELS[service.category]}
        </p>
        <h3 className="mt-2 font-serif text-2xl text-zinc-100">{service.name}</h3>
        {service.description && (
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">{service.description}</p>
        )}
        {service.durationMinutes && (
          <p className="mt-3 text-xs text-zinc-600">~{service.durationMinutes} phút</p>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {needsSize && (
          <div className="flex gap-2">
            {HAIR_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setHairSize(size)}
                className={`px-3 py-1 text-xs uppercase tracking-wider transition ${
                  hairSize === size
                    ? 'bg-gold/20 text-gold'
                    : 'border border-zinc-800 text-zinc-500 hover:border-zinc-600'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <span className="font-serif text-xl text-zinc-200">{formatVnd(price)}</span>
          <button
            type="button"
            onClick={handleAdd}
            className="shrink-0 border border-zinc-700 px-4 py-2 text-xs uppercase tracking-widest text-zinc-400 transition hover:border-gold hover:text-gold"
          >
            {added ? 'Đã thêm ✓' : 'Thêm'}
          </button>
        </div>
      </div>
    </article>
  )
}
