export const semanticColors = {
  background: {
    canvas: "#0f172a",
    elevated: "#111c31",
    panel: "rgba(15, 23, 42, 0.88)",
    panelMuted: "rgba(15, 23, 42, 0.52)",
  },
  border: {
    subtle: "rgba(148, 163, 184, 0.2)",
    strong: "rgba(148, 163, 184, 0.32)",
    accent: "rgba(96, 165, 250, 0.3)",
  },
  text: {
    primary: "#e2e8f0",
    secondary: "#94a3b8",
    muted: "#64748b",
    inverse: "#0f172a",
  },
  accent: {
    strong: "#2563eb",
    soft: "rgba(37, 99, 235, 0.18)",
    text: "#bfdbfe",
  },
  status: {
    success: "#0f766e",
    successSoft: "rgba(15, 118, 110, 0.18)",
    warning: "#d97706",
    warningSoft: "rgba(217, 119, 6, 0.18)",
    danger: "#b91c1c",
    dangerSoft: "rgba(185, 28, 28, 0.2)",
    neutralSoft: "rgba(148, 163, 184, 0.18)",
  },
} as const;

export type SemanticColors = typeof semanticColors;
