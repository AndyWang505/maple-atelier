import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "模擬器",
  description: `${SITE_NAME}（楓葉工坊）的楓之谷紙娃娃時裝工具：即時試穿髮型、臉型、帽子、上下衣、武器等裝備，組好搭配可儲存並分享。`,
  alternates: { canonical: "/simulator" },
};

export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
