import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import ThemeRegistry from "@/lib/mui/ThemeRegistry";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToastProvider from "@/components/ToastProvider";
import SWRProvider from "@/components/SWRProvider";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_NAME_TC,
  SITE_URL,
} from "@/lib/site-config";
import "./globals.css";

const SITE_TITLE = `${SITE_NAME} — ${SITE_NAME_TC}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  applicationName: SITE_NAME,
  icons: {
    icon: "/maple-leaf.svg",
    apple: "/maple-leaf.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "zh_TW",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className="h-full">
      <head>
        {/* 預連線到首屏會打的外部 host:省 DNS + TLS handshake(~100-300ms) */}
        <link
          rel="preconnect"
          href="https://maplestory.io"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://cdn.discordapp.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <SessionProvider>
          <ThemeRegistry>
            <ToastProvider>
              <SWRProvider>
                <Navbar />
                <main className="flex-1 flex flex-col">{children}</main>
                <Footer />
              </SWRProvider>
            </ToastProvider>
          </ThemeRegistry>
        </SessionProvider>
      </body>
    </html>
  );
}
