import { NavigationHeader } from "@/components/landing/navigation-header";
import { HeroSection } from "@/components/landing/hero-section";
import { StatsCounter } from "@/components/landing/stats-counter";
import { OpportunityDiscovery } from "@/components/landing/opportunity-discovery";
import { AIMatchingPreview } from "@/components/landing/ai-matching-preview";
import { GXScorePreview } from "@/components/landing/gx-score-preview";
import { PartnersSection } from "@/components/landing/partners-section";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export const dynamic = "force-static";

export const metadata = {
  title: "GlobalXcelerate – Build Your Global Career",
  description:
    "Connect with world-class internships, exchanges, and graduate opportunities across 40+ countries. AI-powered matching to find your perfect global experience.",
};

export default function HomePage() {
  return (
    <>
      <NavigationHeader />
      <main className="pt-16 overflow-x-hidden">
        <HeroSection />
        <StatsCounter />
        <OpportunityDiscovery />
        <AIMatchingPreview />
        <GXScorePreview />
        <PartnersSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
