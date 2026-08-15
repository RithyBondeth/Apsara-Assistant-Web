import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Kantumruy_Pro, Ubuntu } from "next/font/google";
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

const ubuntu = Ubuntu({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu",
  display: "swap",
});

const kantumruy = Kantumruy_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["khmer"],
  variable: "--font-kantumruy",
  display: "swap",
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
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${ubuntu.variable} ${kantumruy.variable} h-full antialiased`}
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
