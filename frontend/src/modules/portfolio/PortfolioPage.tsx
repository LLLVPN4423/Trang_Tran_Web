import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { AppShell } from '@/shared/components/AppShell'
import { SmoothScrollProvider } from '@/app/providers/SmoothScrollProvider'
import { HeroSection } from './sections/HeroSection'
import { ArtistSection } from './sections/ArtistSection'
import { GallerySection } from './sections/GallerySection'
import { LookbookSection } from './sections/LookbookSection'
import { CatalogSection } from './sections/CatalogSection'
import { BookingSection } from './sections/BookingSection'

export function PortfolioPage() {
  return (
    <ModuleErrorBoundary moduleName="Portfolio">
      <AppShell>
        <SmoothScrollProvider>
          <div className="bg-zinc-950">
            <HeroSection />
            <ArtistSection />
            <GallerySection />
            <LookbookSection />
            <CatalogSection />
            <BookingSection />
          </div>
        </SmoothScrollProvider>
      </AppShell>
    </ModuleErrorBoundary>
  )
}
