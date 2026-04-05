import { nowIsoDateTime } from "../shared/dates";
import { createStableId } from "../shared/ids";
import { AppPreferences, CreateAppPreferencesInput } from "./preferences.types";

export function createAppPreferences(
  input?: Partial<CreateAppPreferencesInput>,
): AppPreferences {
  const timestamp = nowIsoDateTime();

  return {
    id: createStableId("prefs"),
    themeMode: "dark",
    layoutSurfaceColorPreference: "default",
    currencyCode: "USD",
    defaultSort: "highest_monthly_interest",
    defaultFilter: "all_open",
    showClosedAccounts: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  };
}
