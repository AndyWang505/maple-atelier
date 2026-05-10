import Link from "next/link";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import GitHubIcon from "@mui/icons-material/GitHub";
import { NAV_LINKS, SITE_LINKS } from "@/lib/site-config";

const DISCLAIMER_ITEMS = [
  "本站為非官方平台，與 Nexon 或遊戲橘子無關",
  "遊戲素材版權屬 Nexon Korea / Nexon America 所有",
  "僅作非商業性質時裝搭配參考之用",
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-zinc-100 bg-zinc-50">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8">
          <div className="sm:col-span-7">
            <Link href="/" className="no-underline">
              <Typography
                variant="h6"
                color="primary"
                sx={{ fontWeight: 700, letterSpacing: 0.5 }}
              >
                Maple Atelier
              </Typography>
            </Link>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, maxWidth: 360, lineHeight: 1.75 }}
            >
              新楓之谷時裝搭配社群工具。即時試穿、儲存、分享造型。
            </Typography>
            <a
              href={SITE_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full bg-zinc-100 text-xs font-medium text-zinc-700 hover:bg-zinc-900 hover:text-white transition no-underline"
            >
              <GitHubIcon style={{ fontSize: 14 }} />
              Open source on GitHub
            </a>
          </div>

          <FooterColumn title="瀏覽" className="sm:col-span-5">
            <ul className="list-none p-0 m-0 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {NAV_LINKS.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-sm text-zinc-700 hover:text-maple-red transition no-underline group"
                  >
                    <Icon
                      style={{ fontSize: 18 }}
                      className="text-zinc-400 group-hover:text-maple-red transition"
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>
        </div>

        <Divider sx={{ my: 3 }} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ fontSize: "inherit" }}
            >
              © {year} Maple Atelier
            </Typography>
            <Link
              href="/privacy"
              className="text-zinc-500 hover:text-maple-red no-underline transition"
            >
              隱私政策
            </Link>
          </div>
          <ul className="list-none p-0 m-0 flex flex-wrap items-center gap-y-1 text-xs text-zinc-400">
            {DISCLAIMER_ITEMS.map((item, i) => (
              <li key={item} className="flex items-center">
                {i > 0 && (
                  <span aria-hidden className="mx-3 text-zinc-300">
                    ·
                  </span>
                )}
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

function FooterColumn({ title, className, children }: FooterColumnProps) {
  return (
    <div className={className}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{
          fontWeight: 700,
          letterSpacing: 1.2,
          display: "block",
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      {children}
    </div>
  );
}
