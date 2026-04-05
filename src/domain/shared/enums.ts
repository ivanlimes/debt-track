export const SORT_KEYS = [
  "lowest_balance",
  "highest_balance",
  "lowest_utilization",
  "highest_utilization",
  "highest_apr",
  "lowest_apr",
  "highest_monthly_interest",
  "soonest_due_date",
  "soonest_payoff",
  "promo_ending_soon",
  "issuer_az",
  "card_name_az",
] as const;

export const FILTER_KEYS = [
  "all_open",
  "due_soon",
  "overdue",
  "high_utilization",
  "promo_active",
  "promo_ending_soon",
  "closest_to_payoff",
  "largest_balance",
  "highest_interest_cost",
  "closed_accounts",
] as const;

export const PAYMENT_TYPES = ["manual", "autopay", "extra", "statement"] as const;
export const PAYOFF_STRATEGIES = ["avalanche", "snowball", "custom"] as const;
export const THEME_MODES = ["dark", "light", "system"] as const;
export const LAYOUT_SURFACE_COLOR_PREFERENCES = ["default", "neutral", "slate", "steel_blue", "muted_teal", "dark_plum"] as const;

export type SortKey = (typeof SORT_KEYS)[number];
export type FilterKey = (typeof FILTER_KEYS)[number];
export type PaymentType = (typeof PAYMENT_TYPES)[number];
export type PayoffStrategy = (typeof PAYOFF_STRATEGIES)[number];
export type ThemeMode = (typeof THEME_MODES)[number];
export type LayoutSurfaceColorPreference = (typeof LAYOUT_SURFACE_COLOR_PREFERENCES)[number];
