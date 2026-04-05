import { nowIsoDate, nowIsoDateTime } from "../shared/dates";
import { createStableId } from "../shared/ids";
import { CreatePaymentRecordInput, PaymentRecord } from "./payment.types";

export function createPaymentRecord(input: CreatePaymentRecordInput): PaymentRecord {
  const timestamp = nowIsoDateTime();

  return {
    id: createStableId("payment"),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  };
}

export function createEmptyPaymentRecordDraft(cardId = ""): CreatePaymentRecordInput {
  return {
    cardId,
    amount: 0,
    paymentDate: nowIsoDate(),
    paymentType: "manual",
    notes: null,
  };
}
