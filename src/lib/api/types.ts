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

export interface PublicOutfitsResponse {
  rows: PublicOutfitRow[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PublicOutfitsQuery {
  sort?: "hot" | "trending" | "new";
  tag?: string | null;
  q?: string;
  page?: number;
  limit?: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface VoteResponse {
  upvotes: number;
  liked: boolean;
}

export interface CreateOutfitBody {
  title: string;
  description?: string;
  payload: OutfitPayload;
  tags?: string[];
  isPublic?: boolean;
}

export type UpdateOutfitBody = Partial<CreateOutfitBody>;

export interface CreateOutfitResponse {
  id: number;
}
