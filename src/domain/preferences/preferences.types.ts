import {
  FilterKey,
  LayoutSurfaceColorPreference,
  SortKey,
  ThemeMode,
} from "../shared/enums";

export type AppPreferences = {
  id: string;
  themeMode: ThemeMode;
  layoutSurfaceColorPreference: LayoutSurfaceColorPreference;
  currencyCode: string;
  defaultSort: SortKey;
  defaultFilter: FilterKey | null;
  showClosedAccounts: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAppPreferencesInput = Omit<
  AppPreferences,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateAppPreferencesInput = Partial<
  Omit<AppPreferences, "id" | "createdAt" | "updatedAt">
>;
