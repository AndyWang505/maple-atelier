import { apiDelete, apiPut } from "./fetcher";

export interface UpdateProfileBody {
  displayName: string | null;
}

export interface UpdateProfileResponse {
  displayName: string | null;
}

export const updateProfile = (body: UpdateProfileBody) =>
  apiPut<UpdateProfileResponse>("/api/me/profile", body);

export const deleteAccount = () => apiDelete("/api/me");
