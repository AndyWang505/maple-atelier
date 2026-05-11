import { apiDelete, apiJson, apiPost, apiPut } from "../fetcher";
import { KEYS } from "../keys";
import type {
  CreateOutfitBody,
  CreateOutfitResponse,
  MyOutfitRow,
  PublicOutfitsQuery,
  PublicOutfitsResponse,
  UpdateOutfitBody,
  VoteResponse,
} from "../types";

/** typed wrappers — UI / hook 都從這邊呼叫,不直接 fetch */

export const getPublicOutfits = (
  params: PublicOutfitsQuery,
  init?: RequestInit,
) => apiJson<PublicOutfitsResponse>(KEYS.publicOutfits(params), init);

export const getMyOutfits = (init?: RequestInit) =>
  apiJson<MyOutfitRow[]>(KEYS.myOutfits(), init);

export const voteOutfit = (id: number, liked: boolean) =>
  apiPost<VoteResponse>(`/api/outfits/${id}/vote`, { liked });

export const deleteOutfit = (id: number) => apiDelete(`/api/outfits/${id}`);

export const updateOutfit = (id: number, body: UpdateOutfitBody) =>
  apiPut<Partial<MyOutfitRow>>(`/api/outfits/${id}`, body);

export const createOutfit = (body: CreateOutfitBody) =>
  apiPost<CreateOutfitResponse>("/api/outfits", body);
