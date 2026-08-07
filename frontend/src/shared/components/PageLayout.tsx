import { type ReactNode } from 'react'
import { SiteHeader } from './SiteHeader'

interface Props {
  children: ReactNode
}

export function PageLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}
