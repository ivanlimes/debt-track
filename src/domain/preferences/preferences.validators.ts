import {
  FILTER_KEYS,
  LAYOUT_SURFACE_COLOR_PREFERENCES,
  SORT_KEYS,
  THEME_MODES,
} from "../shared/enums";
import { CreateAppPreferencesInput } from "./preferences.types";

export function validateAppPreferences(input: CreateAppPreferencesInput) {
  const errors: string[] = [];

  if (!THEME_MODES.includes(input.themeMode)) errors.push("Theme mode is invalid.");
  if (!LAYOUT_SURFACE_COLOR_PREFERENCES.includes(input.layoutSurfaceColorPreference)) {
    errors.push("Layout/surface color preference is invalid.");
  }
  if (!input.currencyCode) errors.push("Currency code is required.");
  if (!SORT_KEYS.includes(input.defaultSort)) errors.push("Default sort is invalid.");
  if (input.defaultFilter !== null && !FILTER_KEYS.includes(input.defaultFilter)) {
    errors.push("Default filter is invalid.");
  }

  return errors;
}
