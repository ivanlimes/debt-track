import { PAYMENT_TYPES, PaymentType } from "../../domain/shared/enums";
import { validatePaymentRecord } from "../../domain/payments/payment.validators";
import { PaymentRecord } from "../../domain/payments/payment.types";
import { isNullableString, isNumber, isRecord, isString } from "./shared";

export function serializePayment(payment: PaymentRecord): PaymentRecord {
  return { ...payment };
}

export function deserializePayment(value: unknown): PaymentRecord | null {
  if (!isRecord(value)) return null;

  const raw = value;

  const hasValidShape =
    isString(raw.id) &&
    isString(raw.cardId) &&
    isNumber(raw.amount) &&
    isString(raw.paymentDate) &&
    isString(raw.paymentType) &&
    PAYMENT_TYPES.includes(raw.paymentType as PaymentType) &&
    isNullableString(raw.notes) &&
    isString(raw.createdAt) &&
    isString(raw.updatedAt);

  if (!hasValidShape) return null;

  const candidate: PaymentRecord = {
    id: raw.id as string,
    cardId: raw.cardId as string,
    amount: raw.amount as number,
    paymentDate: raw.paymentDate as string,
    paymentType: raw.paymentType as PaymentType,
    notes: raw.notes as string | null,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };

  const validationErrors = validatePaymentRecord({
    cardId: candidate.cardId,
    amount: candidate.amount,
    paymentDate: candidate.paymentDate,
    paymentType: candidate.paymentType,
    notes: candidate.notes,
  });

  return validationErrors.length === 0 ? candidate : null;
}
