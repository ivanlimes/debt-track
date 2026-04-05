import { PaymentType } from "../shared/enums";

export type PaymentRecord = {
  id: string;
  cardId: string;
  amount: number;
  paymentDate: string;
  paymentType: PaymentType;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentRecordInput = Omit<
  PaymentRecord,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdatePaymentRecordInput = Partial<
  Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">
>;
