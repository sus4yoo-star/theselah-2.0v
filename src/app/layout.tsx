import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { ServiceWorker } from "@/components/service-worker";
import { InstallPrompt } from "@/components/install-prompt";
import { normalizeLang } from "@/lib/i18n";
import type { LangCode } from "@/lib/types";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the language cookie on the server so SSR already renders in the
  // user's chosen language (prevents the English flash for Korean users).
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("selah_lang")?.value;
  const initialLang: LangCode = cookieLang
    ? normalizeLang(cookieLang)
    : "ko";

  return (
    <html lang={initialLang} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <LanguageProvider initialLang={initialLang}>
          {children}
          <ServiceWorker />
          <InstallPrompt />
        </LanguageProvider>
      </body>
    </html>
  );
}
