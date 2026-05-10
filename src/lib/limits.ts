export const MAX_OUTFITS_PER_USER = 20;

export const OUTFIT_LIMITS = {
  titleLen: 16,
  descriptionLen: 200,
  maxTags: 3,
  tagLen: 8,
} as const;

export const DISPLAY_NAME_MAX_LEN = 24;

// Stricter than title/description: letters + digits only (unicode-aware).
export const TAG_VALID_REGEX = /^[\p{L}\p{N}]+$/u;
