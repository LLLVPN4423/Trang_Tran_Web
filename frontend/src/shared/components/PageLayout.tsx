import { type ReactNode } from 'react'
import { AppShell } from './AppShell'
import { SalonPresenceFooter } from './SalonPresenceFooter'

interface Props {
  children: ReactNode
  variant?: 'customer' | 'admin'
  showSidebar?: boolean
}

export function PageLayout({ children, variant = 'customer', showSidebar = true }: Props) {
  return (
    <AppShell variant={variant} showSidebar={showSidebar}>
      {children}
      {variant === 'customer' && <SalonPresenceFooter />}
    </AppShell>
  )
}
