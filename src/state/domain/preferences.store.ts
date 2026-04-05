import { UpdateAppPreferencesInput } from "../../domain/preferences/preferences.types";
import { nowIsoDateTime } from "../../domain/shared/dates";
import { DomainState } from "../appState.types";

export function updatePreferencesInState(
  state: DomainState,
  patch: UpdateAppPreferencesInput,
): DomainState {
  return {
    ...state,
    preferences: {
      ...state.preferences,
      ...patch,
      updatedAt: nowIsoDateTime(),
    },
  };
}
