import { nowIsoDateTime } from "../shared/dates";
import { createStableId } from "../shared/ids";
import { CreatePayoffPlanInput, PayoffPlan } from "./payoffPlan.types";

export function createPayoffPlan(input?: Partial<CreatePayoffPlanInput>): PayoffPlan {
  const timestamp = nowIsoDateTime();

  return {
    id: createStableId("plan"),
    strategy: "avalanche",
    monthlyDebtBudget: null,
    extraPaymentAmount: 0,
    customPriorityOrder: [],
    useMinimumsFirst: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  };
}
