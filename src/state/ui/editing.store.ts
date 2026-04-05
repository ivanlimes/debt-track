import { EditingState, UiState } from "../appState.types";

export function startEditing(
  state: UiState,
  activeFlow: NonNullable<EditingState["activeFlow"]>,
  targetId: string | null = null,
): UiState {
  return {
    ...state,
    editing: {
      activeFlow,
      targetId,
    },
  };
}

export function stopEditing(state: UiState): UiState {
  return {
    ...state,
    editing: {
      activeFlow: null,
      targetId: null,
    },
  };
}
