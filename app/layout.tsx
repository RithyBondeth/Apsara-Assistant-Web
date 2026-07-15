import type { Metadata, Viewport } from "next";
import { Ubuntu, Kantumruy_Pro, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/utils/themes/theme-provider";
import { LanguageProvider } from "@/components/utils/languages/language-provider";
import {
  baseOpenGraph,
  baseTwitter,
  siteDescription,
  siteName,
  siteUrl,
} from "@/lib/metadata";
import "./globals.css";

// display: "swap" (not "optional") so a script's font always swaps in once
// loaded — critical for the minority script on a page (e.g. a Khmer customer
// name on the English UI), whose font may not be cached when that text first
// paints. Under "optional" it would stay stuck on a system fallback with no
// swap period, which is the font-not-applying symptom this pairs with the
// globals.css stack fix to solve.
const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const kantumruyPro = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s — ${siteName}`,
    default: siteName,
  },
  applicationName: siteName,
  description: siteDescription,
  keywords: [
    "Apsara Assistant",
    "AI sales assistant",
    "Cambodia",
    "Khmer",
    "romanized Khmer",
    "sales chatbot",
    "SME",
    "customer messaging",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  robots: { index: true, follow: true },
  openGraph: {
    ...baseOpenGraph,
    url: "/",
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    ...baseTwitter,
    title: siteName,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value ?? "en";

  return (
    <html
      lang={language}
      data-lang={language}
      suppressHydrationWarning
      className={`${ubuntu.variable} ${kantumruyPro.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
