<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Maple Atelier — Engineering Guide

寫 / 改 code 前掃過。重點放**工具不能 enforce 的判斷**;格式 / 命名 / import 順序由 ESLint + TypeScript 把關。

> **適用範圍**:本檔規則是專案約定,部分為團隊偏好(會註明)、部分為業界共識(會引用)。違反偏好的有合理理由可走;違反共識請三思。

---

## 1. Quick Reference

Commit 前 30 秒掃一眼:

- [ ] `pnpm typecheck && pnpm lint` 通過
- [ ] 新 hook → `useApi*` 命名,放 `src/lib/hooks/`
- [ ] HTTP 請求 → 走 `lib/api/fetcher.ts` 的 `apiJson`
- [ ] Schema 改了 → `pnpm db:generate` + commit migration
- [ ] 新 sx ≥ 2 處用 → 進 `lib/mui/theme.ts`
- [ ] commit message 走 [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] 註解只寫 WHY,不寫 WHAT
- [ ] 沒有 `console.log` debug 殘留

---

## 2. Tooling First

**能讓工具 enforce 的不寫進這份文件**。當前已 enforce:

| 工具 | 範圍 |
|---|---|
| TypeScript `strict: true` | 型別、null safety |
| ESLint(`eslint-config-next`) | React hooks rules、import order、a11y 基本 |
| MUI Theme(`lib/mui/theme.ts`) | 色票、圓角、字型 |
| Drizzle | DB schema 型別自動生成 |

新規則優先 encode 進工具;真的無法時才寫進 prose。

---

## 3. File Layout

```
src/
  app/                    Next.js App Router page / route(URL = 檔案路徑)
  components/             React component
    layout/               全站 layout(Navbar / Footer / PageShell)
    simulator/            模擬器 sub-tree
    ui/                   原子視覺
  db/                     Drizzle schema + client
  lib/
    api/                  typed fetch wrapper + types
    hooks/                SWR + 共用 React hook
    queries/              server-side D1 query helper
    validators/           使用者輸入 normalize / validate
    maplestory/           外部 API client
    mui/                  theme + 共用 sx
  store/                  zustand store
  types/                  跨檔共享 type
```

**新檔判斷**:同概念用 ≥ 2 處 → 抽 `lib/`;1 處 → 留 component 內。

---

## 4. TypeScript

