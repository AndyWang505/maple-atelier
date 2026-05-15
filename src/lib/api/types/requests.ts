import type { OutfitPayload } from "@/db/schema";

export interface CreateOutfitBody {
  title: string;
  description?: string;
  payload: OutfitPayload;
  tags?: string[];
  isPublic?: boolean;
}

export type UpdateOutfitBody = Partial<CreateOutfitBody>;

export interface PublicOutfitsQuery {
  sort?: "hot" | "trending" | "new" | "oldest";
  tag?: string | null;
  q?: string;
  page?: number;
  limit?: number;
}

export interface UpdateProfileBody {
  displayName: string | null;
}
