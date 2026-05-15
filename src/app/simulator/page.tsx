import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import SimulatorClient from "./SimulatorClient";

export const metadata: Metadata = {
  title: "楓之谷紙娃娃模擬器",
  description:
    "楓之谷時裝紙娃娃工具，即時試穿髮型、臉型、衣裝等裝備，儲存搭配並與其他楓友分享造型。",
  keywords: [
    "楓之谷紙娃娃",
    "紙娃娃模擬器",
    "楓之谷時裝",
    "時裝搭配",
    "MapleStory simulator",
    "楓之谷造型",
  ],
  alternates: {
    canonical: "/simulator",
  },
  openGraph: {
    title: `楓之谷紙娃娃模擬器 | ${SITE_NAME}`,
    description: "即時試穿楓之谷裝備，儲存並分享你的造型搭配。",
    url: `${SITE_URL}/simulator`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "楓之谷紙娃娃模擬器",
  description:
    "楓之谷時裝紙娃娃工具，即時試穿髮型、臉型、衣裝等裝備，儲存搭配並與其他楓友分享造型。",
  url: `${SITE_URL}/simulator`,
  applicationCategory: "GameApplication",
  inLanguage: "zh-TW",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "TWD",
  },
};

export default function SimulatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SimulatorClient />
    </>
  );
}
