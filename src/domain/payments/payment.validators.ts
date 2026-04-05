import { PAYMENT_TYPES, PaymentType } from "../shared/enums";
import { CreatePaymentRecordInput } from "./payment.types";

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function validatePaymentRecord(input: CreatePaymentRecordInput) {
  const errors: string[] = [];

  if (!input.cardId) errors.push("Payment must reference a card.");
  if (!Number.isFinite(input.amount) || input.amount <= 0) errors.push("Payment amount must be greater than zero.");
  if (!input.paymentDate) {
    errors.push("Payment date is required.");
  } else if (!isIsoDate(input.paymentDate)) {
    errors.push("Payment date must use ISO date format.");
  }

  if (!PAYMENT_TYPES.includes(input.paymentType as PaymentType)) {
    errors.push("Payment type is invalid.");
  }

  return errors;
}
