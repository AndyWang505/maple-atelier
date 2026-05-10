import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface ArrowLinkProps {
  href: string;
  direction?: "forward" | "back";
  tone?: "primary" | "muted";
  className?: string;
  children: React.ReactNode;
}

const TONE_CLASS = {
  primary: "text-maple-red",
  muted: "text-zinc-500 hover:text-maple-red",
} as const;

export default function ArrowLink({
  href,
  direction = "forward",
  tone = "primary",
  className = "",
  children,
}: ArrowLinkProps) {
  const isBack = direction === "back";
  const Icon = isBack ? ArrowBackIcon : ArrowForwardIcon;
  const slide = isBack
    ? "group-hover:-translate-x-1.5 group-focus-visible:-translate-x-1.5"
    : "group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5";
  const underlineOrigin = isBack
    ? "origin-left group-hover:origin-right group-focus-visible:origin-right"
    : "origin-right group-hover:origin-left group-focus-visible:origin-left";
  const arrow = (
    <Icon
      className={`transition-transform duration-300 ease-out ${slide}`}
      style={{ fontSize: 16 }}
    />
  );
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1 text-sm font-medium no-underline outline-none transition-colors duration-300 ${TONE_CLASS[tone]} ${className}`}
    >
      {isBack && arrow}
      <span className="relative">
        {children}
        <span
          aria-hidden
          className={`pointer-events-none absolute left-0 -bottom-0.5 h-[2px] w-full bg-current scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 ${underlineOrigin}`}
        />
      </span>
      {!isBack && arrow}
    </Link>
  );
}
