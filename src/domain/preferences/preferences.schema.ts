export const appPreferencesFieldSchema = {
  id: "string",
  themeMode: "dark | light | system",
  layoutSurfaceColorPreference: "default | neutral | slate | steel_blue | muted_teal | dark_plum",
  currencyCode: "string",
  defaultSort: "supported sort key",
  defaultFilter: "supported filter key | null",
  showClosedAccounts: "boolean",
  createdAt: "ISO datetime",
  updatedAt: "ISO datetime",
} as const;
