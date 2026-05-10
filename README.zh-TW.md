<div align="center">
  <img src="public/maple-leaf.svg" alt="Maple Atelier" width="80" height="80" />
  <h1>Maple Atelier · 楓葉工坊</h1>
  <p>
    <strong>聚焦於新楓之谷時裝搭配的社群工具</strong><br />
    即時試穿、儲存、分享你的造型
  </p>
  <p>
    <a href="./README.md">English</a> · <strong>繁體中文</strong>
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

## 簡介

Maple Atelier 是一個聚焦於新楓之谷時裝搭配的社群工具,讓玩家可以即時試穿遊戲內裝備、儲存個人搭配,並與其他玩家分享、瀏覽彼此的造型。

本專案致敬「**透視鏡**」,以及所有讓楓谷時裝文化持續發展的玩家,以現代網頁技術延續這個社群傳統。

## 功能

### 模擬器
- 完整楓谷裝備試穿(髮型 / 臉型 / 膚色 / 耳朵 + 帽 / 上衣 / 套服 / 鞋 / 武器 / 披風 / 坐騎 ...)
- 動作切換(站姿 / 行走 / 攻擊 等多種姿勢,靜態 PNG 與動畫 GIF)
- 隨機搭配 — 一鍵抽取靈感
- 同色系摺疊 — 髮型 / 臉型按色系收摺,瀏覽更乾淨
- 角色圖下載與分享

### 社群
- 個人衣櫃 — 儲存、編輯、公開 / 私密切換
- 公開作品集 — 出現在「探索」頁與首頁熱門
- 互相欣賞 — 為喜歡的搭配按愛心
- 標籤與搜尋 — 依標題 / 標籤 / 作者快速找到風格

### 隱私
- 僅以 Discord 一鍵登入,不需密碼、不收 email 行銷
- 可自訂顯示名稱,隱藏 Discord 帳號
- 完整刪除權利,隨時可刪除帳號與所有資料

## 技術選型

| 類別 | 選擇 |
|---|---|
| 前端 | Next.js 16 · React 19 · TypeScript |
| 樣式 | Tailwind CSS v4 · MUI |
| 狀態 | Zustand |
| 資料庫 | Cloudflare D1 · Drizzle ORM |
| Auth | Auth.js v5 · Discord OAuth |
| 託管 | Cloudflare Pages (via OpenNext) |
| 角色素材 | [maplestory.io](https://maplestory.io) |

## 回報問題

歡迎透過 [GitHub Issues](../../issues) 回報 bug 或提出功能需求 — 請依照 [`.github/ISSUE_TEMPLATE`](./.github/ISSUE_TEMPLATE) 的格式填寫。

## 致謝

- 本站致敬「**透視鏡**」,以及所有讓楓谷時裝文化持續發展的玩家。
- 角色與裝備素材由 [maplestory.io](https://maplestory.io) 提供。

## 授權

採用 [MIT License](./LICENSE) 釋出。

---

<sub>本站為**非官方、非商業性質專案**,獨立開發與維護,與 **Nexon Korea / Nexon America / 遊戲橘子** 無關。所有遊戲素材著作權皆屬 Nexon Korea / Nexon America。本站僅作為時裝搭配參考之用途。</sub>
