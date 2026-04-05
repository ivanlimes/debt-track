import { PaymentRecord } from "../../domain/payments/payment.types";

export interface PaymentRepository {
  listAll(): Promise<PaymentRecord[]>;
  replaceAll(payments: PaymentRecord[]): Promise<void>;
}
