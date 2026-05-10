/**
 * 用模擬器一樣的隨機邏輯生成 seed 搭配:
 *   1. 對每個 slot 抓 maplestory.io 的 item catalog
 *   2. pickRandomSlotSet 抽要裝哪幾個 slot
 *   3. 各 slot 從 catalog 隨機抽一件
 *   4. 輸出 drizzle/seed.sql
 *
 * 跑法:
 *   node scripts/generate-seed.mjs [count]   # default 10
 *   pnpm wrangler d1 execute maple-atelier --local --file=drizzle/seed.sql
 */

import { writeFileSync } from "node:fs";

const REGION = "TWMS";
const VERSION = "256";
const USER_ID = process.env.SEED_USER_ID;
if (!USER_ID) {
  console.error("SEED_USER_ID env var required (set to your local D1 dev user uuid).");
  process.exit(1);
}
const COUNT = Number(process.argv[2] ?? 10);

const SLOT_FILTERS = {
  hair: [{ overallCategoryFilter: "Equip", categoryFilter: "Character", subCategoryFilter: "Hair" }],
  face: [{ overallCategoryFilter: "Equip", categoryFilter: "Character", subCategoryFilter: "Face" }],
  hat: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Hat" }],
  faceAccessory: [{ overallCategoryFilter: "Equip", categoryFilter: "Accessory", subCategoryFilter: "Face Accessory" }],
  eyeDecoration: [{ overallCategoryFilter: "Equip", categoryFilter: "Accessory", subCategoryFilter: "Eye Decoration" }],
  earring: [{ overallCategoryFilter: "Equip", categoryFilter: "Accessory", subCategoryFilter: "Earrings" }],
  coat: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Top" }],
  pants: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Bottom" }],
  overall: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Overall" }],
  shoes: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Shoes" }],
  cape: [{ overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Cape" }],
  weapon: [
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "One-Handed Sword" },
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "Dagger" },
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "Wand" },
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "Staff" },
    { overallCategoryFilter: "Equip", categoryFilter: "Two-Handed Weapon", subCategoryFilter: "Two-Handed Sword" },
    { overallCategoryFilter: "Equip", categoryFilter: "Two-Handed Weapon", subCategoryFilter: "Spear" },
    { overallCategoryFilter: "Equip", categoryFilter: "Two-Handed Weapon", subCategoryFilter: "Bow" },
    { overallCategoryFilter: "Equip", categoryFilter: "Two-Handed Weapon", subCategoryFilter: "Knuckle" },
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "Cash" },
  ],
  offhand: [
    { overallCategoryFilter: "Equip", categoryFilter: "Armor", subCategoryFilter: "Shield" },
    { overallCategoryFilter: "Equip", categoryFilter: "One-Handed Weapon", subCategoryFilter: "Katara" },
  ],
};

// 從 src/lib/maplestory/static-skins.ts 抽幾個常用膚色
const STATIC_SKINS = [
  { id: 2000, region: "KMS", version: "338" },
  { id: 2001, region: "KMS", version: "338" },
  { id: 2002, region: "KMS", version: "338" },
  { id: 2010, region: "KMS", version: "338" },
  { id: 2011, region: "KMS", version: "338" },
  { id: 2013, region: "KMS", version: "338" },
  { id: 2014, region: "JMS", version: "390" },
  { id: 2017, region: "JMS", version: "390" },
  { id: 2018, region: "KMS", version: "338" },
];

const MANDATORY = ["hair", "face", "skin"];
const OPTIONAL = ["hat", "faceAccessory", "eyeDecoration", "earring", "shoes", "cape", "weapon", "offhand"];
const GENDER_LOCKED = new Set(["hair", "face"]);

const TITLES = [
  "今日穿搭", "週末造型", "出戰準備", "簡單清新", "夢幻系",
  "夜行者", "森林漫步", "都市暗影", "溫柔派", "炫炮組",
  "復古風", "華麗組合", "輕鬆日常", "暗黑騎士", "晨光少女",
  "派對風", "搗蛋鬼", "魔法少女", "雪夜旅人", "海風隨行",
];
const TAGS_POOL = [
  "可愛", "酷", "萌系", "硬派", "華麗", "復古", "甜美",
  "簡約", "中二", "暗系", "粉嫩", "戰士", "法師", "弓手", "夢幻",
];

