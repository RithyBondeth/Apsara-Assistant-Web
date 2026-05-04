import type { Metadata } from "next";
import { Ubuntu, Kantumruy_Pro, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/utils/themes/theme-provider";
import { LanguageProvider } from "@/components/utils/languages/language-provider";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "optional",
});

const kantumruyPro = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  display: "optional",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s — Apsara Assistant",
    default: "Apsara Assistant",
  },
  description: "AI-powered sales assistant for Cambodian sellers. Understands Khmer, English, and romanized Khmer.",
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
