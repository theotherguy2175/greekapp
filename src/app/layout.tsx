import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Noto_Serif } from "next/font/google";
import { Providers } from "@/components/Providers";
import { ClientOnly } from "@/components/ClientOnly";
import { Header } from "@/components/layout/Header";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin", "greek", "greek-ext"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Koiné Lexicon - Greek Dictionary & Flash Cards",
  description: "Look up Koine Greek words with real-time search and build flash cards for study.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Koiné Lexicon",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#a16207",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${notoSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 font-sans" style={{ fontFamily: "var(--font-geist), system-ui, sans-serif" }} suppressHydrationWarning>
        <Providers>
          <ClientOnly>
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </ClientOnly>
        </Providers>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
