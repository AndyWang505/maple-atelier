"use client";

import useSWRMutation from "swr/mutation";
import { mutate as globalMutate } from "swr";
import { updateProfile } from "@/lib/api/clients/profile";
import { isPublicOutfitsKey } from "@/lib/api/keys";
import type { UpdateProfileBody } from "@/lib/api/types";

export function useApiUpdateProfile() {
  return useSWRMutation(
    "profile-update",
    async (_key, { arg }: { arg: UpdateProfileBody }) => {
      const result = await updateProfile(arg);
      void globalMutate(isPublicOutfitsKey, undefined, { revalidate: true });
      return result;
    },
  );
}
