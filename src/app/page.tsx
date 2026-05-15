import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import WhatshotOutlinedIcon from "@mui/icons-material/WhatshotOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import BrushOutlinedIcon from "@mui/icons-material/BrushOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import type { SvgIconComponent } from "@mui/icons-material";
import { getDb } from "@/db/client";
import { outfits, users } from "@/db/schema";
import { queryTopTags } from "@/lib/queries/top-tags";
import { authorNameSql } from "@/lib/queries/utils";
import OutfitCarousel from "@/components/OutfitCarousel";
import ShowcaseOutfitCard from "@/components/ShowcaseOutfitCard";
import HomeTagCloud from "@/components/HomeTagCloud";
import RevealOnScroll from "@/components/RevealOnScroll";
import PageShell from "@/components/layout/PageShell";
import ArrowLink from "@/components/ui/ArrowLink";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_NAME_TC,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site-config";

export const revalidate = 30;

const HOT_LIMIT = 12;
const LATEST_LIMIT = 12;
const TAG_LIMIT = 20;

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_URL,
  name: SITE_NAME,
  alternateName: SITE_NAME_TC,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "zh-Hant",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const showcaseSelect = {
  id: outfits.id,
  userId: outfits.userId,
  title: outfits.title,
  payload: outfits.payload,
  tags: outfits.tags,
  upvotes: outfits.upvotes,
  authorName: authorNameSql,
  authorImage: users.image,
} as const;

const carouselSlotClass =
  "basis-[60%] sm:basis-[40%] md:basis-[28%] lg:basis-[22%] shrink-0";

export default async function Home() {
  const db = getDb();

  const [hotRows, latestRows, topTags] = await Promise.all([
    db
      .select(showcaseSelect)
      .from(outfits)
      .leftJoin(users, eq(users.id, outfits.userId))
      .where(eq(outfits.isPublic, true))
      .orderBy(desc(outfits.upvotes), desc(outfits.createdAt))
      .limit(HOT_LIMIT),
    db
      .select(showcaseSelect)
      .from(outfits)
      .leftJoin(users, eq(users.id, outfits.userId))
      .where(eq(outfits.isPublic, true))
      .orderBy(desc(outfits.createdAt))
      .limit(LATEST_LIMIT),
    queryTopTags(db, TAG_LIMIT),
  ]);

  return (
    <div className="relative bg-[linear-gradient(180deg,rgb(254_215_170/0.18)_0%,#fff_20%,#fff_80%,rgb(253_186_116/0.18)_100%)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <PageShell className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl animate-gradient bg-gradient-to-br from-stone-950 via-zinc-900 to-stone-950 px-6 py-16 sm:py-24 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-maple-red/40 blur-3xl animate-blob-1"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-maple-leaf/35 blur-3xl animate-blob-2"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1.5px, transparent 1.5px), linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            backgroundPosition: "0 0, 0 14px, 14px 0",
          }}
        />
        <div className="relative">
          <h1
            className="text-5xl sm:text-7xl font-bold tracking-tight leading-none animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-maple-red via-maple-leaf to-amber-300"
            style={{ animationDelay: "0ms" }}
          >
            Maple Atelier
          </h1>
          <p
            className="mt-4 text-zinc-300 sm:text-lg font-medium tracking-wide animate-fade-in-up"
            style={{ animationDelay: "120ms" }}
          >
            {SITE_NAME_TC}
          </p>
          <p
            className="mt-4 text-zinc-400 max-w-md mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "220ms" }}
          >
            {SITE_TAGLINE}
          </p>
          <div
            className="mt-10 flex justify-center gap-3 flex-wrap animate-fade-in-up"
            style={{ animationDelay: "340ms" }}
          >
            <CtaPrimary href="/simulator" Icon={BrushOutlinedIcon}>
              開始搭配
            </CtaPrimary>
            <CtaSecondary href="/explore" Icon={ExploreOutlinedIcon}>
              探索作品
            </CtaSecondary>
          </div>
        </div>
      </section>

      {hotRows.length > 0 && (
        <RevealOnScroll>
          <section>
            <SectionHeader
              Icon={WhatshotOutlinedIcon}
              badgeColor="#fef3c7"
              iconColor="#ea580c"
              title="熱門搭配"
              subtitle="最近大家最愛的造型"
              link={{ href: "/explore", label: "看更多" }}
            />
            <OutfitCarousel autoplay autoplayDelay={5000}>
              {hotRows.map((row, i) => (
                <div key={row.id} className={carouselSlotClass}>
                  <ShowcaseOutfitCard outfit={row} priority={i === 0} />
                </div>
              ))}
            </OutfitCarousel>
          </section>
        </RevealOnScroll>
      )}

      {topTags.length > 0 && (
        <RevealOnScroll>
          <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-amber-50/80 via-white to-rose-50/70 px-5 sm:px-8 py-8 sm:py-10 shadow-md">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-300/40 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-maple-red/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #18181b 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative">
              <SectionHeader
                Icon={LocalOfferOutlinedIcon}
                badgeColor="#fef3c7"
                iconColor="#d97706"
                title="熱門標籤"
                subtitle="從你喜歡的風格找起"
              />
              <HomeTagCloud
                tags={topTags.map((t) => ({ tag: t.tag, count: Number(t.count) }))}
              />
            </div>
          </section>
        </RevealOnScroll>
      )}

      {latestRows.length > 0 && (
        <RevealOnScroll>
          <section>
            <SectionHeader
              Icon={AutoAwesomeOutlinedIcon}
              badgeColor="#fef9c3"
              iconColor="#ca8a04"
              title="最新搭配"
              subtitle="剛剛被分享上來的"
              link={{ href: "/explore?sort=new", label: "看更多" }}
            />
            <OutfitCarousel>
              {latestRows.map((row) => (
                <div key={row.id} className={carouselSlotClass}>
                  <ShowcaseOutfitCard outfit={row} />
                </div>
              ))}
            </OutfitCarousel>
          </section>
        </RevealOnScroll>
      )}

      <RevealOnScroll>
        <section className="text-center py-10 sm:py-14">
          <div
            aria-hidden
            className="flex items-center justify-center gap-3 mb-7"
          >
            <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-amber-300/60" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/maple-leaf.svg"
              alt=""
              width={20}
              height={20}
            />
            <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-amber-300/60" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-maple-red">
            現在，快來分享你的搭配吧
          </h2>
          <p className="mt-3 text-zinc-600 max-w-md mx-auto leading-relaxed">
            試穿、收藏、分享 — 把你最喜歡的造型，分享給更多楓友。
          </p>
          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <CtaPrimary href="/simulator" Icon={BrushOutlinedIcon}>
              開始搭配
            </CtaPrimary>
            <CtaSecondary
              href="/explore"
              Icon={ExploreOutlinedIcon}
              variant="light"
            >
              找更多靈感
            </CtaSecondary>
          </div>
        </section>
      </RevealOnScroll>
    </PageShell>
    </div>
  );
}

