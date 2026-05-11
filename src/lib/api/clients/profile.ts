import { apiDelete, apiPut } from "../fetcher";
import type {
  UpdateProfileBody,
  UpdateProfileResponse,
} from "../types";

export const updateProfile = (body: UpdateProfileBody) =>
  apiPut<UpdateProfileResponse>("/api/me/profile", body);

export const deleteAccount = () => apiDelete("/api/me");
