"use client";

import useSWR from "swr";
import { getTopTags } from "@/lib/api/clients/tags";
import { KEYS } from "@/lib/api/keys";
import type { TagCount } from "@/lib/api/types";

export function useApiTopTags(limit = 20, fallbackData?: TagCount[]) {
  return useSWR<TagCount[]>(KEYS.topTags(limit), () => getTopTags(limit), {
    fallbackData,
  });
}
