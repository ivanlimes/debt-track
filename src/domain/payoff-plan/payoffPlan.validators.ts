import { PAYOFF_STRATEGIES, PayoffStrategy } from "../shared/enums";
import { CreatePayoffPlanInput } from "./payoffPlan.types";

export function validatePayoffPlan(input: CreatePayoffPlanInput) {
  const errors: string[] = [];

  if (!PAYOFF_STRATEGIES.includes(input.strategy as PayoffStrategy)) {
    errors.push("Payoff strategy is invalid.");
  }

  if (!Number.isFinite(input.extraPaymentAmount) || input.extraPaymentAmount < 0) {
    errors.push("Extra payment amount cannot be negative.");
  }

  if (input.monthlyDebtBudget !== null && (!Number.isFinite(input.monthlyDebtBudget) || input.monthlyDebtBudget < 0)) {
    errors.push("Monthly debt budget cannot be negative.");
  }

  const hasDuplicatePriority = new Set(input.customPriorityOrder).size !== input.customPriorityOrder.length;
  if (hasDuplicatePriority) {
    errors.push("Custom priority order cannot contain duplicate accounts.");
  }

  if (input.strategy !== "custom" && input.customPriorityOrder.length > 0) {
    errors.push("Custom priority order is only used in custom strategy.");
  }

  return errors;
}
