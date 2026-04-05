import { PaymentRecord } from "../../../domain/payments/payment.types";
import { PaymentRepository } from "../../contracts/paymentRepository";
import { StorageAdapter } from "../../contracts/storageAdapter";
import { serializePayment, deserializePayment } from "../../mappers/serializePayment";
import { STORE_NAMES } from "../db.schema";

export class IndexedDbPaymentRepository implements PaymentRepository {
  constructor(private readonly storageAdapter: StorageAdapter) {}

  async listAll(): Promise<PaymentRecord[]> {
    const records = await this.storageAdapter.getAll<unknown>(STORE_NAMES.payments);
    return records.map(deserializePayment).filter((record): record is PaymentRecord => record !== null);
  }

  async replaceAll(payments: PaymentRecord[]): Promise<void> {
    await this.storageAdapter.clear(STORE_NAMES.payments);

    for (const payment of payments) {
      await this.storageAdapter.put(STORE_NAMES.payments, serializePayment(payment));
    }
  }
}
