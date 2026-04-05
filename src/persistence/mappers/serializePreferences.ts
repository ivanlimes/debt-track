import {
  FILTER_KEYS,
  FilterKey,
  LAYOUT_SURFACE_COLOR_PREFERENCES,
  LayoutSurfaceColorPreference,
  SORT_KEYS,
  SortKey,
  THEME_MODES,
  ThemeMode,
} from "../../domain/shared/enums";
import { validateAppPreferences } from "../../domain/preferences/preferences.validators";
import { AppPreferences } from "../../domain/preferences/preferences.types";
import {
  isBoolean,
  isNullableString,
  isRecord,
  isString,
} from "./shared";

export function serializePreferences(preferences: AppPreferences): AppPreferences {
  return { ...preferences };
}

export function deserializePreferences(value: unknown): AppPreferences | null {
  if (!isRecord(value)) return null;

  const raw = value;
  const resolvedLayoutSurfaceColorPreference = isString(raw.layoutSurfaceColorPreference) &&
    LAYOUT_SURFACE_COLOR_PREFERENCES.includes(
      raw.layoutSurfaceColorPreference as LayoutSurfaceColorPreference,
    )
      ? (raw.layoutSurfaceColorPreference as LayoutSurfaceColorPreference)
      : "default";

  const hasValidShape =
    isString(raw.id) &&
    isString(raw.themeMode) &&
    THEME_MODES.includes(raw.themeMode as ThemeMode) &&
    isString(raw.currencyCode) &&
    isString(raw.defaultSort) &&
    SORT_KEYS.includes(raw.defaultSort as SortKey) &&
    isNullableString(raw.defaultFilter) &&
    (raw.defaultFilter === null || FILTER_KEYS.includes(raw.defaultFilter as FilterKey)) &&
    isBoolean(raw.showClosedAccounts) &&
    isString(raw.createdAt) &&
    isString(raw.updatedAt);

  if (!hasValidShape) return null;

  const candidate: AppPreferences = {
    id: raw.id as string,
    themeMode: raw.themeMode as ThemeMode,
    layoutSurfaceColorPreference: resolvedLayoutSurfaceColorPreference,
    currencyCode: raw.currencyCode as string,
    defaultSort: raw.defaultSort as SortKey,
    defaultFilter: raw.defaultFilter as FilterKey | null,
    showClosedAccounts: raw.showClosedAccounts as boolean,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };

  const validationErrors = validateAppPreferences({
    themeMode: candidate.themeMode,
    layoutSurfaceColorPreference: candidate.layoutSurfaceColorPreference,
    currencyCode: candidate.currencyCode,
    defaultSort: candidate.defaultSort,
    defaultFilter: candidate.defaultFilter,
    showClosedAccounts: candidate.showClosedAccounts,
  });

  return validationErrors.length === 0 ? candidate : null;
}
