import { ModuleErrorBoundary } from '@/shared/components/ModuleErrorBoundary'
import { FloatingCart } from '@/shared/components/FloatingCart'
import { SmoothScrollProvider } from '@/app/providers/SmoothScrollProvider'
import { HeroSection } from './sections/HeroSection'
import { ArtistSection } from './sections/ArtistSection'
import { LookbookSection } from './sections/LookbookSection'
import { CatalogSection } from './sections/CatalogSection'
import { BookingSection } from './sections/BookingSection'

export function PortfolioPage() {
  return (
    <ModuleErrorBoundary moduleName="Portfolio">
      <SmoothScrollProvider>
        <main className="bg-zinc-950">
          <HeroSection />
          <ArtistSection />
          <LookbookSection />
          <CatalogSection />
          <BookingSection />
          <FloatingCart />
        </main>
      </SmoothScrollProvider>
    </ModuleErrorBoundary>
  )
}
