import type { Metadata } from "next";
import LandingNav from "@/components/landing/landing-nav";
import { LandingSections } from "@/components/landing/landing-sections";
import { LandingScrollProvider } from "@/components/landing/landing-scroll-provider";
import { baseOpenGraph, baseTwitter } from "@/lib/metadata";

const title = "Apsara Assistant — AI Sales Assistant for Cambodian Sellers";
const description =
  "Apsara Assistant helps Cambodian sellers reply to customers faster. Chat naturally in Khmer, English, or romanized Khmer and let AI handle your sales conversations.";

export const metadata: Metadata = {
  // Bypass the layout title template on the home page for a full marketing title.
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { ...baseOpenGraph, url: "/", title, description },
  twitter: { ...baseTwitter, title, description },
};

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
