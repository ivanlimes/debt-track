import { UiState } from "../appState.types";

export function openInspector(state: UiState): UiState {
  return {
    ...state,
    inspector: {
      ...state.inspector,
      isOpen: true,
    },
  };
}

export function closeInspector(state: UiState): UiState {
  return {
    ...state,
    inspector: {
      ...state.inspector,
      isOpen: false,
    },
  };
}

export function setInspectorMode(
  state: UiState,
  mode: UiState["inspector"]["mode"],
): UiState {
  return {
    ...state,
    inspector: {
      ...state.inspector,
      mode,
    },
  };
}
