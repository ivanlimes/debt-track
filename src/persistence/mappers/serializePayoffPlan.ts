import { PAYOFF_STRATEGIES, PayoffStrategy } from "../../domain/shared/enums";
import { validatePayoffPlan } from "../../domain/payoff-plan/payoffPlan.validators";
import { PayoffPlan } from "../../domain/payoff-plan/payoffPlan.types";
import {
  isBoolean,
  isNullableNumber,
  isNumber,
  isRecord,
  isString,
  isStringArray,
} from "./shared";

export function serializePayoffPlan(payoffPlan: PayoffPlan): PayoffPlan {
  return { ...payoffPlan };
}

export function deserializePayoffPlan(value: unknown): PayoffPlan | null {
  if (!isRecord(value)) return null;

  const raw = value;

  const hasValidShape =
    isString(raw.id) &&
    isString(raw.strategy) &&
    PAYOFF_STRATEGIES.includes(raw.strategy as PayoffStrategy) &&
    isNullableNumber(raw.monthlyDebtBudget) &&
    isNumber(raw.extraPaymentAmount) &&
    isStringArray(raw.customPriorityOrder) &&
    isBoolean(raw.useMinimumsFirst) &&
    isString(raw.createdAt) &&
    isString(raw.updatedAt);

  if (!hasValidShape) return null;

  const candidate: PayoffPlan = {
    id: raw.id as string,
    strategy: raw.strategy as PayoffStrategy,
    monthlyDebtBudget: raw.monthlyDebtBudget as number | null,
    extraPaymentAmount: raw.extraPaymentAmount as number,
    customPriorityOrder: raw.customPriorityOrder as string[],
    useMinimumsFirst: raw.useMinimumsFirst as boolean,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };

  const validationErrors = validatePayoffPlan({
    strategy: candidate.strategy,
    monthlyDebtBudget: candidate.monthlyDebtBudget,
    extraPaymentAmount: candidate.extraPaymentAmount,
    customPriorityOrder: candidate.customPriorityOrder,
    useMinimumsFirst: candidate.useMinimumsFirst,
  });

  return validationErrors.length === 0 ? candidate : null;
}
