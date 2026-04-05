import { validatePayoffPlan } from "../../domain/payoff-plan/payoffPlan.validators";
import { UpdatePayoffPlanInput } from "../../domain/payoff-plan/payoffPlan.types";
import { nowIsoDateTime } from "../../domain/shared/dates";
import { DomainState } from "../appState.types";

export function updatePayoffPlanInState(
  state: DomainState,
  patch: UpdatePayoffPlanInput,
): DomainState {
  const nextPlan = {
    ...state.activePayoffPlan,
    ...patch,
    updatedAt: nowIsoDateTime(),
  };

  const errors = validatePayoffPlan({
    strategy: nextPlan.strategy,
    monthlyDebtBudget: nextPlan.monthlyDebtBudget,
    extraPaymentAmount: nextPlan.extraPaymentAmount,
    customPriorityOrder: nextPlan.customPriorityOrder,
    useMinimumsFirst: nextPlan.useMinimumsFirst,
  });

  if (errors.length > 0) {
    return state;
  }

  return {
    ...state,
    activePayoffPlan: nextPlan,
  };
}
