import { createPaymentRecord } from "../../domain/payments/payment.defaults";
import {
  CreatePaymentRecordInput,
  PaymentRecord,
  UpdatePaymentRecordInput,
} from "../../domain/payments/payment.types";
import { validatePaymentRecord } from "../../domain/payments/payment.validators";
import { nowIsoDateTime } from "../../domain/shared/dates";
import { DomainState } from "../appState.types";

function isValidPaymentInput(state: DomainState, input: CreatePaymentRecordInput) {
  return state.accountsById[input.cardId] && validatePaymentRecord(input).length === 0;
}

export function createPaymentInState(
  state: DomainState,
  input: CreatePaymentRecordInput,
): DomainState {
  if (!isValidPaymentInput(state, input)) {
    return state;
  }

  const payment = createPaymentRecord(input);

  return {
    ...state,
    paymentsById: {
      ...state.paymentsById,
      [payment.id]: payment,
    },
    paymentOrder: [payment.id, ...state.paymentOrder],
  };
}

export function updatePaymentInState(
  state: DomainState,
  paymentId: string,
  patch: UpdatePaymentRecordInput,
): DomainState {
  const existing = state.paymentsById[paymentId];

  if (!existing) return state;

  const updated: PaymentRecord = {
    ...existing,
    ...patch,
    updatedAt: nowIsoDateTime(),
  };

  const nextInput: CreatePaymentRecordInput = {
    cardId: updated.cardId,
    amount: updated.amount,
    paymentDate: updated.paymentDate,
    paymentType: updated.paymentType,
    notes: updated.notes,
  };

  if (!isValidPaymentInput(state, nextInput)) {
    return state;
  }

  return {
    ...state,
    paymentsById: {
      ...state.paymentsById,
      [paymentId]: updated,
    },
  };
}

export function deletePaymentInState(
  state: DomainState,
  paymentId: string,
): DomainState {
  if (!state.paymentsById[paymentId]) return state;

  const paymentsById = { ...state.paymentsById };
  delete paymentsById[paymentId];

  return {
    ...state,
    paymentsById,
    paymentOrder: state.paymentOrder.filter((id) => id !== paymentId),
  };
}
