import { NavigationDestination, UiState } from "../appState.types";

export function setActiveDestination(
  state: UiState,
  destination: NavigationDestination,
): UiState {
  return {
    ...state,
    navigation: {
      activeDestination: destination,
    },
  };
}
