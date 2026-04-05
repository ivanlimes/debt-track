import { PayoffPlan } from "../../../domain/payoff-plan/payoffPlan.types";
import { PayoffPlanRepository } from "../../contracts/payoffPlanRepository";
import { StorageAdapter } from "../../contracts/storageAdapter";
import { serializePayoffPlan, deserializePayoffPlan } from "../../mappers/serializePayoffPlan";
import { STORE_NAMES } from "../db.schema";

export class IndexedDbPayoffPlanRepository implements PayoffPlanRepository {
  constructor(private readonly storageAdapter: StorageAdapter) {}

  async getActive(): Promise<PayoffPlan | null> {
    const records = await this.storageAdapter.getAll<unknown>(STORE_NAMES.payoffPlans);
    return deserializePayoffPlan(records[0] ?? null);
  }

  async save(activePlan: PayoffPlan): Promise<void> {
    await this.storageAdapter.clear(STORE_NAMES.payoffPlans);
    await this.storageAdapter.put(STORE_NAMES.payoffPlans, serializePayoffPlan(activePlan));
  }
}
