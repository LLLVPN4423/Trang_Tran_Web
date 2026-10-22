import { Link } from 'react-router-dom'
import { PageLayout } from '@/shared/components/PageLayout'

export function NotFoundPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-700">404</p>
        <h1 className="mt-4 font-serif text-4xl text-ink">Không tìm thấy trang</h1>
        <p className="mt-4 text-sm text-ink-subtle">Đường dẫn không tồn tại hoặc đã được đổi.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/" className="text-gold-500 hover:underline">Trang chủ</Link>
          <Link to="/catalog" className="text-gold-700 hover:text-gold-300">Menu</Link>
          <Link to="/booking" className="text-gold-700 hover:text-gold-300">Giỏ hàng</Link>
        </div>
      </div>
    </PageLayout>
  )
}
