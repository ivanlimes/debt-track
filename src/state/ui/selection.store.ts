import { UiState } from "../appState.types";

export function selectAccount(state: UiState, accountId: string | null): UiState {
  return {
    ...state,
    selection: {
      selectedAccountId: accountId,
      selectedPaymentId: null,
    },
  };
}

export function selectPayment(state: UiState, paymentId: string | null): UiState {
  return {
    ...state,
    selection: {
      ...state.selection,
      selectedPaymentId: paymentId,
    },
  };
}
