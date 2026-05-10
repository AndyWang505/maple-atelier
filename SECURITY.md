# 安全性回報

感謝你願意協助讓 Maple Atelier 更安全。

## 不要公開開 issue

如果你發現的是**資安漏洞**或**個人隱私相關**的問題,**請不要在 GitHub Issues 公開回報** —
請透過 GitHub 內建的私下回報管道:

> **[Report a vulnerability →](../../security/advisories/new)**

(在本 repo 的 Security 分頁 → Advisories → New draft security advisory)

## 我會做到

- 7 天內初步回覆。
- 在修復釋出前不公開細節。
- 修復後可在 release notes / commit message 中致謝(若你願意具名)。

## 在範圍內

歡迎回報下列類型的問題:

- 認證 / 授權繞過(IDOR、session 取得、CSRF)
- SQL injection / SSRF / XSS
- 個人資料洩露(他人 displayName / 私密搭配等)
- 速率限制繞過導致的資源消耗
- Discord OAuth flow 異常
- 不安全的預設值或 header 設定

## 不在範圍

下列情況請改開**公開 issue**或不回報:

- 上游服務(`maplestory.io` / Cloudflare / Discord)本身的問題
- 純 UI / UX / 文案瑕疵
- 自動化掃描器報出的低危且無實際影響的條目(例如 Best Practice 級的 header 建議)
- Self-XSS(需要受害者主動把惡意內容貼到自己 console)

## 揭露原則

修復釋出後,可在 GitHub Security Advisories 頁面公開細節 + CVE(若申請)。
維持非商業專案的成本考量,不提供金錢 bounty。
