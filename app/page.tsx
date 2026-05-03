import LandingNav from "@/components/landing/landing-nav";
import LandingHero from "@/components/landing/landing-hero";
import LandingFeatures from "@/components/landing/landing-features";
import LandingHowItWorks from "@/components/landing/landing-how-it-works";
import LandingCta from "@/components/landing/landing-cta";
import LandingFooter from "@/components/landing/landing-footer";

export default function RootPage() {
  return (
    <div className="relative bg-background">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
