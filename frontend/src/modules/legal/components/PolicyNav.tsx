import { Link, useLocation } from 'react-router-dom'
import { legalPages } from '@/shared/config/legal'

export function PolicyNav() {
  const { pathname } = useLocation()

  return (
    <nav aria-label="Tài liệu pháp lý" className="mt-10 border-t border-edge/70 pt-8">
      <p className="label-caps text-ink-subtle">Tài liệu liên quan</p>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {legalPages.map((page) => (
          <li key={page.path}>
            <Link
              to={page.path}
              className={
                pathname === page.path
                  ? 'text-gold-500'
                  : 'text-ink-muted transition hover:text-gold-300'
              }
              aria-current={pathname === page.path ? 'page' : undefined}
            >
              {page.shortTitle}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
