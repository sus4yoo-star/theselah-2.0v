import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { ServiceWorker } from "@/components/service-worker";
import { InstallPrompt } from "@/components/install-prompt";

export const metadata: Metadata = {
  metadataBase: new URL("https://amov-selah2.netlify.app"),

  title: {
    default: "SELAH — Pause before you respond",
    template: "%s | SELAH",
  },

  description:
    "크리스천을 위한 마음 동행",

  applicationName: "SELAH",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    title: "SELAH",
    statusBarStyle: "black-translucent",
  },

  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },

  openGraph: {
    title: "SELAH — Pause before you respond",
    description:
      "크리스천을 위한 마음 동행",
    url: "https://amov-selah2.netlify.app",
    siteName: "SELAH",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SELAH",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "SELAH — Pause before you respond",
    description:
      "크리스천을 위한 마음 동행",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#07111f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <LanguageProvider>
          {children}
          <ServiceWorker />
          <InstallPrompt />
        </LanguageProvider>
      </body>
    </html>
  );
}