async function fetchSlot(slot) {
  const filters = SLOT_FILTERS[slot] ?? [];
  if (!filters.length) return [];
  const responses = await Promise.all(filters.map(async (f) => {
    const params = new URLSearchParams(Object.entries(f));
    const url = `https://maplestory.io/api/${REGION}/${VERSION}/item?${params}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${slot} returned ${r.status}`);
    return r.json();
  }));
  const seen = new Set();
  const items = [];
  for (const list of responses) {
    for (const raw of list) {
      if (seen.has(raw.id)) continue;
      seen.add(raw.id);
      items.push({
        id: raw.id,
        requiredGender: raw.requiredGender ?? 2,
      });
    }
  }
  return items;
}

const pickRandom = (arr) => arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;

function filterByGender(items, slot, gender) {
  if (!GENDER_LOCKED.has(slot)) return items;
  const target = gender === "male" ? 0 : 1;
  return items.filter((i) => i.requiredGender === 2 || i.requiredGender === target);
}

function pickRandomSlotSet() {
  const slots = [...MANDATORY];
  for (const s of OPTIONAL) if (Math.random() < 0.5) slots.push(s);
  if (Math.random() < 0.5) slots.push("coat", "pants");
  else slots.push("overall");
  return slots;
}

function pickTags() {
  const n = 1 + Math.floor(Math.random() * 3); // 1–3
  const pool = [...TAGS_POOL];
  const tags = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    tags.push(pool.splice(idx, 1)[0]);
  }
  return tags;
}

const esc = (s) => s.replace(/'/g, "''");

async function main() {
  console.log(`Fetching catalogs from maplestory.io (${REGION}/${VERSION})...`);
  const slotsToFetch = Object.keys(SLOT_FILTERS);
  const catalog = {};
  for (const slot of slotsToFetch) {
    process.stdout.write(`  ${slot.padEnd(16)} `);
    catalog[slot] = await fetchSlot(slot);
    console.log(`${catalog[slot].length} items`);
  }

  console.log(`\nGenerating ${COUNT} random outfits...`);
  const titlesShuffled = [...TITLES].sort(() => Math.random() - 0.5);
  const rows = [];
  const now = Math.floor(Date.now() / 1000);

  for (let i = 0; i < COUNT; i++) {
    const gender = Math.random() < 0.5 ? "male" : "female";
    const slots = pickRandomSlotSet();
    const equipped = {};

    for (const slot of slots) {
      if (slot === "skin") {
        const skin = pickRandom(STATIC_SKINS);
        equipped.skin = { id: skin.id, region: skin.region, version: skin.version };
      } else if (catalog[slot]?.length) {
        const item = pickRandom(filterByGender(catalog[slot], slot, gender));
        if (item) equipped[slot] = { id: item.id };
      }
    }

    const payload = { slots: equipped, stance: "stand1", animated: false };
    const title = titlesShuffled[i] ?? `搭配 ${i + 1}`;
    const tags = pickTags();
    const isPublic = Math.random() < 0.85 ? 1 : 0;
    const upvotes = isPublic ? Math.floor(Math.random() * 50) : 0;
    const ts = now - Math.floor(Math.random() * 86400 * 7);

    rows.push(`('${USER_ID}', '${esc(title)}', NULL, '${esc(JSON.stringify(payload))}', '${esc(JSON.stringify(tags))}', ${isPublic}, ${upvotes}, ${ts}, ${ts})`);
  }

  const sql = `-- Generated by scripts/generate-seed.mjs (${new Date().toISOString()})
-- Apply: pnpm wrangler d1 execute maple-atelier --local --file=drizzle/seed.sql

INSERT INTO outfits (user_id, title, description, payload, tags, is_public, upvotes, created_at, updated_at) VALUES
${rows.join(",\n")};
`;

  writeFileSync("drizzle/seed.sql", sql);
  console.log(`\nWrote drizzle/seed.sql (${COUNT} outfits)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
