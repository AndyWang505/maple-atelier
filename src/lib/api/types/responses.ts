import type { PublicOutfitRow } from "./models";

export interface PublicOutfitsResponse {
  rows: PublicOutfitRow[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface VoteResponse {
  upvotes: number;
  liked: boolean;
}

export interface CreateOutfitResponse {
  id: number;
}

export interface UpdateProfileResponse {
  displayName: string | null;
}
