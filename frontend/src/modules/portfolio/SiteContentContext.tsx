import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchSiteContent } from '@/shared/api/endpoints'
import type { SiteContentResponse } from '@/shared/api/types'
import { DEFAULT_SITE_CONTENT } from '@/shared/lib/siteContentDefaults'

type SiteContentContextValue = {
  content: SiteContentResponse
  loading: boolean
  refresh: () => Promise<void>
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null)

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContentResponse>(DEFAULT_SITE_CONTENT)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      setContent(await fetchSiteContent())
    } catch {
      setContent(DEFAULT_SITE_CONTENT)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const value = useMemo(() => ({ content, loading, refresh }), [content, loading])

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>
}

export function useSiteContent(): SiteContentContextValue {
  const ctx = useContext(SiteContentContext)
  if (!ctx) {
    return {
      content: DEFAULT_SITE_CONTENT,
      loading: false,
      refresh: async () => {},
    }
  }
  return ctx
}
