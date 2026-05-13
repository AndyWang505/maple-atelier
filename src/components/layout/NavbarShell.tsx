"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import { NAV_LINKS } from "@/lib/site-config";
import NavbarSignInButton from "./NavbarSignInButton";
import NavbarUserMenu from "./NavbarUserMenu";

interface NavbarShellProps {
  user: { name: string; image: string | null } | null;
}

const APP_BAR_SX = {
  bgcolor: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(228, 228, 231, 0.6)",
  boxShadow: "0 1px 8px 0 rgba(0, 0, 0, 0.06)",
} as const;

const TOOLBAR_SX = { maxWidth: "1280px", width: "100%", mx: "auto" } as const;

const DESKTOP_NAV_SX = {
  display: { xs: "none", md: "flex" },
  alignItems: "center",
  gap: 1,
} as const;

const HAMBURGER_SX = {
  display: { xs: "inline-flex", md: "none" },
} as const;

const ACTIVE_BUTTON_SX = {
  fontWeight: 700,
  backgroundColor: "rgba(0, 0, 0, 0.05)",
  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.08)" },
} as const;

const ACTIVE_LIST_TEXT_SX = { fontWeight: 700 } as const;
const INACTIVE_LIST_TEXT_SX = { fontWeight: 500 } as const;

const DRAWER_PAPER_SX = { width: 260, pt: 2 } as const;

export default function NavbarShell({ user }: NavbarShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeHref = useMemo(
    () =>
      NAV_LINKS.find(
        ({ href }) => pathname === href || pathname.startsWith(`${href}/`),
      )?.href,
    [pathname],
  );

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <AppBar position="sticky" color="default" elevation={0} sx={APP_BAR_SX}>
        <Toolbar className="gap-4" sx={TOOLBAR_SX}>
          <Typography
            component={Link}
            href="/"
            variant="h6"
            className="!font-bold !text-maple-red !no-underline !flex !items-center !gap-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/maple-leaf.svg"
              alt=""
              width={28}
              height={28}
              className="shrink-0"
            />
            Maple Atelier
          </Typography>
          <span className="flex-1" />

          <Box sx={DESKTOP_NAV_SX}>
            {NAV_LINKS.map(({ href, label }) => {
              const active = activeHref === href;
              return (
                <Button
                  key={href}
                  component={Link}
                  href={href}
                  color={href === "/simulator" ? "primary" : "inherit"}
                  aria-current={active ? "page" : undefined}
                  sx={active ? ACTIVE_BUTTON_SX : undefined}
                >
                  {label}
                </Button>
              );
            })}
          </Box>

          {user ? (
            <NavbarUserMenu name={user.name} image={user.image ?? undefined} />
          ) : (
            <NavbarSignInButton />
          )}

          <IconButton
            edge="end"
            color="inherit"
            aria-label="開啟選單"
            onClick={() => setDrawerOpen(true)}
            sx={HAMBURGER_SX}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        slotProps={{ paper: { sx: DRAWER_PAPER_SX } }}
      >
        <List role="presentation">
          {NAV_LINKS.map(({ href, label }) => {
            const active = activeHref === href;
            return (
              <ListItemButton
                key={href}
                component={Link}
                href={href}
                onClick={closeDrawer}
                selected={active}
              >
                <ListItemText
                  primary={label}
                  slotProps={{
                    primary: {
                      sx: active ? ACTIVE_LIST_TEXT_SX : INACTIVE_LIST_TEXT_SX,
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
    </>
  );
}
