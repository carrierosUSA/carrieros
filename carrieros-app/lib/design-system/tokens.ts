/**
 * Transpo.ai design tokens — single source for spacing, radius, and control sizes.
 * Prefer CSS variables in components; use these constants when JS needs values.
 */

export const TRANSPO_SPACING = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
} as const;

export const TRANSPO_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const TRANSPO_CONTROL = {
  sm: 32,
  md: 40,
  lg: 44,
} as const;

export const TRANSPO_BRAND = {
  name: "Transpo.ai",
  tagline: "One Platform. Every Trucking Operation.",
  assistant: "Alph",
} as const;

/** Soft shadow utilities — keep shadows minimal */
export const TRANSPO_SHADOW = {
  sm: "shadow-[0_4px_16px_rgba(15,23,42,0.04)]",
  md: "shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
} as const;
