<div align="center">
  <img src="public/maple-leaf.svg" alt="Maple Atelier" width="80" height="80" />
  <h1>Maple Atelier</h1>
  <p>
    <strong>A community dress-up tool for MapleStory fashion</strong><br />
    Try on equipment, save your outfits, and share your style
  </p>
  <p>
    <strong>English</strong> · <a href="./README.md">繁體中文</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-000?logo=next.js&style=flat-square" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000&style=flat-square" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Cloudflare-F38020?logo=cloudflare&logoColor=white&style=flat-square" alt="Cloudflare" />
    <img src="https://img.shields.io/github/license/AndyWang505/maple-atelier?style=flat-square" alt="MIT License" />
  </p>
</div>

---

## About

Maple Atelier is a community dress-up tool focused on MapleStory fashion. Players can try on in-game equipment in real time, save their personal outfits, and share or browse styles created by other players.

This project pays tribute to **透視鏡** (Tau Shi Jing) — the legacy MapleStory dressing-room tool — and to all the players who have kept MapleStory fashion culture alive. It carries that tradition forward with modern web technology.

## Features

### Simulator
- Full equipment dress-up (hair / face / skin / ears + hat / top / overall / shoes / weapon / cape / mount ...)
- Pose switching (standing / walking / attacking, etc.) with static PNG and animated GIF
- Random outfit generator — one click for inspiration
- Color-variant collapse — hair / face palettes folded by base style
- Character image download and sharing

### Community
- Personal wardrobe — save, edit, and toggle public / private
- Public gallery — featured on the Explore page and homepage
- Likes — show appreciation for outfits you love
- Tag and search — find styles by title, tag, or author

### Privacy
- One-click sign-in with Discord — no password, no email marketing
- Customizable display name to hide your Discord identity
- Full deletion right — remove your account and all data anytime

## Tech Stack

| Category | Choice |
|---|---|
| Frontend | Next.js 16 · React 19 · TypeScript |
| Styling | Tailwind CSS v4 · MUI |
| State | Zustand |
| Database | Cloudflare D1 · Drizzle ORM |
| Auth | Auth.js v5 · Discord OAuth |
| Hosting | Cloudflare Pages (via OpenNext) |
| Asset source | [maplestory.io](https://maplestory.io) |

## Reporting Issues

Bug reports and feature requests are welcome via [GitHub Issues](../../issues) — please follow the templates in [`.github/ISSUE_TEMPLATE`](./.github/ISSUE_TEMPLATE).

## Acknowledgments

- Tribute to **透視鏡** and to all the players who have kept MapleStory fashion culture alive.
- Character and equipment assets are provided by [maplestory.io](https://maplestory.io).

## License

Released under the [MIT License](./LICENSE).

---

<sub>This is an <strong>unofficial, non-commercial project</strong>, independently developed and maintained, <strong>not affiliated with Nexon Korea / Nexon America / Gamania</strong>. All in-game assets are copyrighted by Nexon Korea / Nexon America. This site exists solely as a fashion reference tool.</sub>
