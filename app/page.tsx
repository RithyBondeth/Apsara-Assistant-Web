import LandingNav from "@/components/landing/landing-nav";
import { LandingSections } from "@/components/landing/landing-sections";
import { LandingScrollProvider } from "@/components/landing/landing-scroll-provider";

export default function RootPage() {
  return (
    <LandingScrollProvider>
      <div className="relative bg-background">
        <LandingNav />
        <LandingSections />
      </div>
    </LandingScrollProvider>
  );
}
