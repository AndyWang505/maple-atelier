import { apiJson } from "../fetcher";
import { KEYS } from "../keys";
import type { TagCount } from "../types";

export const getTopTags = (limit = 20, init?: RequestInit) =>
  apiJson<TagCount[]>(KEYS.topTags(limit), init);
