import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import ThemeRegistry from "@/lib/mui/ThemeRegistry";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ToastProvider from "@/components/ToastProvider";
import SWRProvider from "@/components/SWRProvider";
import { SITE_NAME, SITE_NAME_TC } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${SITE_NAME} ${SITE_NAME_TC}`,
  description: "新楓之谷時裝搭配社群 — 致敬「放大鏡」",
  icons: {
    icon: "/maple-leaf.svg",
    apple: "/maple-leaf.png",
  },
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
