import { useState, type ReactNode } from 'react'
import { SiteHeader } from './SiteHeader'
import { AppSidebar } from './AppSidebar'

interface Props {
  children: ReactNode
  variant?: 'customer' | 'admin'
  showSidebar?: boolean
}

export function AppShell({ children, variant = 'customer', showSidebar = true }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <SiteHeader onMenuClick={() => setMobileOpen(true)} showMenuButton={false} />
        <main>{children}</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <SiteHeader onMenuClick={() => setMobileOpen(true)} />

      <div className="mx-auto flex max-w-7xl">
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-[var(--header-height)] h-[calc(100dvh-var(--header-height))] overflow-y-auto">
            <AppSidebar variant={variant} />
          </div>
        </div>

        <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[min(100%,280px)] shadow-2xl">
            <AppSidebar variant={variant} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
