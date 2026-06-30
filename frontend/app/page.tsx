import { CompassHubSection } from '@/components/home/CompassHubSection'
import { HeroSection } from '@/components/home/HeroSection'
import { QuickLinksSection } from '@/components/home/QuickLinksSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CompassHubSection />
      <QuickLinksSection />
    </div>
  )
}
