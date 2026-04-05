export const tokens = {
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 10,
    xl: 14,
    pill: 999,
  },
  typography: {
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: 500,
    },
    bodySm: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: 400,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: 400,
    },
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: 600,
    },
    titleSm: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: 600,
    },
    title: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: 600,
    },
    display: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: 700,
    },
  },
  elevation: {
    soft: "0 20px 48px rgba(2, 8, 23, 0.26), 0 2px 0 rgba(255, 255, 255, 0.03) inset",
    medium: "0 24px 52px rgba(2, 8, 23, 0.3), 0 2px 0 rgba(255, 255, 255, 0.04) inset",
    overlay: "0 28px 72px rgba(2, 8, 23, 0.38), 0 2px 0 rgba(255, 255, 255, 0.04) inset",
  },
  paneWidths: {
    navExpanded: 272,
    navRail: 72,
    inspector: 360,
  },
} as const;

export type AppTokens = typeof tokens;