- **避免 `any`**(團隊偏好);邊界層真需要時用 `unknown` + type guard 收斂。
- **避免 `as` type assertion**;用 type guard 或 schema 驗證(參考 [TypeScript Deep Dive](https://basarat.gitbook.io/typescript))。例外:`as const` 鎖字面量。
- **`interface` 與 `type` 在團隊內保持一致**(專案目前傾向 object shape 用 `interface`,union / utility 用 `type`)。Microsoft 官方說「兩者皆可」,別在 PR 互相挑剔。
- **`readonly`** 用於不該變的 array / property(props、constants)。

```ts
// ❌ 強轉繞檢查
const outfit = res.data as Outfit;

// ✅ 介面層驗證
const outfit = parseOutfit(res.data);  // throws on bad shape
```

---

## 5. React / Next.js

- **預設 server component**;有 state / event / browser API 才加 `"use client"`(官方推薦)。
- **server / client 邊界不能傳 function**(無法序列化)。MUI `<Component component={Link}>` 在 server component 會炸 — 套 client wrapper 解決。
- **`route.ts` 只能 export `GET / POST / PUT / DELETE / PATCH / HEAD / OPTIONS` + `runtime / dynamic`**。Helper 抽到 `lib/`。
- **不要寫 `runtime = "edge"`** — OpenNext for CF 已是 workerd,加這行會 build 炸。
- **`useEffect` 內不要 `setState`**(React 19 lint;range 同步事件用 handler、prop 變化追蹤用 render-time setState、外部 lib 用 `useSyncExternalStore`)。

```tsx
// ❌ server component 把 Link function 跨界傳給 client lib
export default async function Page() {
  return <Typography component={Link} href="/">Home</Typography>;  // 炸
}

// ✅ server fetch → client shell
export default async function Page() {
  const data = await fetchSomething();
  return <PageShell data={data} />;  // PageShell 是 "use client"
}
```

---

## 6. State Management — 決策樹

| 範圍 | 用什麼 |
|---|---|
| 單 component 內 | `useState` |
| 跨 sibling component | lift state up |
| URL 是 SoT(分享、back button 還原) | Next `searchParams` + `router.replace` |
| Server data + cache + revalidate | **SWR(`lib/hooks/useApi*`)** |
| 全站 client state | **zustand** |
| 全站 UI 服務(toast、theme) | React Context |

**反 pattern**:把 SWR 的 data 再丟進 `useState`(雙 SoT、會 desync)、用 zustand 包單頁 form state。

---

## 7. Styling

**選用優先**:`MUI 元件 → theme.ts 共用 sx → Tailwind utility → 自製 component`

> 專案選 MUI 是團隊決定(主題集中、a11y 內建、SSR 配好)。並非業界唯一最佳;shadcn / Headless UI 在新專案也很主流。但本專案既然用了,就遵循優先序避免兩套並存。

**色彩**:用 theme token,不寫 hex literal(`text-maple-red`、`primary.main`)。新色 → `globals.css` `@theme inline` + `lib/mui/theme.ts` 同步。

```tsx
// ❌
<button className="bg-[#c8423d] text-white px-4 py-2 rounded">儲存</button>

// ✅
<Button variant="contained" color="primary">儲存</Button>
```

---

## 8. Naming

- **語意化** — 函式動詞開頭(`fetchItemsBySlot`)、變數名詞(`outfit`)。
- **可接受縮寫**:`id` / `url` / `db` / `sx` / `ref` / `props` / `req` / `res` / `ctx`。其他不縮寫。
- **Boolean 用 `is` / `has` / `can` 開頭**:`isPublic` / `hasMore` / `canLike`。
- **API hook 用 `useApi*` 前綴**:`useApiPublicOutfits`。
- **常數 SCREAMING_SNAKE_CASE**:`MAX_OUTFITS_PER_USER`。
- **Array 用複數 / 單筆用單數**:`outfits` / `outfit`。

---

## 9. Comments / JSDoc

**預設不寫註解**(Linus、Clean Code、Google 共識)。寫 → 只寫 WHY:

- 隱藏限制(`maplestory.io render URL must be stripped-bracket JSON array`)
- 不顯而易見的不變式(`generation race counter`)
- workaround / 反直覺行為(`votes table existence = liked, no enum`)

**不寫**:caller reference、phase 敘事、過去歷史、重述程式行為。

```ts
// ❌ 重述
/** outfit id */
outfitId: number;

// ✅ 補名字看不出的東西
/** 1-based 排名,1-3 顯示金/銀/銅獎牌 */
rank?: number;
```

---

## 10. Async / Errors

- **一律 `async / await`**,避免 `.then().catch()` 鏈。
- **獨立操作用 `Promise.all`**,不要 sequential。
- **API route 錯誤回應 shape 統一**:`{ error: string; code?: string }`,搭配正確 HTTP status(400 / 401 / 403 / 404 / 429 / 500)。
- **Client mutation** 用 try/catch + `useToast()`,不 silent swallow。

```ts
// ❌ silent swallow
try { await trigger(); } catch {}

// ✅ 該知道就讓使用者知道
try { await trigger(); }
catch (e) { toast.error(e instanceof Error ? e.message : "操作失敗"); }
```

---

## 11. Security

OWASP Top 10 對應到本 stack:

| Risk | 我們的防線 |
|---|---|
| XSS | React 自動 escape + 不用 `dangerouslySetInnerHTML` + 不接受 user-provided HTML |
| SQL injection | Drizzle 全參數化(不要用 `sql\`...${userInput}...\`` 拼字串) |
| SSRF | `/api/download` proxy 走 hostname allowlist,不接受任意 URL |
| CSRF | Auth.js JWT in HttpOnly cookie + SameSite=Lax;state-changing API 用 POST/PUT/DELETE |
| Secret 外洩 | `.dev.vars` gitignored;CF env via `getCloudflareContext().env`;**從不**寫進 client / commit |
| Rate limit bypass | `lib/rate-limit.ts` per scope;新 endpoint 接收 user input 時必加 |
| Mass assignment | API route 明確列接受欄位,不 spread `body` 進 DB |

**Code review red flags**:`eval` / `new Function` / 拼字串 SQL / 直接 `dangerouslySetInnerHTML` / fetch 任意 URL / 信任 client 傳的 `userId`。

---

## 12. Accessibility

- **語義 tag 優先**(`<button>` 而非 `<div onClick>`)。
- **Icon-only Button 必有 `aria-label`**。
- **disabled 用 `disabled` prop**,不要只靠 visual。
- **不 `outline: none`** — focus ring 留著。
- **顏色不能是唯一訊息** — 加 icon 或文字輔助。

```tsx
// ❌
<IconButton onClick={onDelete}><DeleteIcon /></IconButton>

// ✅
<IconButton onClick={onDelete} aria-label="刪除搭配"><DeleteIcon /></IconButton>
```

---

## 13. Performance

- **預設不 `useMemo` / `useCallback`** — React 19 + React Compiler 接管,手動 memoize 多半浪費(React 官方建議)。**有量測** 才加。
- **大 list(>200 row)才 virtualize**(已內建 `@tanstack/react-virtual`)。
- **server component 優先**(渲染在 server,不送 JS)。
- **server query 一次撈完**,別 N+1。
- **圖片 source 解析度對齊顯示尺寸**(範例:`outfitThumbnailUrl(payload, { resize: 2 })`)。

---

## 14. Logging / Error Boundary

- **Server-side**:`console.error(...)` 給 Cloudflare Workers logs。**不要** log secret / token / 完整使用者 payload。
- **Client-side**:不要留 `console.log`;真要 telemetry 走 Sentry / 自建 endpoint。
- **Error Boundary**:Next.js App Router 用 `error.tsx`(per route segment);至少首層放一個避免 white screen。

---

## 15. Testing(暫無,先約定)

目前無測試。未來新增時:

- 工具:Vitest(unit) + Playwright(e2e)
- 檔案位置:`*.test.ts` 與 source 同層 / `e2e/` 放 Playwright spec
- 命名:`describe('functionName', ...)` + `it('should ...')`
- 覆蓋目標:lib/ 裡的 pure function 100%,UI 走 e2e smoke test

加測試前在這節更新規則。

---

## 16. Git

**Commit message 走 [Conventional Commits](https://www.conventionalcommits.org/)**:

```
<type>(<scope>): <subject>

<body — WHY + trade-off,不寫 WHAT>

<footer — Co-Authored-By 等>
```

**type**:`feat` / `fix` / `refactor` / `style` / `docs` / `chore` / `ci` / `test` / `perf`
**scope** 選用:`explore` / `simulator` / `me` / `auth` / `chip` / `cards` / `build` / `db`
**subject**:祈使句、首字小寫、結尾不加句號、英文、< 72 字

**Branch naming**(若用 feature branch):`feat/xxx` / `fix/xxx` / `refactor/xxx`

```
✅ feat(explore): use thumbnail render mode for consistent card sizes
❌ update card                  # 沒 type / scope / 不具體
❌ fix: 修了一些 bug             # 中文 subject、不具體
```

---

## 17. DRY Checklist

寫新 util / hook / component 前依序 grep:

1. `src/lib/api/` — 已有 typed fetch?
2. `src/lib/hooks/` — 已有 SWR hook?
3. `src/lib/queries/` — 已有 D1 query helper?
4. `src/lib/validators/` — 已有 input normalize?
5. `src/lib/mui/theme.ts` — 已有 sx?
6. `src/components/` — 已有 component?
7. `@mui/material` / `@mui/icons-material` — 內建?
8. `next/*` — 內建?

找到 → 用。找不到才寫。
