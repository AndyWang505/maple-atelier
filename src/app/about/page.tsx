import Link from "next/link";
import type { Metadata } from "next";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import type { SvgIconComponent } from "@mui/icons-material";
import PageShell from "@/components/layout/PageShell";
import { SITE_LINKS, SITE_NAME, SITE_NAME_TC } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `關於 | ${SITE_NAME}`,
  description: `${SITE_NAME} ${SITE_NAME_TC} — 製作動機、常見問題、聯絡方式與支持管道`,
};

export default function AboutPage() {
  return (
    <PageShell width="content" bg="soft" className="space-y-12">
      {/* 標題 — 縮小版深色 hero,沿用首頁視覺語言 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-950 via-zinc-900 to-stone-950 px-6 py-12 sm:py-16 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 rounded-full bg-maple-red/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-maple-leaf/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-maple-red via-maple-leaf to-amber-300">
            關於 Maple Atelier
          </h1>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            {SITE_NAME_TC} / About
          </p>
        </div>
      </section>

      {/* 1. 關於本站 */}
      <AboutSection
        Icon={InfoOutlinedIcon}
        badgeColor="#fef3c7"
        iconColor="#ea580c"
        title="關於本站"
      >
        <p>
          Maple Atelier 楓葉工坊 是一個聚焦於新楓之谷時裝搭配的社群工具。使用者可即時試穿遊戲內裝備、儲存個人搭配方案，並與其他玩家分享、瀏覽彼此的造型作品。
        </p>
        <p>
          本站為非官方、非商業性質專案，獨立開發與維護，與 Nexon 無關。所有遊戲素材版權皆屬 Nexon Korea / Nexon America，本站僅作時裝搭配參考之用途。
        </p>
      </AboutSection>

      {/* 2. 緣起 */}
      <AboutSection
        Icon={EmojiObjectsOutlinedIcon}
        badgeColor="#fef9c3"
        iconColor="#ca8a04"
        title="為何做這個"
      >
        <p>
          楓谷玩家社群長期使用名為「透視鏡」的時裝預覽工具進行搭配試穿。隨著該工具逐漸停止維護，可使用的替代方案日益稀少且陳舊。
        </p>
        <p>
          Maple Atelier 嘗試以現代網頁技術重新實作一套搭配工具，並且在試穿功能之外延伸出儲存、分享、社群瀏覽等能力，讓楓谷時裝文化能以新的形式延續。
        </p>
        <p className="text-zinc-500 text-sm">
          本站致敬「透視鏡」，以及所有讓楓谷時裝文化持續發展的玩家。
        </p>
      </AboutSection>

      {/* 3. FAQ */}
      <AboutSection
        Icon={HelpOutlinedIcon}
        badgeColor="#fef3c7"
        iconColor="#d97706"
        title="常見問題"
      >
        <div className="space-y-5">
          <FAQ q="這是 Nexon 或遊戲橘子官方做的嗎？">
            不是。Maple Atelier 是非官方的個人專案，跟 Nexon 或遊戲橘子沒有任何關聯。
            遊戲素材版權屬 Nexon Korea / Nexon America，本站僅作非商業性質時裝搭配參考。
          </FAQ>
          <FAQ q="為什麼有些裝備找不到？">
            裝備資料來自
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm">
              maplestory.io
            </code>
            ，目前主要對應台版（TMS）。
            部分裝備可能因 API 沒收錄或欄位問題沒被列出來。
            如果你有特定裝備找不到，可以在問題回報區提出，供後續作處理。
          </FAQ>
          <FAQ q="我可以儲存幾套搭配？">
            目前每位使用者最多儲存 <strong>20 套</strong>。
            滿了要先刪舊的才能存新的，這個上限會視情況再調整。
          </FAQ>
          <FAQ q="怎麼讓搭配被別人看到？">
            到「我的衣櫃」，點搭配上的「公開」開關。
            公開後會出現在「探索」頁與首頁的熱門 / 最新區，讓更多人看到。
          </FAQ>
          <FAQ q="為什麼只能用 Discord 登入？">
            為了簡單。不用記帳號密碼、不用驗證 email，大部分楓友也都有 Discord。
            未來可能會加入其他登入方式。
          </FAQ>
          <FAQ q="角色圖片可以下載嗎？">
            可以。模擬器頁面預覽區下方有下載按鈕，可以下載當前搭配的角色圖。
          </FAQ>
        </div>
      </AboutSection>

      {/* 4. 問題回報 / 貢獻 */}
      <AboutSection
        Icon={BugReportOutlinedIcon}
        badgeColor="#fef3c7"
        iconColor="#ea580c"
        title="問題回報 & 貢獻"
      >
        <p>
          專案 open source，程式碼公開、issue tracker 公開。發現 bug、有功能建議、或想直接送 PR，都歡迎到 GitHub repo 處理。
        </p>

        {/* 回報 Bug */}
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 px-5 py-4 sm:px-6 sm:py-5">
          <h3 className="font-bold text-zinc-900 mb-2 flex items-center gap-2">
            <BugReportOutlinedIcon
              style={{ fontSize: 20, color: "#ea580c" }}
            />
            回報 Bug
          </h3>
          <p className="text-sm text-zinc-600 mb-3">
            到 GitHub repo 開新 issue，選「Bug report」模板。為了方便重現問題，建議附上:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-zinc-600 marker:text-maple-red">
            <li>
              <strong className="font-semibold text-zinc-800">問題描述</strong>
              ：發生什麼、預期應該是什麼、實際變成什麼
            </li>
            <li>
              <strong className="font-semibold text-zinc-800">重現步驟</strong>
              ：從哪一頁開始、依序點了什麼、輸入了什麼
            </li>
            <li>
              <strong className="font-semibold text-zinc-800">截圖或螢幕錄影</strong>
              ：一張畫面勝過千言萬語，動態問題附短片更好
            </li>
            <li>
              <strong className="font-semibold text-zinc-800">環境資訊</strong>
              ：瀏覽器、作業系統、螢幕大小
            </li>
          </ul>
        </div>

        {/* 送 PR */}
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200 px-5 py-4 sm:px-6 sm:py-5">
          <h3 className="font-bold text-zinc-900 mb-2 flex items-center gap-2">
            <GitHubIcon style={{ fontSize: 20 }} />
            送 Pull Request
          </h3>
          <p className="text-sm text-zinc-600">
            建議先開 issue 討論方向再動手，避免做完才發現方向不合。送 PR 時請使用 repo 內的 PR 模板填寫:變更內容、動機、是否有 breaking change、相關 issue 連結等。改動較大時也歡迎附上前後對照截圖。
          </p>
        </div>

        <a
          href={SITE_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white font-semibold no-underline hover:bg-zinc-800 transition shadow-md"
        >
          <GitHubIcon style={{ fontSize: 20 }} />
          前往 GitHub Repo
        </a>
      </AboutSection>

      {/* 5. 聯絡方式 */}
      <AboutSection
        Icon={MailOutlinedIcon}
        badgeColor="#fef9c3"
        iconColor="#ca8a04"
        title="聯絡方式"
      >
        <div className="flex items-center gap-3">
          <MailOutlinedIcon
            style={{ fontSize: 18 }}
            className="text-zinc-400 shrink-0"
          />
          <a
            href={`mailto:${SITE_LINKS.email}`}
            className="text-maple-red hover:underline"
          >
            {SITE_LINKS.email}
          </a>
        </div>
      </AboutSection>

      {/* 6. 隱私政策 */}
      <AboutSection
        Icon={PrivacyTipOutlinedIcon}
        badgeColor="#fef3c7"
        iconColor="#b45309"
        title="隱私與資料"
      >
        <p>
          本站只蒐集功能必要的最小資料，
          <strong className="font-semibold text-zinc-800">
            不發信、不販售、不追蹤
          </strong>
          。完整說明 — 蒐集了什麼、儲存在哪、第三方服務、你的刪除權利等 — 請見隱私政策。
        </p>
        <Link
          href="/privacy"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white font-semibold no-underline hover:bg-zinc-800 transition shadow-md"
        >
          <PrivacyTipOutlinedIcon style={{ fontSize: 20 }} />
          閱讀隱私政策
        </Link>
      </AboutSection>

      {/* 7. 贊助 */}
      <AboutSection
        Icon={VolunteerActivismOutlinedIcon}
        badgeColor="#fef3c7"
        iconColor="#e11d48"
        title="支持本站"
      >
        <p>
          若認同本站的方向，可透過下列管道贊助。贊助款項將用於支應伺服器、域名等基礎運營開銷，協助本站持續維護與更新。
        </p>
        <a
          href={SITE_LINKS.sponsor}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-maple-red text-white font-semibold no-underline hover:opacity-90 hover:shadow-lg hover:shadow-maple-red/30 transition shadow-md"
        >
          <VolunteerActivismOutlinedIcon style={{ fontSize: 20 }} />
          請我喝咖啡
        </a>
      </AboutSection>

      {/* 回首頁 */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-maple-red hover:underline"
        >
          ← 回首頁
        </Link>
      </div>
    </PageShell>
  );
}

interface AboutSectionProps {
  Icon: SvgIconComponent;
  badgeColor: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}

function AboutSection({
  Icon,
  badgeColor,
  iconColor,
  title,
  children,
}: AboutSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
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
      <div className="text-zinc-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

interface FAQProps {
  q: string;
  children: React.ReactNode;
}

function FAQ({ q, children }: FAQProps) {
  return (
    <div className="border-l-2 border-maple-red/30 pl-4">
      <h3 className="font-bold text-zinc-900 mb-1.5">Q. {q}</h3>
      <div className="text-zinc-600 text-sm sm:text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
}
