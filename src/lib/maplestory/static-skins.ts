import type { CatalogItem } from "@/types/maplestory";

/**
 * 膚色在 TWMS `subCategoryFilter=Body` 回空陣列,改用靜態列表。
 * 每筆帶原生 region/version 讓跨服膚色能正確渲染。
 */
export const STATIC_SKIN_ITEMS: ReadonlyArray<CatalogItem> = [
  { id: 2000, name: "一般",     slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2001, name: "黝黑",     slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2002, name: "暗黑",     slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2003, name: "蒼白",     slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2004, name: "灰白",     slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2005, name: "草綠",     slot: "skin", isCash: false, requiredGender: 2, region: "GMS", version: "217" },
  { id: 2006, name: "金色",     slot: "skin", isCash: false, requiredGender: 2, region: "JMS", version: "390" },
  { id: 2007, name: "銀色",     slot: "skin", isCash: false, requiredGender: 2, region: "JMS", version: "390" },
  { id: 2008, name: "銅色",     slot: "skin", isCash: false, requiredGender: 2, region: "JMS", version: "390" },
  { id: 2009, name: "純白",     slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2010, name: "粉嫩",     slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2011, name: "陶土",     slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2012, name: "麥西迪斯", slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2013, name: "鬼怪",     slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2014, name: "粉紅",     slot: "skin", isCash: false, requiredGender: 2, region: "JMS", version: "390" },
  { id: 2015, name: "柔粉",     slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2016, name: "緋粉",     slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2017, name: "朦朧",     slot: "skin", isCash: false, requiredGender: 2, region: "JMS", version: "390" },
  { id: 2018, name: "薰衣草",   slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
  { id: 2019, name: "薰衣草頰", slot: "skin", isCash: false, requiredGender: 2, region: "KMS", version: "338" },
];
