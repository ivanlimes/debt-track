import { DomainState, UiState } from "../appState.types";

export function synchronizeUiWithDomain(state: UiState, domain: DomainState): UiState {
  let selectedAccountId = state.selection.selectedAccountId;
  let selectedPaymentId = state.selection.selectedPaymentId;

  if (selectedAccountId && !domain.accountsById[selectedAccountId]) {
    selectedAccountId = null;
  }

  const selectedPayment = selectedPaymentId ? domain.paymentsById[selectedPaymentId] ?? null : null;

  if (selectedPaymentId && !selectedPayment) {
    selectedPaymentId = null;
  }

  if (selectedPayment && domain.accountsById[selectedPayment.cardId]) {
    selectedAccountId = selectedPayment.cardId;
  }

  return {
    ...state,
    selection: {
      selectedAccountId,
      selectedPaymentId,
    },
    inspector: {
      ...state.inspector,
      isOpen: Boolean(selectedAccountId) ? state.inspector.isOpen : false,
    },
  };
}
