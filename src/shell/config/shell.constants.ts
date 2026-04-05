export const SHELL_DIMENSIONS = {
  topBarHeight: 64,
  leftNavWidth: 272,
  leftNavRailWidth: 72,
  inspectorWidth: 360,
  leftNavCollapsedBreakpoint: 1180,
  inspectorOverlayBreakpoint: 1024,
  mobileNavigationBreakpoint: 768,
} as const;

export const DESTINATION_CONTEXT: Record<
  "dashboard" | "cards" | "paymentPlan" | "calendar" | "settings",
  string
> = {
  dashboard: "Debt status, cost, and timing overview.",
  cards: "Account comparison surface with contextual inspection.",
  paymentPlan: "Strategy and projection workspace.",
  calendar: "Upcoming due dates, payments, and promo timing.",
  settings: "App-level preferences only.",
};
