import { PayoffPlan } from "../../domain/payoff-plan/payoffPlan.types";

export interface PayoffPlanRepository {
  getActive(): Promise<PayoffPlan | null>;
  save(activePlan: PayoffPlan): Promise<void>;
}
