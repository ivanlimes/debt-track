import { createEmptyPaymentRecordDraft } from "../../domain/payments/payment.defaults";
import { CreatePaymentRecordInput, PaymentRecord } from "../../domain/payments/payment.types";
import { validatePaymentRecord } from "../../domain/payments/payment.validators";
import { PaymentType } from "../../domain/shared/enums";
import { FieldErrorMap } from "../shared/form.types";
import { validationMessages } from "../shared/validationMessages";

export type PaymentFormState = {
  cardId: string;
  amount: string;
  paymentDate: string;
  paymentType: PaymentType;
  notes: string;
};

export function createPaymentFormState(payment?: PaymentRecord | null, cardId?: string): PaymentFormState {
  const source = payment ?? createEmptyPaymentRecordDraft(cardId ?? "");

  return {
    cardId: source.cardId,
    amount: String(source.amount),
    paymentDate: source.paymentDate,
    paymentType: source.paymentType,
    notes: source.notes ?? "",
  };
}

export function mapPaymentFormToInput(form: PaymentFormState): CreatePaymentRecordInput {
  return {
    cardId: form.cardId,
    amount: Number(form.amount.trim()),
    paymentDate: form.paymentDate.trim(),
    paymentType: form.paymentType,
    notes: form.notes.trim() ? form.notes.trim() : null,
  };
}

export function validatePaymentForm(form: PaymentFormState): FieldErrorMap {
  const errors: FieldErrorMap = {};
  const input = mapPaymentFormToInput(form);

  if (!input.cardId) {
    errors.cardId = validationMessages.requiredCardReference;
  }

  if (!form.amount.trim() || Number.isNaN(input.amount)) {
    errors.amount = validationMessages.numberRequired;
  }

  const schemaMessages = validatePaymentRecord(input);
  for (const message of schemaMessages) {
    if (message.includes("reference")) errors.cardId = message;
    if (message.includes("amount")) errors.amount = message;
    if (message.includes("date")) errors.paymentDate = message;
  }

  return errors;
}
