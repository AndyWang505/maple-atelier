import type { OutfitPayload } from "@/db/schema";

interface OutfitBase {
  id: number;
  title: string;
  description: string | null;
  payload: OutfitPayload;
  tags: string[] | null;
  upvotes: number;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PublicOutfitRow extends OutfitBase {
  userId: string;
  authorName: string | null;
  authorImage: string | null;
  liked: boolean;
}

export type MyOutfitRow = OutfitBase;

export interface TagCount {
  tag: string;
  count: number;
}
