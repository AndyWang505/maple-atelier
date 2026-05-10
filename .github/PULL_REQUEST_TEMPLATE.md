## 變更內容
<!-- 簡述這個 PR 做了什麼。可用 bullet point。 -->

-

## 動機 / 解決什麼問題
<!-- 為什麼要做這個改動?連結到對應 issue 更好。 -->

Fixes #

## Breaking change
<!-- 是否影響現有 API、資料結構、使用者操作?如有,請描述影響範圍與遷移方式。 -->

- [ ] 否
- [ ] 是(請補充說明 →)

## 前後對照
<!-- UI / 視覺改動建議附前後截圖或錄影。純後端改動可省略此區。 -->

| Before | After |
| ------ | ----- |
|        |       |

## 自我檢查
- [ ] `pnpm typecheck` 通過
- [ ] `pnpm lint` 通過
- [ ] 本機 `pnpm dev` 實際操作驗證
- [ ] 動到 schema 已執行 `pnpm db:generate` 並把 migration 一併入版
- [ ] 動到 server / API 已確認 `runtime = "edge"`、binding 從 `getCloudflareContext().env` 拿
