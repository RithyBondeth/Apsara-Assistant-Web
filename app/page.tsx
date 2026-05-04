import LandingNav from "@/components/landing/landing-nav";
import { LandingSections } from "@/components/landing/landing-sections";

export default function RootPage() {
  return (
    <div className="relative bg-background">
      <LandingNav />
      <LandingSections />
    </div>
  );
}