interface CtaProps {
  href: string;
  Icon: SvgIconComponent;
  children: React.ReactNode;
}

function CtaPrimary({ href, Icon, children }: CtaProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-maple-red text-white font-semibold no-underline hover:opacity-90 hover:shadow-lg hover:shadow-maple-red/30 transition shadow-md"
    >
      <Icon style={{ fontSize: 20 }} />
      {children}
    </Link>
  );
}

interface CtaSecondaryProps extends CtaProps {
  variant?: "dark" | "light";
}

function CtaSecondary({
  href,
  Icon,
  children,
  variant = "dark",
}: CtaSecondaryProps) {
  const cls =
    variant === "dark"
      ? "bg-white/10 backdrop-blur-sm border-white/25 text-white hover:bg-white/20"
      : "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm";
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-7 py-3 rounded-full border font-semibold no-underline transition ${cls}`}
    >
      <Icon style={{ fontSize: 20 }} />
      {children}
    </Link>
  );
}

interface SectionHeaderProps {
  Icon: SvgIconComponent;
  badgeColor: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  link?: { href: string; label: string };
}

function SectionHeader({
  Icon,
  badgeColor,
  iconColor,
  title,
  subtitle,
  link,
}: SectionHeaderProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
            style={{ backgroundColor: badgeColor }}
          >
            <Icon style={{ fontSize: 24, color: iconColor }} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {title}
          </h2>
        </div>
        {link && (
          <ArrowLink href={link.href} className="shrink-0">
            {link.label}
          </ArrowLink>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-zinc-500 mt-2 ml-14">{subtitle}</p>
      )}
    </div>
  );
}
