import Link from "next/link";
import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import { SITE_LINKS, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "隱私政策",
  description: `${SITE_NAME} 的資料蒐集、儲存、使用方式說明,以及使用者刪除 / 修改個人資料的方法。`,
};

const LAST_UPDATED = "2026-05-10";

export default function PrivacyPage() {
  return (
    <PageShell width="content" bg="soft" className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          隱私政策
        </h1>
        <p className="text-sm text-zinc-500">
          最後更新:{LAST_UPDATED}
        </p>
        <p className="text-sm text-zinc-600 leading-relaxed">
          本站是非營利的個人專案，以下說明我們如何處理你的資料。簡單來說:
          <strong className="text-zinc-900">只蒐集功能必要的最小資料，不賣不發信不追蹤</strong>。
        </p>
      </header>

      <Section title="一、我們蒐集的資料">
        <p>登入時透過 Discord OAuth 取得：</p>
        <List>
          <li>Discord 帳號 ID（系統內部識別）</li>
          <li>Discord 使用者名稱（預設顯示名，你可自訂取代，見下方）</li>
          <li>Discord 大頭貼 URL</li>
          <li>
            <strong>不蒐集 email</strong> — OAuth 授權範圍僅 <code>identify</code>，
            Discord 不會把 email 傳給本站
          </li>
        </List>
        <p className="mt-3">使用站台時：</p>
        <List>
          <li>你儲存的搭配（標題、描述、標籤、裝備組合）</li>
          <li>你按過「推」的紀錄（誰推了哪一套，含時間）</li>
          <li>你的自訂顯示名稱（若你選擇設定）</li>
        </List>
        <p className="mt-3">伺服器運作所需（短期）：</p>
        <List>
          <li>請求來源 IP — <strong>僅用於防止濫用</strong>，60 秒後自動清除，不長期儲存</li>
          <li>登入憑證 — 只存在你瀏覽器,走加密連線、僅本站讀得到</li>
        </List>
      </Section>

      <Section title="二、我們不會做的事">
        <List>
          <li>不會發送任何行銷郵件或通知</li>
          <li>不會將你的個人資料賣給或提供給第三方</li>
          <li>不會在公開搭配上顯示你的 Discord 帳號 ID</li>
          <li>不使用 Google Analytics、Meta Pixel 等追蹤工具</li>
        </List>
      </Section>

      <Section title="三、第三方服務">
        <p>本站運作會用到以下服務，你的資料可能經過它們：</p>
        <List>
          <li>
            <strong>Discord</strong> — 透過 OAuth 登入，你需在 Discord 端授權。Discord 會看到你登入過本站，但本站不會將你的資料回送給 Discord。
          </li>
          <li>
            <strong>Cloudflare</strong> — 站台託管、資料庫與圖片快取。你的資料儲存於 Cloudflare 的基礎建設。
          </li>
          <li>
            <strong>maplestory.io</strong> — 提供角色與物品圖片的公開服務。
            <strong>不會傳送任何使用者個人資料</strong>，僅傳送你目前選擇的裝備編號以產生預覽圖。
          </li>
        </List>
      </Section>

      <Section title="四、公開可見的資料">
        <p>
          當你將搭配標記為「公開」（Public）時，以下資訊會被任何訪客看到：
        </p>
        <List>
          <li>搭配標題、描述、標籤、裝備組合（角色預覽圖）</li>
          <li>你的顯示名稱 — 預設沿用 Discord 名，可在 /me 頁改成自訂</li>
          <li>Discord 大頭貼</li>
          <li>累計推數</li>
        </List>
        <p className="mt-3">
          設為「私密」的搭配只有你自己看得到。
          <strong>如果你不希望別人從顯示名認出你的 Discord 帳號</strong>，
          請到{" "}
          <Link href="/me" className="text-maple-red hover:underline">
            我的衣櫃
          </Link>{" "}
          設定自訂顯示名稱。
        </p>
      </Section>

      <Section title="五、Cookies">
        <p>本站僅使用 1 個必要 cookie：</p>
        <List>
          <li>
            <strong>登入憑證</strong> — 用來記住你已登入的狀態,登出或過期後即失效
          </li>
        </List>
        <p className="mt-3">
          沒有追蹤 cookie、第三方 cookie。
        </p>
      </Section>

      <Section title="六、你的權利">
        <p>你可以隨時:</p>
        <List>
          <li>修改顯示名稱（/me 頁面）</li>
          <li>刪除自己的搭配（任何一套都可）</li>
          <li>將公開搭配改回私密</li>
          <li>登出後，登入憑證會立即失效</li>
        </List>
        <p className="mt-3">
          若你希望<strong>完全刪除帳號與所有相關資料</strong>（搭配 / 推 / 個人檔案）：
        </p>
        <List>
          <li>
            已登入：到{" "}
            <Link href="/me" className="text-maple-red hover:underline">
              我的衣櫃
            </Link>{" "}
            點右上角「設定」→「刪除帳號」自助處理（即時生效，無法復原）
          </li>
          <li>
            無法登入（例如 Discord 帳號已停用）：透過下方聯絡方式來信，我會在 7 天內處理
          </li>
        </List>
      </Section>

      <Section title="七、資料保留期限">
        <List>
          <li>個人帳號 / 搭配 — 你不主動刪除就持續保留</li>
          <li>請求來源 IP — 60 秒內自動過期</li>
          <li>登入憑證 — 預設 30 天，登出立即失效</li>
        </List>
      </Section>

      <Section title="八、本政策的變更">
        <p>
          政策內容若有更動，會於本頁更新「最後更新」日期。
          重大變更（例如新增第三方服務、變動資料用途）會於登入後在站內告知。
        </p>
      </Section>

      <Section title="九、免責聲明">
        <p>
          本站為非官方平台，<strong>與 Nexon Korea、Nexon America、遊戲橘子無關</strong>。
        </p>
        <p className="mt-2">
          站上所有遊戲素材（角色 / 裝備外觀圖）的著作權屬於 Nexon Korea / Nexon America。
          本站僅作為非商業性質的時裝搭配參考工具，不販售、不轉授權任何遊戲資產。
        </p>
        <p className="mt-2">
          若你是著作權所有人並認為本站使用方式有問題，
          歡迎透過下方聯絡方式來信，我會配合處理。
        </p>
      </Section>

      <Section title="十、聯絡">
        <p>問題回報、資料刪除請求、著作權通知，請透過：</p>
        <List>
          <li>
            Email:{" "}
            <a
              href={`mailto:${SITE_LINKS.email}`}
              className="text-maple-red hover:underline"
            >
              {SITE_LINKS.email}
            </a>
          </li>
          <li>
            GitHub:{" "}
            <a
              href={SITE_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-maple-red hover:underline"
            >
              開 issue
            </a>
          </li>
        </List>
      </Section>
    </PageShell>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg sm:text-xl font-bold tracking-tight border-l-4 border-maple-red pl-3">
        {title}
      </h2>
      <div className="text-sm sm:text-base text-zinc-700 leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-maple-red">
      {children}
    </ul>
  );
}
