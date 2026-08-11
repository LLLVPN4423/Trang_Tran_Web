import { Link } from 'react-router-dom'
import { PageLayout } from '@/shared/components/PageLayout'

export function NotFoundPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-gold-muted">404</p>
        <h1 className="mt-4 font-serif text-4xl text-zinc-100">Không tìm thấy trang</h1>
        <p className="mt-4 text-sm text-zinc-500">Đường dẫn không tồn tại hoặc đã được đổi.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/" className="text-gold hover:underline">Trang chủ</Link>
          <Link to="/catalog" className="text-gold-muted hover:text-gold">Menu</Link>
          <Link to="/booking" className="text-gold-muted hover:text-gold">Giỏ hàng</Link>
        </div>
      </div>
    </PageLayout>
  )
}
